const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usersSchema = new mongoose.Schema({
    firstName: String,
    lastName : String,
    username : {type : String, required : true, unique : true},
    email : String,
    password : {type : String, required: true},
    useEmailForApi : {type : Boolean, default : false},
});
// useEmailForApi they should have to choose to turn this 
// feature on 
usersSchema.set('toJSON', {
    virtuals: true,     // include built-in virtual `id`
    transform: (doc, result) => {
      delete result._id;
      delete result.__v;
      delete result.password;
    }
});

usersSchema.methods.serialize = function(){
    return { username : this.username,
             firstName : this.firstName,
             lastName: this.lastName,
             email : this.email
    };
};

usersSchema.methods.validatePassword = function(AttemptedPassword){
    return bcrypt.compare(AttemptedPassword, this.password);
};

usersSchema.statics.hashPassword = function(unhashedPass){
    const hashed = bcrypt.hash(unhashedPass, 10);
 return hashed;
};

module.exports = mongoose.model('User', usersSchema);
