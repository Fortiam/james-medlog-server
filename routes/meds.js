const express = require('express');
const Router = express.Router();
const passport = require('passport');
const Med = require('../models/meds');
const User = require('../models/users');
const { checkIdIsValid, checkArray } = require('../utils/validate');
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
    let { name, dosage, rateAmount, rateInterval, howLongAmount, howLongForDays } = req.body;
    const goodStrings = checkArray([name, rateAmount, rateInterval, howLongForDays]);
    if(!goodStrings){
        const err = new Error("Missing data in request body");
        err.status = 400;
        return next(err);
    }
    if(parseInt(dosage) < 1 || parseInt(howLongAmount) < 1){
        const err = new Error("Bad dosage amount in request body");
        err.status = 400;
        return next(err);
    }
    return Med.create({userId, name, dosage, rateAmount, rateInterval, howLongAmount, howLongForDays})
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
    let { name, dosage, rateAmount, rateInterval, howLongAmount, howLongForDays } = req.body;
    const goodStrings = checkArray([name, rateAmount, rateInterval, howLongForDays]);
    if(!goodStrings){
        const err = new Error("Missing data in request body");
        err.status = 400;
        return next(err);
    }
    if(parseInt(dosage) < 1 || parseInt(howLongAmount) <1){
        const err = new Error("Bad dosage amount in request body");
        err.status = 400;
        return next(err);
    }
    return Med.findOneAndUpdate({userId, "_id": id} , {name, dosage, rateAmount, rateInterval, howLongAmount, howLongForDays}, {$set: true, new: true})
        .then(data=>res.json(data))
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
    return Med.findOneAndRemove({"_id": id, "userId": userId})
        .then(()=>{
            return Med.find({"userId" : userId})
                .then(data=>res.json(data))
                .catch(err=>next(err));
        })
        .catch(err=>next(err));
});

module.exports = Router;