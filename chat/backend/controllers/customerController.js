const { Customerr , CustomerSchema } = require("../models/customerModel");
const { Conversationn,  conversationSchema} = require('../models/conversationModel'); 

// endpoint to save customers 
module.exports.saveCustomer = async (req, res, next) => {
    try {
      const { name, email, phone , tenantId } = req.body;

      const connection = req.databaseConnection;
      const Customer = connection.model('Customer', CustomerSchema)

      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
        return res.status(400).json({ message: 'Customer already exists'  , customer: existingCustomer });
      }
      // Customer doesn't exist, add to the database
      const newCustomer = new Customer({ name, email, phone , tenantId });
      await newCustomer.save();
      return res.status(201).json({ message: 'Customer created successfully', customer: newCustomer });

    } catch (ex) {
      next(ex);
    }
  };


// Endpoint to fetch all user information with last message and timestamp
module.exports.userWithLastMsg = async (req, res, next) => {
  try {
    const connection = req.databaseConnection;
    const Customer = connection.model('Customer', CustomerSchema);
    const Conversation = connection.model('Conversation', conversationSchema);
    
    // Fetch all customers from the database
    const customers = await Customer.find();
    
    // Fetch all conversations and populate customer info
    const conversations = await Conversation.find()
    
    // Group customers by inquiryType
    const groupedUsers = conversations.reduce((acc, conversation) => {
      const inquiryType = conversation.inquiryType || 'Unknown';
      if (!acc[inquiryType]) {
        acc[inquiryType] = [];
      }
      const userInfo = {
        name: conversation.userInfo.name,
        email: conversation.userInfo.email,
        phone: conversation.userInfo.phone,
        tenantId : conversation.tenantId ,
        lastMessage: conversation.messages.length ? conversation.messages[conversation.messages.length - 1] : null
      };
      acc[inquiryType].push(userInfo);
      return acc;
    }, {});

    res.json(groupedUsers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
