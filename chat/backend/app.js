const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require("./routes/auth");
const bcrypt = require("bcrypt");
const {Conversationn , conversationSchema } = require("./models/conversationModel");
const bodyParser = require('body-parser');
const createDatabaseConnection = require('./utils/dbConnection');




const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


app.use(cors()); // Enable CORS for all routes
app.use(express.json()); 
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);



// WebSocket server logic
wss.on('connection', function connection(ws) {
  console.log('Client connected');

  // In the WebSocket server logic
ws.on('message', async function incoming(message) {

  const messageString = message.toString(); 
  const messageData = JSON.parse(messageString);


  // If user info message, check if email belongs to an existing conversation
  if (messageData.sender === 'user') {

      const db = createDatabaseConnection(messageData.tenantId)
      const Conversation = db.model('Conversation', conversationSchema);

      const existingConversation = await Conversation.findOne({ 'userInfo.email': messageData.email });

      if (existingConversation) {
          // If existing conversation found, add new message to it
          existingConversation.messages.push({ sender: messageData.sender, message: messageData.message });
          await existingConversation.save();
          console.log('Message saved to existing conversation');
      } else {
          // If no existing conversation found, create a new conversation with the user's information and message
          const newConversation = new Conversation({
              userInfo: {
                  name: messageData.name,
                  email: messageData.email,
                  phone: messageData.phone
              },
              messages: [{ sender: messageData.sender ,  message: messageData.message }]
          });
          await newConversation.save();
          console.log('New conversation created with message');
      }
  } else {
    // If message is not from the user,

    const db = createDatabaseConnection(messageData.tenantId)
    const Conversation = db.model('Conversation', conversationSchema);

    const existingConversation = await Conversation.findOne({ 'userInfo.email': messageData.receiverId });

    if (existingConversation) {
        existingConversation.messages.push({ sender: messageData.sender, receiverId: messageData.receiverId, message: messageData.message });
        await existingConversation.save();
        console.log('Message saved to latest conversation');
    }
}

// Broadcast message to all clients
wss.clients.forEach(function each(client) {
  if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(messageString); // Send stringified JSON message
      console.log('Send stringified JSON message', messageString);
  }
});

});
});




const PORT = process.env.PORT || 3005;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
