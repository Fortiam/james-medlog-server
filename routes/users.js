const express = require('express');
const Router = express.Router();
const passport = require('passport');
const checkIdIsValid = require('../utils/validate');
const User = require('../models/users');

//protected endpoints with jwt
Router.use('/', passport.authenticate('jwt', {session : false, failWithError: true }));
//delete user self
Router.delete('/deleteMe/:id', function(req, res, next){
    const id = req.params.id;
    const userId = req.user.id;
    if(!checkIdIsValid(id)|| !checkIdIsValid(userId)){
        const err = new Error('Invalid id in request body');
        err.status = 400;
        return next(err);
    }
    return User.findOneAndRemove({id, userId})
        .then(()=>res.sendStatus(204))
        .catch(err=>next(err));
});

module.exports = Router;