const mongoose = require('mongoose');

function checkIdIsValid(...testMe){
    let badIds = 0;
    for(let x = 0; x < testMe.length; x++){
        if (!mongoose.Types.ObjectId.isValid(testMe[x])){
            badIds++;
        }
    }
    return (badIds === 0);
}

function checkTitle(testMe){
    return(typeof testMe === 'string' && testMe.length > 0);
}

function checkMedId(testMe){

}

function checkPatientId(testMe){

}

function checkUserId(testMe){

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
module.exports = { checkIdIsValid, checkTitle, checkMedId, checkPatientId, checkUserId, checkUsernameAndPassword, trimName };