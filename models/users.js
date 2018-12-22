const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usersSchema = new mongoose.Schema({
    name: {type : String, required : true, unique: true},
    password : {type : String, required: true}

});

usersSchema.set('toJSON', {
    virtuals: true,     // include built-in virtual `id`
    transform: (doc, result) => {
      delete result._id;
      delete result.__v;
      delete result.password;
    }
});

usersSchema.methods.serialize = function(){
    return { name : this.name };
};

usersSchema.methods.validatePassword = function(AttemptedPassword){
    return bcrypt.compare(AttemptedPassword, this.password);
};

usersSchema.statics.hashPassword = function(unhashedPass){
    const hashed = bcrypt.hash(unhashedPass, 10);
 return hashed;
};

const User = mongoose.model('User', usersSchema);

module.exports = { User };