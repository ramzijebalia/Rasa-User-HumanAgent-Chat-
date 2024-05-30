import React, { useState, useEffect, useRef } from 'react';
import './chat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesDown , faPaperPlane , faMessage , faShare } from '@fortawesome/free-solid-svg-icons';
import { saveCustomer , saveConversation, chatHistory , rasaEndpoint } from "../utils/APIRoutes";
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
  //const websocketUrl = process.env.WEBSOCKET_URL;

  // New state variables
  const [showInput, setShowInput] = useState(false); // Initially hide input
  const [userInfo, setUserInfo] = useState({}); // Store user information
  const [currentUser, setCurrentUser] = useState(undefined);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedInquiryType, setSelectedInquiryType] = useState('');
  const cityRef = useRef(selectedCity);
  const inquiryTypeRef = useRef(selectedInquiryType);

  // Call the function to initialize colors
  fetchColorsAndUpdateCSS(tenantId);


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

  // conncet to teh websocket
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
                <form action="" onSubmit={(event) => handleUserInfoSubmit(event, tenantId)} className="user-info-form">
                  <input name="name" id="name" type="text" placeholder="Your name" required />
                  <input name="email" id="email" type="email" placeholder="Your email" required />
                  <input name="phone" id="phone" type="tel" placeholder="Your phone number" required />

                  <div className="city-selection">
                    <button type="button" onClick={() => handleCitySelection('Jeddah')}>Jeddah</button>
                    <button type="button" onClick={() => handleInquiryTypeSelection('Riyadh')}>Riyadh</button>
                  </div>

                  <div className="inquiry-type-selection">
                    <button type="button" onClick={() => handleInquiryTypeSelection('Technical')}  >Technical</button>
                    <button type="button" onClick={() => handleInquiryTypeSelection('General')}>General</button>
                  </div>
                  <button type="submit">Submit</button>
                </form>
              </div>
            </div>
          ),
        },
      ]);
    }
  };
  const handleCitySelection = (city) => {
    setSelectedCity(city);
    cityRef.current = city; // Update the ref value
    console.log("Selected city:", city);
  };

  const handleInquiryTypeSelection = (type) => {
    setSelectedInquiryType(type);
    inquiryTypeRef.current = type; // Update the ref value
    console.log("Selected inquiry type:", type);
  };


  const handleUserInfoSubmit = async (event , tenantId ) => {
    event.preventDefault();
    const { name, email, phone } = event.target;
    console.log("name" , name)
    console.log("email" , email)
    console.log("phone" , phone)
    console.log("city:", cityRef.current); // Use the ref value
    console.log("inquiryType:", inquiryTypeRef.current); // Use the ref value
  
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
      setChat((prevChat) => [...prevChat, { sender: 'bot', message: `Welcome, ${name.value}! How can I help you?` }]);
      setShowInput(true);
  
      // Remove the initial message asking for user information
      setChat(prevChat => prevChat.slice(2));
  
      // After saving customer info, create an empty conversation in the database
      await createEmptyConversation(data.customer._id, tenantId , inquiryTypeRef.current , name.value, email.value, phone.value);
    } catch (error) {
      console.error('Error handling user info submit:', error);
    }
  };

  // Function to create an empty conversation in the backend
const createEmptyConversation = async ( userId , tenantId , inquiryType, name, email, phone) => {
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
        inquiryType: inquiryType,
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
  // user message 
  const request_temp = { sender: 'user', tenantId: tenantId, message: inputMessage, userInfo: userInfo }; // Include user information

  if (inputMessage.trim() !== '') {
    setChat((chat) => [...chat, request_temp]);
    setInputMessage('');
    setTimeout(() => {
      setBotTyping(true); 
      setTimeout(async () => {
        // rasa - user conection
        if (!connectToHumanAgent) {
          // sent messages to rasa bot
          const response = await rasaAPI(inputMessage , tenantId);
          // await rasa response 
          const responseData = await response.json();
          if (responseData && responseData.length > 0) {
            responseData.forEach((temp) => {
              console.log("temp", temp);
          
              const recipient_msg = temp['text'];
              setChat((prevChat) => [...prevChat, { sender: 'bot', message: recipient_msg }]);
              
              // if teh rasa response contain buttons , show the buttons in the chat interface 
              if (temp['buttons'] && temp['buttons'].length > 0) {
                setChat((prevChat) => [...prevChat, { sender: 'bot', buttons: temp['buttons'] }]);
              }
              // sent teh rasa  messages to the websocket
              if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ sender: 'user', tenantId: tenantId, message: inputMessage, ...userInfo }));
                ws.send(JSON.stringify({ sender: 'bot', tenantId: tenantId, botId: 'botid', message: recipient_msg, receiverId: userInfo.email }));
              }
            });
          
            setBotTyping(false);
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

// case where the rasa messages contain buttons 
const handleButtonClick = async (payload , tenantId) => {
  try {
    // if teh payload of teh button is requesting humain handoff
    if (payload === '/request_human_handoff') {
      // Handle the case when user chooses "Yes" to request human handoff
      ws.send(JSON.stringify({ sender: 'bot', tenantId : tenantId ,botId: 'botid', message: 'Sure, let me connect you with a human agent.', receiverId : userInfo.email }));
      setChat((prevChat) => [...prevChat, { sender: 'bot', message: 'Sure, let me connect you with a human agent.' }]);
      setConnectToHumanAgent(true); // Update state to indicate human handoff request
      // Send a message to Rasa indicating the user's choice
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ sender: 'bot', tenantId : tenantId ,botId: 'botid', message: 'User chose to request human handoff', receiverId : userInfo.email }));
      } 
    } else if (payload === '/continue_chat') { // if teh payload of teh button is continuing chatting with the rasa bot
      // Handle the case when user chooses "No" to continue chatting with the bot
      setChat((prevChat) => [...prevChat, { sender: 'bot', message: 'you chose to continue chatting with teh bot' , receiverId : userInfo.email }]);
      setConnectToHumanAgent(false); // Update state to indicate continuation of chat with bot
      // Send a message to Rasa indicating the user's choice
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ sender: 'bot', tenantId : tenantId ,botId: 'botid', message: 'User chose to continue chatting with the bot', receiverId : userInfo.email }));
      }
    } else {
      await rasaAPI(payload, tenantId);
    }
  } catch (error) {
    console.error('Error handling button click:', error);
  }
};

// function to sent messages tp the rasa bot from the user
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
        body: JSON.stringify({ sender: 'bot', metadata : {tenantId: tenantId} ,  tenantId: tenantId, botId : 'botid' , message: msg, receiverId : userInfo.email}), // Include user information
      });
    } catch (error) {
      console.error('Error fetching response from Rasa API:', error);
    }
  };

  // function too sent user's messages to the websocket
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


  // function to fetch teh history of the chat  for a selected  customer
  const fetchChatHistory = async (email , tenantId) => {
    try {
      const response = await fetch(`${chatHistory}?email=${email}&tenantId=${tenantId}`);
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
      <div className={`chat-icon ${isChatOpen ? 'active' : ''}`} onClick={toggleChat} style={{ color: 'white' }}>
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
              <div key={index} className={`message-container ${message.sender === 'human_agent' ? 'human-agent-message-container' : message.sender === 'bot' ? 'bot-message-container' : ''}`}>
                <div className={`message-bubble ${message.sender === 'human_agent' ? 'human-agent-message-bubble' : message.sender === 'bot' ? 'bot-message-bubble' : 'user-message-bubble'}`}>
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
