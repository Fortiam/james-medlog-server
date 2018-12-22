const express = require('express');
const Router = express.Router();
const { Event } = require('../models/events');
const { checkIdIsValid, checkTitle, checkMedId, checkPatientId, checkUserId } = require('../utils/validate');

//get all events route
Router.get('/', (req, res, next)=>{
    return Event.find()
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
    //test id is valid
    if(!checkIdIsValid(id)){
        const err = new Error('Invalid id in request body');
        err.status = 400;
        return next(err);
    }
    return Event.findById(id)
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
    let { title, patientId, medId, userId } = req.body;
    //validate body ^^
    if(!checkTitle(title)){
        title = "Default title for now";//change me later
    }
    if(!checkIdIsValid(patientId, medId, userId)){
        const err = new Error('Invalid id in request body');
        err.status = 400;
        return next(err);
    }
    //cleared validations -- still need to test for ids belong to userId
    const newEvent = {title, patientId, medId, userId};
    return Event.insertMany(newEvent, {new: true})
    .then((data) => {
        res.json(data);
    })
    .catch(err=> next(err));
});
//put events route
Router.put('/:id', (req, res, next)=>{
    let { title, patientId, medId, userId } = req.body;
    const id = req.params.id;
    //validate body ^^ and also id
    const goodId = checkIdIsValid(id);
    if(!goodId) {
        const err = new Error('invalid Id in url');
        err.status = 400;
        return next(err);
    }
    if(!checkTitle(title)){
        title = "Default title for now";//change me later
    }
    if(!checkIdIsValid(patientId, medId, userId)){
        const err = new Error('Invalid id in request body');
        err.status = 400;
        return next(err);
    }
    //cleared valids -- still need to test for ids belong to userId
    const updateEvent = {title, patientId, medId, userId};
    return Event.findByIdAndUpdate(id, updateEvent, {new : true})
        .then(data => res.json(data))
        .catch(err => next(err));
});
Router.delete('/:id', (req, res, next)=>{
    const id = req.params.id;
    //check id
    const goodId = checkIdIsValid(id);
    if(!goodId) {
        const err = new Error('invalid Id in url');
        err.status = 400;
        return next(err);
    }
    //also check if event belongs to userId
    //delete it
    return Event.findByIdAndRemove(id)
        .then(()=>{
            res.status(204).json({"message": `event with id: ${id} has been deleted.`});
        })
        .catch(err=> next(err));
});
module.exports =  Router ;