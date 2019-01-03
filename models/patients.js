const mongoose = require('mongoose');

const patientsSchema = new mongoose.Schema({
    userId : {type: mongoose.Schema.Types.ObjectId, ref: 'User', required : true},
    name : {type : String, required : true},
    age : Number,
    gender : String,
    height : String,
    allergies : String,
    weight : String,
    doctor : [{name : String, contact: String}],
    medsCurrentlyOn : [{
        name : {type : mongoose.Schema.Types.String, ref: 'Med'},
        medId : {type: mongoose.Schema.Types.ObjectId, ref: 'Med'},
        //start : String
    }]
});
//we don't math height, it's just for the records, a string is fine

patientsSchema.set('toJSON', {
    virtuals: true,     // include built-in virtual `id`
    transform: (doc, result) => {
      delete result._id;
      delete result.__v;
    }
});

module.exports = mongoose.model('Patient', patientsSchema);