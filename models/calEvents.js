const mongoose = require('mongoose');
const moment = require('moment');

const calEventsSchema = new mongoose.Schema({
    title: String, //they can leave this blank. will have some nifty default thing..
    start: {type: String, required: true}, // the starting time of the event for the calendar
    end: String,    //ending time for the event, is optional for now
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
calEventsSchema.virtual('stringToTime').get(function(){
    return moment(this.start).format();
});
module.exports = mongoose.model('CalEvent', calEventsSchema); 