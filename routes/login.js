const express = require('express');
const Router = express.Router();
const User = require('../models/users');
const { checkUsernameAndPassword, trimName } = require('../utils/validate');
//homepage, no token needed here (pre-login.js might have been better..?)
// Router.get('/', (req, res, next)=>{
//     //landing welcome page no un/pw, register form here
//     res.status(200).json({"a-": "-ok"});
// });

Router.post('/register', function(req, res, next){
    let { firstName, lastName, username, email, password, useEmailForApi } = req.body;
    //validate username and password
    const isLegit = checkUsernameAndPassword([username, password]);
    if(!isLegit.good){
        const err = new Error(`${isLegit.why} is not valid`);
        err.status = 403;
        return next(err);
    }
    firstName = trimName(firstName);
    lastName = trimName(lastName);
    return User.hashPassword(password)
        .then(digest=> {
            const newUser = {
                username,
                password: digest
            };
            const optionalFields = [firstName, lastName, email, useEmailForApi];
            optionalFields.forEach(field=> field? newUser[field]= field: null);
            return User.create(newUser);
        })
        .then(result=>{
            return res.status(201).location(`/register/${result.id}`).json(result);
        })
        .catch(err =>{
            if(err.code === 11000){
                err = new Error('The username already exists');
                err.status = 400;
            }
            next(err);  
        });
});

module.exports =  Router ;