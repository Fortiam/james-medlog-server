const express = require('express');
const Router = express.Router();
const passport = require('passport');
const { checkIdIsValid, checkUserIdExists, boolCheck, checkString, validEmailAddress } = require('../utils/validate');
const User = require('../models/users');

//protected endpoints with jwt
Router.use('/', passport.authenticate('jwt', {session : false, failWithError: true }));
//edit and update user account

Router.put('/update/:id', function(req, res, next){
    const id = req.params.id;
    const userId = req.user.id;
    if(!checkIdIsValid(id)|| !checkIdIsValid(userId)){
        const err = new Error('Invalid id in request body');
        err.status = 400;
        return next(err);
    }
    let { firstName, lastName, email, useEmailForApi, /*username, password*/ } = req.body;
    //validate optional fields
    const editedUser = {};
    if((useEmailForApi !== undefined)){
        const defaultFalse = boolCheck(useEmailForApi);
       editedUser["useEmailForApi"] = defaultFalse;
    }
    if(checkString(firstName)){
        editedUser["firstName"] = firstName;
    }//reminder to come back to these 3 funcs and merge the dry code
    if(checkString(lastName)){
        editedUser["lastName"] = lastName;
    }
    if(validEmailAddress(email)){
        editedUser["email"] = email;
    }
    return checkUserIdExists(userId, id, next)
    .then(isMatch => {
        if(isMatch){
            //here url id matches token id
            return User.findOneAndUpdate({_id: userId}, editedUser, {$set: true, new: true})
            .then((result=>{res.json(result)}))
            .catch(err=>next(err));
        }
        else {
            const err = new Error('Invalid id in request');
            err.status = 400;
            return next(err);
        }
    })
   .catch(err=>next(err));
});

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