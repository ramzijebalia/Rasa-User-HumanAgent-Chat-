const mongoose = require('mongoose');

// Define the schema for the Color model
const colorSchema = new mongoose.Schema({
    colors: {
      type: Object,
      required: true,
    },
  });


const Colorr = mongoose.model('Color', colorSchema);
module.exports = {Colorr ,colorSchema}; 
