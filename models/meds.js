const mongoose = require('mongoose');

const medsSchema = new mongoose.Schema({
    name: {type :String, required : true},
    userId : {type: mongoose.Schema.Types.ObjectId, ref: 'User', required : true},
    dosage : {type : String, required : true},
    rateAmount : { type : Number, required : true},
    howLongAmount : { type : Number, required : true},
});

// rateInterval : { type : String, required : true},//this is always 'hours'
// howLongForDays : { type : String, required : true}//this is always 'days'
// dosage example : 2 pills, or 1 teaspoon
// we do _not_ do stuff with the dosage value, so a string with numbers in it is fine

// rate is : an amount per interval
// rate example : every 4(number) hours(string)
//we _do_ do stuff with the rate number and string so they need to be split
// 2 pills every 4 hours for 7 days
// (string)every (rateAmount) (rateInterval)
/* dosage = "2 pills"           string
   rateAmount = 4               number
   rateInterval = "hours"       string
   howLongAmount = 7       number
   howLongForDays = "days"    string
*/
medsSchema.virtual("doubleCheck").get(function() {
    return `Take ${this.dosage} every ${this.rateAmount} hours, for ${this.howLongAmount} days.`;
});

medsSchema.set('toJSON', {
    virtuals: true,     // include built-in virtual `id`
    transform: (doc, result) => {
      delete result._id;
      delete result.__v;
    }
});

module.exports = mongoose.model('Med', medsSchema); 