const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');
//Route handlers:
const loginRoute = require('./routes/login');
const authRouter = require('./routes/authorize');
const usersRoutes = require('./routes/users');
const patientsRoutes = require('./routes/patients');
const medsRoutes = require('./routes/meds');
const eventRoutes = require('./routes/events');

mongoose.Promise = global.Promise;
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
mongoose.set('autoIndex', false);
// require('dotenv').config();

const { PORT, DATABASE_URL } = require('./config');

passport.use(localStrategy);
passport.use(jwtStrategy);
app.use(express.json());
app.use(morgan('common'));

// CORS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

app.use(express.static('public'));

//main routes here:

app.use('/', loginRoute);// for '/' homepage to register
app.use('/', authRouter);// for /login and /refresh routes
app.use('/api/users', usersRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/meds', medsRoutes);
app.use('/api/events', eventRoutes);

//catch-all route:
app.use('*', (req, res, next) => {
    return res.status(404).json({ message: 'Not Found' });
});

//handle errors here:
app.use('*', (err, req, res, next)=>{
    const error = err || new Error("Internal system malfunction");
    error.status = err.status || 500;
    error.reason = err.reason || "Unknown Reason";
    res.status(error.status).json({error});
});//reminder to test this error obj ^^

let server;
function runServer(DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server.. have a nice day');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.log(err));
}

module.exports = { app, runServer, closeServer };