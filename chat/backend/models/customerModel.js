const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    unique: true,
    maxlength: 50,
  },
  phone: {
    type: Number,
    min: 8,
  },
  tenantId: {  // teneantid of the company ( companyPrefix ) ==> company need to mention its companyprefix in the .env
    type: String
  },
});

const Customerr = mongoose.model('Customer', CustomerSchema);
module.exports = { Customerr , CustomerSchema} ; 
