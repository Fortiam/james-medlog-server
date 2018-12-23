const mongoose = require('mongoose');

const calEventsSchema = new mongoose.Schema({
    title: String, //they can leave this blank. will have some nifty default thing..
    patientId : {type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required : true},
    medId : {type: mongoose.Schema.Types.ObjectId, ref: 'Med', required : true},
    userId : {type: mongoose.Schema.Types.ObjectId, ref: 'User', required : true},
    //remember the event does not care how often, or how many events will be created at once.
});

// Add `createdAt` and `updatedAt` fields, useful
calEventsSchema.set('timestamps', true);

calEventsSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, result) => {
      delete result._id;
      delete result.__v;
    }
});

const CalEvent = mongoose.model('CalEvent', calEventsSchema);

module.exports = { CalEvent };