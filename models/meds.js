const mongoose = require('mongoose');

const medsSchema = new mongoose.Schema({
    name: {type :String, required : true},
    userId : {type: mongoose.Schema.Types.ObjectId, ref: 'User', required : true},
    dosage : {type : String, required : true},
    rate : { 
        amount : { type : Number, required : true},
        interval : { type : String, required : true}
    }
});
// dosage example : 2 pills, or 1 teaspoon
// we do _not_ do stuff with the dosage value, so a string with numbers in it is fine

// rate is : an amount per interval
// rate example : every 4(number) hours(string)
//we _do_ do stuff with the rate number and string so they need to be split

medsSchema.set('toJSON', {
    virtuals: true,     // include built-in virtual `id`
    transform: (doc, result) => {
      delete result._id;
      delete result.__v;
    }
});

const Med = mongoose.model('Med', medsSchema);

module.exports = { Med };