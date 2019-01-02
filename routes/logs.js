const express = require('express');
const Router = express.Router();
const passport = require('passport');
const Med = require('../models/meds');
const User = require('../models/users');
const Patient = require('../models/patients');
const Log = require('../models/logs');

const { checkIdIsValid, checkArray, checkNumberAboveZero, checkString } = require('../utils/validate');
//protected endpoints with jwt
Router.use('/', passport.authenticate('jwt', {session : false, failWithError: true }));
//get all logs route
Router.get('/', (req, res, next)=>{
    const userId = req.user.id;
    return Log.find({"userId": userId})
        .then(data => res.json(data))
        .catch(err=>next(err));
});
//get a log
Router.get('/:id', (req, res, next)=>{
    const { id } = req.params;
    const goodId = checkIdIsValid(id);
    if(!goodId){
        const err = new Error("Invalid id in url");
        err.status = 400;
        return next(err);
    }
    const userId = req.user.id;
    return Log.find({"_id": id, "userId": userId})
        .then(data => res.json(data))
        .catch(err=>next(err));
});
//get filtered route, and _post_ so id's aren't sent in url
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
    return Log.find(filter)
    .then((response)=>{
        res.json(response);
    })
    .catch(error=>{
        return next(error);
    });
});
//create new log
Router.post('/', (req, res, next)=>{
    const userId = req.user.id;
    let { comment, medId, patientId,/*, rateInterval, howLongForDays*/ } = req.body;
    const goodStrings = checkString(comment);
    if(!goodStrings){
        const err = new Error("Missing data in request body");
        err.status = 400;
        return next(err);
    }

    const newEntry = Object.assign({}, {userId, "comment": comment})
    const goodMedId = checkIdIsValid(medId);
    const goodPatientId = checkIdIsValid(patientId);
    
    if(goodMedId){
        newEntry.medId = medId;//optional 
    }
    if(goodPatientId){
        newEntry.PatientId = patientId;//also optional
    }
    return Log.create(newEntry)
        .then(data=>res.json(data))
        .catch(err=>next(err));
});
//update a log
Router.put('/:id', (req, res, next)=>{
    const {id} = req.params;
    const goodId = checkIdIsValid(id);
    if(!goodId){
        const err = new Error("Invalid id in url");
        err.status = 400;
        return next(err);
    }
    const userId = req.user.id;
    let { medId, patientId, comment, removeMedId, removePatientId } = req.body;
    //validate user input
    //"comments": [{"comment": comment}]
    const goodMedId = checkIdIsValid(medId);
    const goodPatientId = checkIdIsValid(patientId);
    const updateLog = Object.assign({}, {userId});
    const goodString = checkString(comment);
    if(goodString){
        updateLog["comment"] = comment;
    }
    if(goodMedId){
        updateLog.medId = medId;//optional 
    } else if(removeMedId){
        updateLog.$unset = {'medId': true};
    }
    if(goodPatientId){
        updateLog.patientId = patientId;//also optional
    } else if(removePatientId){
        const newObject = Object.assign({}, updateLog.$unset, {'patientId': true});
        updateLog.$unset = newObject;
    }
    return Log.findOneAndUpdate({userId, "_id": id} , updateLog, {$set: true, new: true})
        .then(data=>res.json(data))
        .catch(err=>next(err));
});
//remove a log
Router.delete('/:id', (req, res, next)=>{
    const {id} = req.params;
    const goodId = checkIdIsValid(id);
    if(!goodId){
        const err = new Error("Invalid id in url");
        err.status = 400;
        return next(err);
    }
    const userId = req.user.id;
    return Log.findOneAndRemove({"_id": id, "userId": userId})
        .then(()=>{
            return Log.find({"userId" : userId})
                .then(data=>res.json(data))
                .catch(err=>next(err));
        })
        .catch(err=>next(err));
});

module.exports = Router;