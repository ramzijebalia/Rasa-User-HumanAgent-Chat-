const mongoose = require('mongoose');

// Define the schema for the Conversation model
const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ,
  tenantId : String,
  inquiryType: { type: String, default: '' },  // type of teh assistance needed ( technical assistanec , general assistance ....)
  userInfo: {
    name: String,
    email: String,
    phone: String
  },
  messages: [{ sender: String, message: String, timestamp: { type: Date, default: Date.now } }]
});
const Conversationn = mongoose.model('Conversation', conversationSchema);
module.exports = {Conversationn ,conversationSchema}; 
