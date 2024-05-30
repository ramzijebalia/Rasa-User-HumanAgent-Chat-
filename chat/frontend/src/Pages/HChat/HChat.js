// HChat.js
import React, { useState, useEffect , useContext } from 'react';
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import ConversationArea from '../../Componenets/ConversationArea/conversationArea';
import ChatArea from '../../Componenets/ChatArea/ChatArea';
import { chatHistory, userWithLastMsg } from '../../utils/APIRoutes';
import { UserContext }from '../../Context/context';

function HChat({ ws }) {
  const [inputMessage, setInputMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [chat, setChat] = useState([]);
  const [selectedUserConversation, setSelectedUserConversation] = useState([]);
  //const [currentUser, setCurrentUser] = useState(undefined);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(UserContext); 

  // function to fetch teh currentuuser adta and save it into local storage
  const fetchUserData = async () => {
    try {
      const storedUserData = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
      if (!storedUserData) {
        navigate("/login");
      } else {
        const userData = JSON.parse(storedUserData);
        setCurrentUser(userData);
        // Save currentUser to local storage
        localStorage.setItem('currentUser', JSON.stringify(userData));
        return userData; // Return the user data
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  
  useEffect(() => {
    const initializeUserData = async () => {
      const userData = await fetchUserData();
      console.log("Current user:", userData);
      if (userData && userData.companyPrefix) {
        console.log("Fetching users with company prefix:", userData.companyPrefix);
        fetchUsersWithLastMessage(userData.companyPrefix);
      }
    
    };
  
    initializeUserData();
  }, []);

  useEffect(() => {
    const fetchUserDataInterval = setInterval(() => {
      if(currentUser && currentUser.companyPrefix) {
        fetchUsersWithLastMessage(currentUser.companyPrefix);
      }
    }, 1000);
  
    return () => clearInterval(fetchUserDataInterval);
  }, [currentUser]);
  

  useEffect(() => {
    if (ws) {
      ws.onmessage = function(event) {
        const message = JSON.parse(event.data);
        console.log('Received message from server:', message);
        // Update conversation state immediately upon receiving a new message
        setSelectedUserConversation(prevConversation => [...prevConversation, message]);
      };
    }
  }, [ws]);



  // function to fetch teh users in teh converstaional area 
  const fetchUsersWithLastMessage = async (companyPrefix) => {
    try {
      console.log('Fetching users with company prefix:', companyPrefix);
      const response = await fetch(`${userWithLastMsg}?companyPrefix=${companyPrefix}`);
      console.log('url', `${userWithLastMsg}?companyPrefix=${companyPrefix}`)
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const userData = await response.json();
      console.log('Users fetched:', userData);

      // Set users array to state
      setUsers(userData);
  
      // Optionally, you can save to localStorage here
      localStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  

  // function to show teh convverstaion in teh chatarea when we click on a specific customer in teh converstaional arae
  const handleUserClick = async (user) => {
    try {
      setSelectedUser(user);
      console.log('Selected user:', user);
      const response = await fetch(`${chatHistory}?email=${user.email}&tenantId=${user.tenantId}`);
      const conversation = await response.json();
      setSelectedUserConversation(conversation);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  // functio to sent messages from teh human agnet to teh custiomers 
  const handleSubmit = (evt,tenantId, receiverId) => {
    try{
    evt.preventDefault();
    if (inputMessage.trim() !== "") {
      sendMessageToServer(inputMessage, tenantId, receiverId);
      setChat(prevConversation => [...prevConversation, { sender: "human_agent", message: inputMessage }]);
      // Add the sent message to the conversation state immediately
      setSelectedUserConversation(prevConversation => [...prevConversation, { sender: "human_agent", message: inputMessage }]);
      localStorage.setItem('chatMessages', JSON.stringify([...chat, { sender: "human_agent", message: inputMessage }]));
      setInputMessage('');
    } else {
      window.alert("Please enter a valid message");
    }}
    catch(e){
      console.log(e)
    }
  };

  // snet messages to teh  web socket servver
  const sendMessageToServer = (message, companyPrefix, receiverId ) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ sender: "human_agent", tenantId:companyPrefix, receiverId, message }));
    } else {
      console.error('WebSocket connection not open');
    }
  };
  


useEffect(() => {
  // Fetch chat messages from localStorage if available
  const cachedChatMessages = localStorage.getItem('chatMessages');
  if (cachedChatMessages) {
    setChat(JSON.parse(cachedChatMessages));
  }
}, []);

  return (
    <div className="wrapper">
      <ConversationArea users={users} handleUserClick={handleUserClick}/>
      <Divider />
      <ChatArea
        selectedUserConversation={selectedUserConversation}
        currentUser = {currentUser}
        handleSubmit={handleSubmit}
        selectedUser={selectedUser}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
      />
    </div>
  );
}

const Divider = styled.div`
  border-left: 2px solid #4e0eff;
  height: 100%;
  margin-right: 1%;
  margin-left: 1%;
`;

export default HChat;
