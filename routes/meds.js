const express = require('express');
const Router = express.Router();
const passport = require('passport');
const Med = require('../models/meds');
const Log = require('../models/logs');
const Patient = require('../models/patients');
const CalEvent = require('../models/calEvents');
const moment = require('moment');
const { checkIdIsValid, checkArray, checkNumberAboveZero, checkString } = require('../utils/validate');

//protected endpoints with jwt
Router.use('/', passport.authenticate('jwt', {session : false, failWithError: true }));
//get all meds route
Router.get('/', (req, res, next)=>{
    const userId = req.user.id;
    return Med.find({"userId": userId})
        .then(data => res.json(data))
        .catch(err=>next(err));
});
//get a med
Router.get('/:id', (req, res, next)=>{
    const { id } = req.params;
    const goodId = checkIdIsValid(id);
    if(!goodId){
        const err = new Error("Invalid id in url");
        err.status = 400;
        return next(err);
    }
    const userId = req.user.id;
    return Med.find({"_id": id, "userId": userId})
        .then(data => res.json(data))
        .catch(err=>next(err));
});
//create new med
Router.post('/', (req, res, next)=>{
    const userId = req.user.id;
    let { name, dosage, rateAmount,  howLongAmount } = req.body;
    const goodStrings = checkArray([name, dosage]);
    if(!goodStrings){
        const err = new Error("Missing data in request body");
        err.status = 400;
        return next(err);
    }
    if(!checkNumberAboveZero(rateAmount)|| !checkNumberAboveZero(howLongAmount)){
        const err = new Error("Bad dosage amount in request body");
        err.status = 400;
        return next(err);
    }
    rateAmount = Number(rateAmount);
    howLongAmount = Number(howLongAmount);
    return Med.create({userId, name, dosage, rateAmount, howLongAmount })
        .then(data=>res.json(data))
        .catch(err=>next(err));
});
//update a med
Router.put('/:id', (req, res, next)=>{
    const {id} = req.params;
    const goodId = checkIdIsValid(id);
    if(!goodId){
        const err = new Error("Invalid id in url");
        err.status = 400;
        return next(err);
    }
    const userId = req.user.id;
    let { name, dosage, rateAmount, howLongAmount } = req.body;
    const updateObj = {};
    if(checkNumberAboveZero(rateAmount)){
        updateObj['rateAmount'] = Number(rateAmount);
    }
    if(checkNumberAboveZero(howLongAmount)){
        updateObj['howLongAmount'] = Number(howLongAmount);
    }
    if(checkString(name)){
        updateObj['name'] = name;
    }
    if(checkString(dosage)){
        updateObj['dosage'] = dosage;
    }
    return Med.findOneAndUpdate({userId, "_id": id} , updateObj, {$set: true, new: true})
        .then(data=>{
            let scopeData = data;
            if(updateObj['name']){
                Patient.updateMany({userId, 'medsCurrentlyOn._id': {$in: id}}, {$set : {'medsCurrentlyOn.$.name' : name }})
                   .then(()=>res.json(scopeData))
            } else {
                return res.json(data);
            }
        })
        .catch(err=>next(err));
});
//remove a med
Router.delete('/:id', (req, res, next)=>{
    const {id} = req.params;
    const goodId = checkIdIsValid(id);
    if(!goodId){
        const err = new Error("Invalid id in url");
        err.status = 400;
        return next(err);
    }
    const userId = req.user.id;
    const keepPastEventsForRecord = moment().format();
    return Promise.all([
        Med.findOneAndRemove({"_id": id, "userId": userId}),
        Log.deleteMany({userId, "medId": id}),
        CalEvent.deleteMany({userId, "medId": id, "start": {$gt: keepPastEventsForRecord}}),
        Patient.updateMany({userId}, {$pull : {"medsCurrentlyOn" : {"_id" : id }}})
     ])
        .then(()=>{
            return Med.find({"userId" : userId})
                .then(data=>res.json(data))
                .catch(err=>next(err));
        })
        .catch(err=>next(err));
});

module.exports = Router;