const express = require('express');
const Router = express.Router();
//const mongoose = require('mongoose');
const passport = require('passport');
const CalEvent = require('../models/calEvents');
const { checkIdIsValid, checkString } = require('../utils/validate');

//protected endpoints with jwt
Router.use('/', passport.authenticate('jwt', {session : false, failWithError: true }));
//get all events route
Router.get('/', (req, res, next)=>{
    const userId = req.user.id;
    return CalEvent.find({userId})
    .then((response)=>{
        res.json(response);
    })
    .catch(error=>{
        return next(error);
    });
});
//get a single event
Router.get('/:id', (req, res, next)=>{
    const id = req.params.id;
    const userId = req.user.id;
    //test id is valid
    if(!checkIdIsValid(id)){
        const err = new Error('Invalid id in request body');
        err.status = 400;
        return next(err);
    }
    return CalEvent.find({"_id":id, userId})
    .then(data=> {
        if(data.id){
        res.json(data);
        }
        else {
            const err = new Error("Id not found in database!");
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=> next(err));
});
//post new event route
Router.post('/', (req, res, next)=>{
    let { title, patientId, medId, start, end } = req.body;
    const userId = req.user.id;
    //validate body ^^
    //need to add a val check for start& end,**
    if(!checkString(title)){
        title = "Default title for now";//change me later
    }
    if(!checkIdIsValid(patientId, medId, userId)){
        const err = new Error('Invalid id in request body');
        err.status = 400;
        return next(err);
    }
    //cleared validations -- still need to test for ids belong to userId
    const newEvent = {title, patientId, medId, userId, start /*, end*/};
    console.log("1", newEvent);
    return CalEvent.insertMany(newEvent, {new: true})
    .then((data) => {
        console.log("2", data);
        res.json(data[0]);
    })
    .catch(err=> {
        console.log("3", err);
        next(err)});
});
//put events route
Router.put('/:id', (req, res, next)=>{
    let { title, patientId, medId } = req.body;
    const userId = req.user.id;
    const id = req.params.id;
    //validate body ^^ and also id
    const goodId = checkIdIsValid(id);
    if(!goodId) {
        const err = new Error('invalid Id in url');
        err.status = 400;
        return next(err);
    }
    if(!checkString(title)){
        title = "Default title for now";//change me later
    }
    if(!checkIdIsValid(patientId, medId, userId)){
        const err = new Error('Invalid id in request body');
        err.status = 400;
        return next(err);
    }
    //cleared valids -- still need to test for ids belong to userId
    const updateEvent = {title, patientId, medId};
    return CalEvent.findOneAndUpdate({"_id": id, userId}, updateEvent, {new : true})
        .then(data => res.json(data))
        .catch(err => next(err));
});
Router.delete('/:id', (req, res, next)=>{
    const id = req.params.id;
    const userId = req.user.id;
    //check id
    const goodId = checkIdIsValid(id);
    if(!goodId) {
        const err = new Error('invalid Id in url');
        err.status = 400;
        return next(err);
    }
    //also check if event belongs to userId
    //delete it
    return CalEvent.findOneAndRemove({"_id": id, userId})
        .then(()=>{
            //send back all the user's remaining events so their state will be correctly set.
            return CalEvent.find({userId})
                .then(data=>res.json(data))
                .catch(err=>next(err));
        })
        .catch(err=> next(err));
});
module.exports =  Router ;