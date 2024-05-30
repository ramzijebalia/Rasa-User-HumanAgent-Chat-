const chatCode = `import React, { useState, useEffect, useRef } from 'react';
import './chat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesDown , faPaperPlane , faMessage , faShare } from '@fortawesome/free-solid-svg-icons';
import { saveCustomer , saveConversation, chatHistory , rasaEndpoint} from "../utils/APIRoutes";
import { fetchColorsAndUpdateCSS } from '../Components/VarColors/variables'; 

function Chat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [botTyping, setBotTyping] = useState(false);
  const [chat, setChat] = useState([]);
  const [ws, setWs] = useState(null); // Maintain WebSocket connection
  const [connectToHumanAgent, setConnectToHumanAgent] = useState(false);
  const chatWindowRef = useRef(null);
  const tenantId = process.env.REACT_APP_TENANT_ID;
  

  // Call the function to initialize colors
  fetchColorsAndUpdateCSS(tenantId);

  

  // New state variables
  const [showInput, setShowInput] = useState(false); // Initially hide input
  const [userInfo, setUserInfo] = useState({}); // Store user information
  const [currentUser, setCurrentUser] = useState(undefined);
  

  const fetchUser = async() =>{
    setCurrentUser(
      await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      )
    );
    }
  useEffect(() => {
    fetchUser()
  }, []);
  

  useEffect(() => {
    // Function to scroll chat window to the bottom
    const scrollToBottom = () => {
      if (chatWindowRef.current) {
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
      }
    };
    // Scroll to bottom whenever chat state updates
    scrollToBottom();
  }, [chat]);

  useEffect(() => {
    const newWs = new WebSocket('ws://localhost:3005');
    setWs(newWs);

    newWs.onopen = function () {
      console.log('Connected to WebSocket server');
    };

    newWs.onmessage = function (event) {
      const message = JSON.parse(event.data);
      // Display the received message in the chat interface
      setChat((prevChat) => [...prevChat, { sender: message.sender, message: message.message }]);
      if (message.sender === 'bot' && message.message === 'Sure, let me connect you with a human agent.') {
        setConnectToHumanAgent(true);
      }
      setBotTyping(false);
    };

  }, []);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  
    // Send initial messages from bot when chat opens
    if (!isChatOpen && chat.length === 0) {
      // First message
      setChat((prevChat) => [
        ...prevChat,
        { sender: 'bot', message: 'Hello! for better assistance can you please fill in the infomrtaion bellow .. ' },
      ]);
      // Second message containing input fields and submit button
      setChat((prevChat) => [
        ...prevChat,
        {
          sender: 'bot',
          message: (

            <div className="form-container">
              <div className="form-group">
              <form  action="" onSubmit={(event) => handleUserInfoSubmit(event , tenantId)} className="user-info-form">
                  <input name="name" id="name" type="text" placeholder="Your name" required  />
                  <input name="email" id="email" type="email" placeholder="Your email" required  />
                  <input name="phone" id="phone" type="tel" placeholder="Your phone number" required />
                  <button type="submit">Submit</button>
              </form>
              </div>
            </div>
          ),
        },
      ]);
    }
  };
  

  const handleUserInfoSubmit = async (event , tenantId) => {
    event.preventDefault();
    const { name, email, phone } = event.target;
  
    try {
      // Save customer information to the backend
      const response = await fetch(saveCustomer, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.value,
          email: email.value,
          phone: phone.value ,
          tenantId : tenantId
        })
      });
  
      // Parse response JSON
      const data = await response.json();
  
      // Update local storage with customer data
      localStorage.setItem(process.env.REACT_APP_LOCALHOST_KEY, JSON.stringify(data.customer));
  
      // Update user info state
      setUserInfo({ name: name.value, email: email.value, phone: phone.value });
  
      // Fetch chat history
      fetchChatHistory(email.value , tenantId);
  
      // Display confirmation message and show input field
      setChat((prevChat) => [...prevChat, { sender: 'bot', message: ` +"`Welcome, ${name.value}! How can I help you?`"+` }]);
      setShowInput(true);
  
      // Remove the initial message asking for user information
      setChat(prevChat => prevChat.slice(2));
  
      // After saving customer info, create an empty conversation in the database
      await createEmptyConversation(data.customer._id, tenantId , name.value, email.value, phone.value);
    } catch (error) {
      console.error('Error handling user info submit:', error);
    }
  };

  // Function to create an empty conversation in the backend
const createEmptyConversation = async ( userId , tenantId , name, email, phone) => {
  try {
    // Send a POST request to the backend to create an empty conversation
    const response = await fetch(saveConversation, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId : userId,
        tenantId : tenantId,
        userInfo: {
          name: name,
          email: email,
          phone: phone
        },
        messages: []
      })
    });

    // Parse response JSON
    const data = await response.json();
    console.log('Empty conversation created successfully:', data);
  } catch (error) {
    console.error('Error creating empty conversation:', error);
  }
};

  
  

const handleSubmit = async (evt , tenantId) => {
  evt.preventDefault();
  const request_temp = { sender: 'user', tenantId:tenantId, message: inputMessage, userInfo: userInfo }; // Include user information
  console.log('request_temp', request_temp);

  if (inputMessage.trim() !== '') {
    setChat((chat) => [...chat, request_temp]);
    console.log('chat', chat);
    setInputMessage('');
    setTimeout(() => {
      setBotTyping(true); 
      setTimeout(async () => {
        if (!connectToHumanAgent) {
          const response = await rasaAPI(inputMessage , tenantId);
          const responseData = await response.json();
          if (responseData && responseData.length > 0) {
            const temp = responseData[0];
            const recipient_msg = temp['text'];
            setChat((prevChat) => [...prevChat, { sender: 'bot', message: recipient_msg }]);
            if (recipient_msg === 'How can I help you today?' || recipient_msg === 'Sorry, I didn\'t understand that. Would you like to talk with a human agent?') {
              setChat((prevChat) => [...prevChat, { sender: 'bot', buttons: temp['buttons'] }]); 
            }            
            setBotTyping(false);
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ sender: 'user', tenantId: tenantId, message: inputMessage, ...userInfo }));
              ws.send(JSON.stringify({ sender: 'bot', tenantId : tenantId ,botId: 'botid', message: recipient_msg, receiverId : userInfo.email }));
            }
          }
        } else {
          sendMessageToServer(inputMessage , tenantId);
        }
      }, 500);
    }, 1000); // Delay the call to sendMessageToServer by 1 second (1000 milliseconds)
  } else {
    window.alert('Please enter a valid message');
  }
};

const handleButtonClick = async (payload , tenantId) => {
  try {
    if (payload === '/request_human_handoff') {
      // Handle the case when user chooses "Yes" to request human handoff
      setChat((prevChat) => [...prevChat, { sender: 'bot', message: 'Sure, let me connect you with a human agent.' }]);
      setConnectToHumanAgent(true); // Update state to indicate human handoff request
      // Send a message to Rasa indicating the user's choice
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ sender: 'bot', message: 'User chose to request human handoff', receiverId : userInfo.email }));
      }
    } else if (payload === '/continue_chat') {
      // Handle the case when user chooses "No" to continue chatting with the bot
      setChat((prevChat) => [...prevChat, { sender: 'bot', message: 'you chose to continue chatting with teh bot' , receiverId : userInfo.email }]);
      setConnectToHumanAgent(false); // Update state to indicate continuation of chat with bot
      // Send a message to Rasa indicating the user's choice
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ sender: 'bot', message: 'User chose to continue chatting with the bot', receiverId : userInfo.email }));
      }
    } else {
      await rasaAPI(payload, tenantId);
    }
  } catch (error) {
    console.error('Error handling button click:', error);
  }
};

  const rasaAPI = async (msg , tenantId) => {
    try {
      return await fetch(rasaEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          charset: 'UTF-8',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ sender: 'bot', tenantId: tenantId, botId : 'botid' , message: msg, receiverId : userInfo.email}), // Include user information
      });
    } catch (error) {
      console.error('Error fetching response from Rasa API:', error);
    }
  };

  const sendMessageToServer = (message , tenantId) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ sender: 'user', tenantId: tenantId, message, ...userInfo }));
    } else {
      console.error('WebSocket connection not open');
    }
  };


  const handleIconClick = () => {
    // Toggle the isChatOpen state to false
    setIsChatOpen(false);
  };
  

  const fetchChatHistory = async (email , tenantId) => {
    try {
      const response = await fetch(` +"`${chatHistory}?email=${email}&tenantId=${tenantId}`"+`);
      if (response.ok) {
        const chatHistory = await response.json();
        setChat(chatHistory);
      } else {
        console.error('Failed to fetch chat history');
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  return (
    
    <div className="chat-icon-container">
      <div className={`+ "`chat-icon ${isChatOpen ? 'active' : ''}`"+`} onClick={toggleChat} style={{ color: 'white' }}>
        {isChatOpen ? (
          <FontAwesomeIcon icon={faShare} style={{ fontSize: '24px' }} />
        ) : (
          <FontAwesomeIcon icon={faMessage} style={{ fontSize: '24px' }} />
        )}
      </div>
      {isChatOpen && (
        <div className="chat-window" ref={chatWindowRef}>
          <div className="chat-header">
            <h2>Hi There ! 👋</h2>
              <FontAwesomeIcon icon={faAnglesDown} onClick={handleIconClick} style={{ fontSize: '28px', cursor: 'pointer' , margin:'30px' }} />
          </div>

          <div id="messageArea">
            {chat.map((message, index) => (
              <div key={index} className={`+"`message-container ${message.sender === 'human_agent' ? 'human-agent-message-container' : message.sender === 'bot' ? 'bot-message-container' : ''}`"+`}>
                <div className={`+"`message-bubble ${message.sender === 'human_agent' ? 'human-agent-message-bubble' : message.sender === 'bot' ? 'bot-message-bubble' : 'user-message-bubble'}`"+`}>
                  <h5>{message.message}</h5>
                  {/* Check if buttons are provided */}
                  {message.buttons && (
                    <div>
                      {console.log("mesage button" , message )}
                      {message.buttons.map((button, index) => (
                        <button key={index} onClick={() => handleButtonClick(button.payload , tenantId)}>
                          {button.title}
                          {console.log("buttttttttttions" , button.title)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {showInput && (
            <form onSubmit={(evt) => handleSubmit(evt, tenantId)} className="message-form">
              <input onChange={(e) => setInputMessage(e.target.value)} value={inputMessage} type="text" />
              <button type="submit">
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default Chat;
`




















const chatPopupStyles = `
@import url('../Components/VarColors/variables.css');

.chat-icon-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
}

.chat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(90deg, var(--chat-bubble-bg-start) 0%, var(--chat-bubble-bg-mid) 44%, var(--chat-bubble-bg-end) 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.chat-icon:hover {
    background-color: var(--chat-icon-hover-color);
}

.chat-window {
    position: fixed;
    bottom: 90px;
    right: 30px;
    width: 350px;
    height: 600px;
    background-color: var(--chat-background-color);
    border: 1px solid var(--chat-window-border-color);
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 9998;
    overflow: hidden;
    transition: height 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.chat-window::-webkit-scrollbar {
    display: none;
}

.chat-header {
    background: linear-gradient(90deg, var(--chat-bubble-bg-start) 0%, var(--chat-bubble-bg-mid) 44%, var(--chat-bubble-bg-end) 100%);
    color: var(--form-container-text-color);
    padding: 10px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100px;
    width: 330px;
}

.chat-header h2 {
    margin: 30px;
}

.close-btn {
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 16px;
    color: #ffffff;
}

.close-btn:hover {
    color: #eee;
}

.chat-window form {
    display: flex;
    align-items: center;
    margin-top: auto;
    padding: 10px;
}

.message-container {
    display: flex;
    justify-content: flex-end;
    margin-bottom: -20px;
    padding: 15px;
}

#messageArea {
    flex: 1;
    overflow-y: auto;
}

#messageArea::-webkit-scrollbar {
    display: none;
}

.bot-message-container {
    justify-content: flex-start;
}

.human-agent-message-container {
    justify-content: flex-start;
}

.message-bubble {
    padding: 10px;
    border-radius: 10px;
    max-width: 70%;
    word-wrap: break-word;
}

.user-message-bubble {
    background: linear-gradient(90deg, var(--chat-bubble-bg-start) 0%, var(--chat-bubble-bg-mid) 44%, var(--chat-bubble-bg-end) 100%);
    text-align: right;
}

.bot-message-bubble {
    background-color: var(--bot-message-bubble-color);
    text-align: left;
}

.human-agent-message-bubble {
    background-color: var(--human-message-bubble-color);
    text-align: left;
}

.user-message-bubble h5 {
    margin: 0;
    color: var(--user-message-bubble-color);
}

.bot-message-bubble h5,
.human-agent-message-bubble h5 {
    margin: 0;
    color: var(--user-bot-message-text-color);
}

.message {
    margin-bottom: 10px;
    max-width: calc(100% - 20px);
    word-wrap: break-word;
}

.bot-message {
    text-align: left;
}

.user-message {
    text-align: right;
}

.chat-window input[type="text"] {
    flex: 1;
    border: 1px solid var(--chat-window-color);
    border-radius: 5px;
    padding: 10px;
    margin-right: 10px;
}

.chat-window button {
    background-color: var(--chat-window-color);
    color: #fff;
    border: none;
    border-radius: 5px;
    padding: 8px 15px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.form-container {
    max-width: 300px;
    margin: 0 auto;
}

.form-container form {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.form-container input[type="text"],
.form-container input[type="email"],
.form-container input[type="tel"],
.form-container button {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid var(--form-container-color);
    border-radius: 5px;
    box-sizing: border-box;
    height: 40px;
}

.form-container button {
    background-color: var(--form-container-color);
    color: var(--form-container-text-color);
    cursor: pointer;
}

.form-container button:hover {
    background-color: var(--form-container-color);
}

.user-info-form {
    display: flex;
    flex-direction: column;
}

.form-group {
    margin-bottom: 10px;
}

label {
    margin-right: 5px;
}

input[type='text'],
input[type='email'],
input[type='tel'],
button {
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

button {
    background-color: var(--form-userInfo-color);
    color: var(--form-container-text-color);
    border: none;
    cursor: pointer;
}

button:hover {
    background-color: var(--form-userInfo-color);
}
`;




const APIRoutes = `
export const host = "http://localhost:3005";
export const saveCustomer = \`\${host}/api/auth/savecustomer\`;
export const saveConversation = \`\${host}/api/auth/saveconversation\`;
export const retrievecolors = \`\${host}/api/auth/retrievecolors\`;
export const saveColors = \`\${host}/api/auth/savecolors\`;
export const chatHistory = \`\${host}/api/auth/chat-history\`;
export const rasaEndpoint  = "http://localhost:5005/webhooks/rest/webhook"
`;



const cssVariables = `
:root {
    /* main color of the chat bubble [ user-message-bubble , chat-hedaer ] */
    --chat-bubble-bg-start: #6660d6;
    --chat-bubble-bg-mid: #a9dc52;
    --chat-bubble-bg-end: #00d4ff;

    /* color of the chat background */
    --chat-background-color: #fff;

    /* color of the bot message bubble */
    --bot-message-bubble-color: #E5E5EA;

    /* color of the human agent bubble */
    --human-message-bubble-color: #C7D8ED;

    /* color of the user bubble */
    --user-message-bubble-color: #f7f7f7;

    /* color of the text messages (user and bot) */
    --user-bot-message-text-color: #000000;

    /* color of the chat icon hover */
    --chat-icon-hover-color: #007bff;

    /* color of the chat window border */
    --chat-window-border-color: #007bff;

    /* color of the chat window (input and button) */
    --chat-window-color: #007bff;

    /* color of the form container */
    --form-container-color: #0a5db5;

    /* color of the user info form */
    --form-userInfo-color: #007bff;

    /* color of the font (header, form container, user form button) */
    --form-container-text-color: #fff;
}
`;

const fetchColorsAndUpdateCSSString = `
import axios from 'axios';
import { retrievecolors } from '../../utils/APIRoutes';

export const fetchColorsAndUpdateCSS = async () => {
  try {
    const response = await axios.get(retrievecolors);
    const colors = response.data;
    console.log('Fetched colors:', colors);

    // Update CSS variables with fetched colors
    document.documentElement.style.setProperty('--chat-bubble-bg-start', colors.ChatBubbleBgStart);
    document.documentElement.style.setProperty('--chat-bubble-bg-mid', colors.ChatBubbleBgMid);
    document.documentElement.style.setProperty('--chat-bubble-bg-end', colors.ChatBubbleBgEnd);
    document.documentElement.style.setProperty('--chat-background-color', colors.ChatBackgroundColor);
    document.documentElement.style.setProperty('--bot-message-bubble-color', colors.BotMsgBubbleColor);
    document.documentElement.style.setProperty('--human-message-bubble-color', colors.HumanMsgBubbleColor);
    document.documentElement.style.setProperty('--user-message-bubble-color', colors.UserMsgBubbleColor);
    document.documentElement.style.setProperty('--user-bot-message-text-color', colors.UserBotMsgTextColor);
    document.documentElement.style.setProperty('--chat-window-border-color', colors.ChatWindowBorderColor);
    document.documentElement.style.setProperty('--chat-window-color', colors.ChatWindowColor);
    document.documentElement.style.setProperty('--form-container-color', colors.FormContainerColor);
    document.documentElement.style.setProperty('--form-userInfo-color', colors.FormUserInfoColor);
    document.documentElement.style.setProperty('--form-container-text-color', colors.FormContainerTextColor);

    // Store colors in local storage
    localStorage.setItem('colors', JSON.stringify(colors));

  } catch (error) {
    console.error('Error fetching colors:', error);
  }
};
`;



export { chatCode , chatPopupStyles, APIRoutes , cssVariables , fetchColorsAndUpdateCSSString};