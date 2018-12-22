const mongoose = require('mongoose');

const eventsSchema = new mongoose.Schema({
    title: String, //they can leave this blank. will have some nifty default thing..
    patientId : {type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required : true},
    medId : {type: mongoose.Schema.Types.ObjectId, ref: 'Med', required : true},
    userId : {type: mongoose.Schema.Types.ObjectId, ref: 'User', required : true},
    //remember the event does not care how often, or how many events will be created at once.
});

// Add `createdAt` and `updatedAt` fields, useful
eventsSchema.set('timestamps', true);

eventsSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, result) => {
      delete result._id;
      delete result.__v;
    }
});

const Event = mongoose.model('Event', eventsSchema);

module.exports = { Event };