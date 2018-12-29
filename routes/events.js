const express = require('express');
const Router = express.Router();
//const mongoose = require('mongoose');
const passport = require('passport');
const CalEvent = require('../models/calEvents');
const { checkIdIsValid, checkString, checkTime } = require('../utils/validate');
const Med = require('../models/meds');
const moment = require('moment');

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
    let { title, patientId, medId, start/*, end*/ } = req.body;
    const userId = req.user.id;
    //validate body ^^
    if(!checkString(title)){
        title = "Default title for now";//change me later
    }
    if(!checkIdIsValid(patientId, medId, userId)){
        const err = new Error('Invalid id in request body');
        err.status = 400;
        return next(err);
    }
    if(!checkTime(start)){
        const err = new Error('Invalid time in request body');
        err.status = 400;
        return next(err);
    }
    //cleared validations -- still need to test for ids belong to userId
    const newEvent = {title, patientId, medId, userId, start /*, end*/};
    let startingTime = start;
    // let beginningOfDay = start;
    let allEvents = [];
    allEvents.push(newEvent);
    return Med.find({"_id": medId, userId})
    .then(medsArray=>{
            let whichMed = medsArray[0];
            // let dosesPerDay = Math.round(24/whichMed.rateAmount);
            // for(let x = 0; x < whichMed.howLongAmount; x++){//loops through 1 pass= 1 day for all the needed days.
            //     for(let y = 1; y <= dosesPerDay; y++){
            //         allEvents.push(Object.assign({}, newEvent, {"start" : moment(startingTime).add(whichMed.rateAmount, 'hours').format()}));
            //         startingTime = moment(startingTime).add(whichMed.rateAmount, 'hours').format();
            //     }
            //     beginningOfDay = moment(beginningOfDay).add(1, 'day').format();
            //     startingTime = moment(beginningOfDay).format();
            // }
            let totalNumberOfHours = (whichMed.howLongAmount * 24);
            for(let i=0; i < totalNumberOfHours; i += whichMed.rateAmount){
                allEvents.push(Object.assign({}, newEvent, {"start": moment(startingTime).add(whichMed.rateAmount, 'hours').format()}));
                startingTime = moment(startingTime).add(whichMed.rateAmount, 'hours').format();
            }//this loop should do the same thing as the commented out one..
        return CalEvent.insertMany(allEvents, {new: true})
        .then((data) => {
            res.json(data);
        })
    })
    .catch(err=> {
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
Router.delete('/future/', (req, res, next)=>{
    const { medId, patientId } = req.body;
    //check id
    const goodId = checkIdIsValid(medId, patientId);
    if(!goodId) {
        const err = new Error('invalid medicine in request');
        err.status = 400;
        return next(err);
    }
    const userId = req.user.id;
    const stopNow = moment().format();
    return CalEvent.find({userId, medId, patientId}).select({'start': 1, "_id": 0})
        .then(theData=>{
            let results = theData.filter(eachEvent=> moment(eachEvent["start"]).isAfter(stopNow));
            let results2 = results.map(each=> each.start);
            CalEvent.deleteMany({userId, medId, patientId, "start" : {$in : results2 }} )
            .then(()=>{
                return CalEvent.find({userId})
                    .then(allEventsForAllTheirMeds=> {
                        res.json(allEventsForAllTheirMeds)
                    });
            })
        })
        .catch(err=>{
            return next(err)});
});

Router.delete('/one/:id', (req, res, next)=>{
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