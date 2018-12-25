const express = require('express');
const Router = express.Router();
const passport = require('passport');
const Patient = require('../models/patients');
//const mongoose = require('mongoose');
const { checkIdIsValid, checkString, trimName, addOnlyValidFields } = require('../utils/validate');

//   ***  all these endpoints are path off of: '/api/patients'  ***
//protected endpoints with jwt
Router.use('/', passport.authenticate('jwt', {session : false, failWithError: true }));
//get all patients route
Router.get('/', (req, res, next)=>{
    //grab their id from the token
    const userId = req.user.id;
    return Patient.find({"userId": userId })
    .then(data=>{
        console.log("*need to check this line 16: ", data);
        res.json(data);
    })
    .catch(err=>next(err));
});
//get 1 patient info route
Router.get('/:id', (req, res, next)=>{
    const id = req.params.id;
    //validate id
    const goodId = checkIdIsValid(id);
    if(!goodId){
        const err = new Error("Invalid id in url");
        err.status = 400;
        return next(err);
    }
    const userId = req.user.id;
    return Patient.findOne({"_id": id, "userId": userId})
        .then(data=>{
            console.log("testme: ", data);
            res.json(data);
        })
        .catch(err=>next(err));
});
//create a new patient route
Router.post('/', (req, res, next)=>{
    const userId = req.user.id;
    let { name, age, gender, height, weight/*, allergies, doctor*/ } = req.body;
    //name is technically the only required field
    const goodName = checkString(name);
    if(!goodName){
        const err = new Error("Name must be at least 1 character!");
        err.status = 400;
        return next(err);
    }
    name = trimName(name);
    const optionalFields = ["age", "gender", "height", "weight"/*, "doctor"*/];
    const checkFields = [age, gender, height, weight/*, doctor*/];
    //doctor is an object of name and email sub-fields..
    //allergies is an array of strings so we'll handle that logic seperate?
    //we'll come back to ^that after seeing if this logic even works..
    //also reminder we need to kick the habit of using the royal we in comments
    const newPatientObject = addOnlyValidFields(optionalFields, checkFields, name, userId);
    //now all the fields that have something should be in newPatientObject
    console.log("age matches check: ", newPatientObject);//expect age: 30 etc
    return Patient.create(newPatientObject)
        .then(data=>res.json(data))
        .catch(err=> {
            if(err.code === 11000){
                err = new Error('The Patient name already exists');
                err.status = 400;
                err.reason = 'The Patient name already exists';
            }//should never get this ^, name is not a unique schema field
            next(err);
        });
});
//update/edit a patient info route
Router.put('/:id', (req, res, next)=>{
    const id = req.params.id;
    const goodId = checkIdIsValid(id);
    if(!goodId){
        const err = new Error("Invalid id in url");
        err.status = 400;
        return next(err);
    }
    const userId = req.user.id;
    let { name, age, gender, height, weight/*, allergies, doctor*/ } = req.body;
    //name is technically the only required field
    const goodName = checkString(name);
    if(!goodName){
        const err = new Error("Name must be at least 1 character!");
        err.status = 400;
        return next(err);
    }
    name = trimName(name);
    const optionalFields = ["age", "gender", "height", "weight"];
    const checkFields = [age, gender, height, weight];
    const newPatientObject = addOnlyValidFields(optionalFields, checkFields, name, userId);
    return Patient.findOneAndUpdate({"_id": id, "userId": userId}, newPatientObject, {$set: true, new: true})
        .then(data=> {
            console.log("here is after db update results: ", data);
            if(data){
            res.json(data)
            }
            else {
                const err = new Error("Id to update not found in database..");
                err.status = 404;
                return next(err);
            }
        })
        .catch(err=>{
            console.log("inevidable update error: ", err);
            next(err)});
});
//delete a patient (sad) route
Router.delete('/:id', (req, res, next)=>{
    const id = req.params.id;
    //validate id
    const goodId = checkIdIsValid(id);
    if(!goodId){
        const err = new Error("Invalid id in url");
        err.status = 400;
        return next(err);
    }
    const userId = req.user.id;
    return Patient.findOneAndRemove({"_id": id, "userId": userId})
        .then(()=>res.sendStatus(204))
        .catch(err=> next(err));
});

module.exports =  Router ;