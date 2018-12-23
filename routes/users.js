const express = require('express');
const Router = express.Router();
const passport = require('passport');

//protected endpoints with jwt
Router.use('/', passport.authenticate('jwt', {session : false, failWithError: true }));
//get all users route
Router.get('/', (req, res, next)=>{
    res.status(200).json({"a-": "-ok"});
});

module.exports = Router;