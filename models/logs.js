const mongoose = require('mongoose');

const logsSchema = new mongoose.Schema({
    userId : {type: mongoose.Schema.Types.ObjectId, ref: 'User', required : true},
    medId : {type: mongoose.Schema.Types.ObjectId, ref: 'Med'},
    patientId : {type: mongoose.Schema.Types.ObjectId, ref: 'Patient'},
    comments : [{comment : String}]
});

logsSchema.set('toJSON', {
    virtuals: true,     // include built-in virtual `id`
    transform: (doc, result) => {
      delete result._id;
      delete result.__v;
    }
});

module.exports = mongoose.model('Log', logsSchema);