const express = require('express');
const Router = express.Router();
const passport = require('passport');
const CalEvent = require('../models/calEvents');
const { checkIdIsValid, checkString, checkTime, checkNumberAboveZero } = require('../utils/validate');
const Med = require('../models/meds');
const Patient = require('../models/patients');
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
//list all events filtered by person or med 
Router.post('/filter', (req, res, next)=>{
    const userId = req.user.id;
    let { patientId, medId } = req.body;
    let filter = Object.assign({ userId });
    let goodPatient = checkIdIsValid(patientId);
    let goodMed = checkIdIsValid(medId);
    if (goodPatient){
        filter["patientId"] = patientId;
    }
    if (goodMed){
        filter["medId"] = medId;
    }
    return CalEvent.find(filter)
    .then((response)=>{
        res.json(response);
    })
    .catch(error=>{
        return next(error);
    });
});
//post new event route
Router.post('/', (req, res, next)=>{
    let { title, patientId, medId, start/*, end*/ } = req.body;
    const userId = req.user.id;
    //validate body
    if(!checkString(title)){
        title = "Default title";
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
    let allEvents = [];
    allEvents.push(newEvent);
    return Med.find({"_id": medId, userId})
    .then(medsArray=>{
            let whichMed = medsArray[0];
            let totalNumberOfHours = (whichMed.howLongAmount * 24);
            for(let i=0; i < totalNumberOfHours; i += whichMed.rateAmount){
                allEvents.push(Object.assign({}, newEvent, {"start": moment(startingTime).add(whichMed.rateAmount, 'hours').format()}));
                startingTime = moment(startingTime).add(whichMed.rateAmount, 'hours').format();
            }
        return Promise.all([CalEvent.insertMany(allEvents, {new: true}),
            Patient.findByIdAndUpdate(patientId, {$addToSet : {"medsCurrentlyOn": medsArray[0]}}, {$set: true, new: true})
        ])
        .then((data) => {
            //send back multiple arrays for client
            const twoFor = Object.assign({}, {"eventsData": data[0], "patientData": data[1]});
            res.json(twoFor);
        })
    })
    .catch(err=> {
        next(err)});
});
//change all events for a med, when a med rate is updated
Router.put('/', (req, res, next)=>{
    const userId = req.user.id;
    let { medId, rateAmount, howLongAmount } = req.body;
    const goodId = checkIdIsValid(medId);
    if(!goodId) {
        const err = new Error('invalid medicine in request');
        err.status = 400;
        return next(err);
    }
    if(!checkNumberAboveZero(rateAmount) || !checkNumberAboveZero(howLongAmount)){
        const err = new Error('invalid number value in request');
        err.status = 400;
        return next(err);
    }
    const stopNow = moment().format();
    return Promise.all([CalEvent.find({userId, medId }).sort('start'), Patient.find({userId})])// .sort on events start time here, maybe also sort on patients
        .then(doubleData=>{
            let oldEvents = doubleData[0];
            let persons = doubleData[1];
            let eventsToAlter = oldEvents.filter(eachOldie=> moment(eachOldie["start"]).isAfter(stopNow));
            let preFilter = [];
            let firstEventPerPerson =[];
            for(let i=0; i < persons.length; i++){
                //here we loop once through all the family
                const anEventVar = eventsToAlter.find((eventSingle)=>{
                    return eventSingle["patientId"].toString()===persons[i]["_id"].toString();});
                     preFilter.push(anEventVar);
            }
            preFilter.forEach(each=> each?firstEventPerPerson.push(each):false);
            let newUpdatesEvents = [];
            let allEventsPerPerson = [];
            let startingTime = moment().format();
            let newEvent = {userId, medId /*need title and patientId */}; 
            let totalNumberOfHours = (howLongAmount * 24);
            for(let j=0; j < firstEventPerPerson.length;j++){
                //here we loop thru firstE and repopulate new events based off medId times,, which are now newly updated already
                for(let k=0; k < totalNumberOfHours; k += rateAmount){
                    //here we add to the  _final event obdate object_
                    allEventsPerPerson.push(Object.assign({}, newEvent, {"start": moment(startingTime).add(rateAmount, 'hours').format(), "patientId": firstEventPerPerson[j].patientId, title: "Updated Event!"}));
                    startingTime = moment(startingTime).add(rateAmount, 'hours').format();
                }
                //here we create the _final array out of _final objects^
            newUpdatesEvents.push(...allEventsPerPerson);
            }
            const delEvents = eventsToAlter.map(each=> each["start"]);
            CalEvent.deleteMany({ userId, medId, "start" : {$in : delEvents }}).then(()=>{
                 CalEvent.insertMany(newUpdatesEvents, {new: true})
                 .then(()=>CalEvent.find({userId}))
                    .then(finalData=> res.json(finalData))
            })
        })
        .catch(err=>{
            next(err)});
});

//put events route
Router.put('/:id', (req, res, next)=>{
    let { title, patientId, medId } = req.body;
    const userId = req.user.id;
    const id = req.params.id;
    //validate body and also id
    const goodId = checkIdIsValid(id);
    if(!goodId) {
        const err = new Error('invalid Id in url');
        err.status = 400;
        return next(err);
    }
    if(!checkString(title)){
        title = "Default title";
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
//this route is for removing only all future scheduled events, leaving the past events as a record
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
                    });//send response of all users SoT events so they can match client state to SoT directly
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
            //send back all the user's remaining events so their state will be correctly set to SoT.
            return CalEvent.find({userId})
                .then(data=>res.json(data))
                .catch(err=>next(err));
        })
        .catch(err=> next(err));
});

module.exports =  Router ;