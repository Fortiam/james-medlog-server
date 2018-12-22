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

module.exports = { checkIdIsValid, checkTitle, checkMedId, checkPatientId, checkUserId };