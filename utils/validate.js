const mongoose = require('mongoose');
const User = require('../models/users');
const moment = require('moment');

function checkIdIsValid(...testMe){
    let badIds = 0;
    for(let x = 0; x < testMe.length; x++){
        if (!mongoose.Types.ObjectId.isValid(testMe[x])){
            badIds++;
        }
    }
    return (badIds === 0);
}

function checkString(testMe){
    return(typeof testMe === 'string' && testMe.length > 0);
}
function checkTime(timeToCheck){
    return (moment().isValid(timeToCheck));
}
function checkArray(testArray){
    let badString = 0;
    testArray.forEach(stringy => (stringy.length > 0)? true: badString++);
    return (badString === 0);
}
function checkArrayOfObjects(testArray){
    if(Array.isArray(testArray)){
        if(testArray.length > 0){
            let onlyIds = testArray.map(each=> each._id);
            if(testArray[0].name && checkIdIsValid(onlyIds)){
                return true;
            }
        } else if(testArray.length === 0){
            return true;
        }
    }
    return false;
}
function checkNumberAboveZero(checkMe){
    return (!isNaN(Number(checkMe))&& typeof(Number(checkMe))==='number' && (Number(checkMe) > 0));
}
function addOnlyValidFields(baseArray, testArray, userId){
    const newPatientObject = {"userId": userId};//the required field
    baseArray.forEach((field, index)=>{
        if(testArray[index]!== undefined){
            newPatientObject[field] = testArray[index];
        }
    });
        
    return newPatientObject;
}

function checkUsernameAndPassword(testMe){
    const requiredFields = ["username", "password"];
    const requiredKeys = {username :"username", password: "password"};
    const checkForValid = { username : testMe[0], password: testMe[1]};
    
    for(let key in requiredKeys){
        if(checkForValid[key] === undefined){
           return {good: false, why : `${key} required!`};
        }
    }
    requiredFields.forEach(field =>{
        if(typeof(checkForValid[field]) !== 'string'){
            const fail = {good: false, why : `${field} not valid! Needs to be a string please`};
            return fail;
        }
    });
        
    requiredFields.forEach(field => {
        if(checkForValid[field].trim() !== checkForValid[field]){
            const fail = {good: false, why: `${field} must not have leading or trailing spaces!`};
            return fail;
        }
    });

    if(testMe[0].length < 1){
        const fail = { good: false, why: 'Username must be at least ONE character!'};
        return fail;
    }
    if(testMe[1].length < 8) {
        const fail = {good: false, why: 'Passwords must be at least eight characters'};
        return fail;
    }
    if(testMe[1].length > 99) {
        const fail = {good: false, why :'Passwords must be no more than Ninety-Nine characters'};
       return fail;
    }
    return {good: true, why : null};
}

function trimName(tooManySpaces){
    if(tooManySpaces){
        return tooManySpaces.trim();
    }
}
function checkUserIdExists(checkMe, againstMe, next){
    return User.findById(checkMe)
    .then(result=>{
        if(result._id.toString() === againstMe.toString()){
            return true;//should probably change this to ternary but easier to console log this way
        }
        else return false;
    })
    .catch(err=>next(err));
}
function boolCheck(checkMe){
    return (checkMe === "true");
}
function validEmailAddress(checkMe){
    const EmailRegExp = /^\w+@\w+[.]\w{1,4}$/gi;
    return EmailRegExp.test(checkMe);
}
module.exports = { checkIdIsValid, checkString, addOnlyValidFields, checkUsernameAndPassword, trimName, checkUserIdExists, boolCheck, validEmailAddress, checkArray, checkArrayOfObjects, checkNumberAboveZero, checkTime };