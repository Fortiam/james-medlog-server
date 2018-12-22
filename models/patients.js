const mongoose = require('mongoose');

const patientsSchema = new mongoose.Schema({
    userId : {type: mongoose.Schema.Types.ObjectId, ref: 'User', required : true},
    name : {type : String, required : true},
    age : Number,
    gender : String,
    height : String,
    allergies : [{named : String}],
    weight : String,
    doctor : {name : String, email: String}
});
//we don't math height, it's just for the records, a string is fine

patientsSchema.set('toJSON', {
    virtuals: true,     // include built-in virtual `id`
    transform: (doc, result) => {
      delete result._id;
      delete result.__v;
    }
});

const Patient = mongoose.model('Patient', patientsSchema);

module.exports = { Patient };