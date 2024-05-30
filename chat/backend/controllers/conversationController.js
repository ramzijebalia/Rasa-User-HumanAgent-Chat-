
const { Conversationn,  conversationSchema} = require('../models/conversationModel'); // Import the Conversation model

// handle the creation of conversations
module.exports.saveConversation = async (req, res, next) =>  {
    try {
        // Extract user information and messages from the request body
        const { userInfo, tenantId , inquiryType, userId , messages } = req.body;

        const connection = req.databaseConnection;
        const Conversation = connection.model('Conversation', conversationSchema)
    
        // Check if a conversation already exists for the given email
        const existingConversation = await Conversation.findOne({ 'userInfo.email': userInfo.email });
    
        // If a conversation already exists, send a response indicating that
        if (existingConversation) {
          existingConversation.inquiryType = inquiryType;
          const updatedConversation = await existingConversation.save();

          return res.status(200).json(updatedConversation);
        }
    
        // Create a new conversation instance
        const newConversation = new Conversation({
          userId : userId,
          inquiryType : inquiryType ,
          tenantId : tenantId,
          userInfo: userInfo,
          messages: messages
        });
    
        // Save the conversation to the database
        const savedConversation = await newConversation.save();
    
        // Respond with the saved conversation
        res.status(201).json(savedConversation);
      } catch (error) {
        // If an error occurs, respond with an error message
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
};



module.exports.allConversations = async (req, res, next) =>  {
  try {
    const { companyPrefix } = req.query;

    const connection = req.databaseConnection;
    const Conversation = connection.model('Conversation', conversationSchema)

    const conversations = await Conversation.find();
    res.status(200).json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



// Endpoint to fetch chat history
module.exports.chatHistory = async (req, res, next) =>  {
  const { email , tenantId } = req.query;

  const connection = req.databaseConnection;
  const Conversation = connection.model('Conversation', conversationSchema)
  
  try {
    const conversation = await Conversation.findOne({ 'userInfo.email': email });
    if (conversation) {
      //console.log('Chat history found:', conversation.messages); 
      res.json(conversation.messages);
    } else {
      //console.log('No chat history found for this email');
      res.status(404).json({ error: 'No chat history found for this email' });
    }
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

