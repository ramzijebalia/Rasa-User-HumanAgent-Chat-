const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    max: 50,
  },
  lastName: {
    type: String,
    required: true,
    max: 50,
  },
  username: {
    type: String,
    required: true,
    min: 3,
    max: 20,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    max: 50,
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
  companyName: {
    type: String,
    required: true,
    max: 100,
  },
  companyPrefix: { // the companyprefix is the tennet id ( email@companyPrefix.com)
    type: String,
    required: true,
  },
});

const Userr = mongoose.model('User', userSchema);
module.exports = { Userr , userSchema}; 
