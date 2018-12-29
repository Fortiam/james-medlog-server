const express = require('express');
const Router = express.Router();
const passport = require('passport');
const Patient = require('../models/patients');
const CalEvent = require('../models/calEvents');
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
            res.json(data);
        })
        .catch(err=>next(err));
});
//create a new patient route
Router.post('/', (req, res, next)=>{
    const userId = req.user.id;
    let { name, age, gender, height, weight, allergies, doctor } = req.body;
    //let { name : doctorName, contact : doctorContact} = req.body.doctor;
    //name is technically the only required field
    const goodName = checkString(name);
    if(!goodName){
        const err = new Error("Name must be at least 1 character!");
        err.status = 400;
        return next(err);
    }
    name = trimName(name);
    const optionalFields = ["age", "gender", "height", "weight", "allergies", "doctor"];
    const checkFields = [age, gender, height, weight, allergies, doctor];
    //doctor is an object of name and email sub-fields..
    //allergies is an array of strings so we'll handle that logic seperate?
    //we'll come back to ^that after seeing if this logic even works..
    //also reminder we need to kick the habit of using the royal we in comments
    const newPatientObject = addOnlyValidFields(optionalFields, checkFields, userId);
    newPatientObject["name"] = name;
    if(!doctor){
        newPatientObject.doctor = [{"name": "no doctor listed", "contact": "not listed"}];
    }
    //now all the fields that have something should be in newPatientObject
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
    let { name, age, gender, height, weight, allergies } = req.body;
    let doctorName = null;
    let doctorContact = null;
    if(req.body.doctor){
        if(req.body.doctor[0].name){
            doctorName = req.body.doctor[0].name;
        }
        if(req.body.doctor[0].contact){
            doctorContact = req.body.doctor[0].contact;
        }
    }
    if(name){
        const goodName = checkString(name);
        if(!goodName){
            const err = new Error("Name must be at least 1 character!");
            err.status = 400;
            return next(err);
        }
        name = trimName(name);
    }
    const optionalFields = ["name", "age", "gender", "height", "weight", "allergies"];
    const checkFields = [name, age, gender, height, weight, allergies];
    const newPatientObject = addOnlyValidFields(optionalFields, checkFields, userId);
    newPatientObject.doctor = [{}];
    if(doctorName!= null){
        newPatientObject.doctor[0].name = doctorName;
    }
    if(doctorContact != null){
        newPatientObject.doctor[0].contact = doctorContact;
    }
    return Patient.find({"_id": id, "userId": userId})
        .then(result=>{
           if(doctorName === null){
                newPatientObject.doctor[0].name = result[0].doctor[0].name;
            }
            if (doctorContact === null){
                newPatientObject.doctor[0].contact = result[0].doctor[0].contact;
            }
            return Patient.findOneAndUpdate({"_id": id, "userId": userId}, newPatientObject, {$set: true, new: true})
            .then(data=> {
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
                next(err)});
        })
        .catch(err=>next(err));
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
    return Promise.all([Patient.findOneAndRemove({"_id": id, "userId": userId}), CalEvent.deleteMany({"userId": userId, "patientId": id})])
        .then(()=>{
            return Patient.find({"userId": userId})
        })
        .then(data=> res.json(data))
        .catch(err=> next(err));
});

module.exports =  Router ;