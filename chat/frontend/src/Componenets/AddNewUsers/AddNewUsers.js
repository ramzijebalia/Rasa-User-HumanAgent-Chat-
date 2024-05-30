import React, { useState , useContext} from 'react';
import styled from 'styled-components';
import axios from 'axios'; 
import { registerRoute } from '../../utils/APIRoutes';
import { UserContext } from '../../Context/context';

const AddNewUsers = () => {
  const [showWindow, setShowWindow] = useState(false);
  const { currentUser } = useContext(UserContext);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    companyName: currentUser.companyName,
    companyPrefix: currentUser.companyPrefix
  });

  const toggleWindow = () => {
    setShowWindow(!showWindow);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(registerRoute, userData); 
      console.log(response.data);
      setUserData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        companyName: '',
        companyPrefix: ''
      });
      setShowWindow(false);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  return (
    <ChatPopupContainer>
      <Title>Add New Users</Title>
      <ShowButton onClick={toggleWindow}>Add New Users</ShowButton>
      {showWindow && (
        <ChatPopupOverlay>
          <ChatPopupWindow>
            <div className="chat-popup-header">
              <CloseButton onClick={toggleWindow}>✕</CloseButton>
            </div>
            <div className="chat-popup-body">
              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>First Name:</Label>
                  <Input
                    type="text"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleChange}
                    required
                    maxLength={50}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Last Name:</Label>
                  <Input
                    type="text"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleChange}
                    required
                    maxLength={50}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Username:</Label>
                  <Input
                    type="text"
                    name="username"
                    value={userData.username}
                    onChange={handleChange}
                    required
                    minLength={3}
                    maxLength={20}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Email:</Label>
                  <Input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    required
                    maxLength={50}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Company Name:</Label>
                  <Input
                    type="text"
                    name="companyName"
                    value={currentUser.companyName} 
                    readOnly
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Company Prefix (Tenant ID):</Label>
                  <Input
                    type="text"
                    name="companyPrefix"
                    value={currentUser.companyPrefix} 
                    readOnly
                  />
                </FormGroup>
                <SubmitButton type="submit">Add User</SubmitButton>
              </form>
            </div>
          </ChatPopupWindow>
        </ChatPopupOverlay>
      )}
    </ChatPopupContainer>
  );
};

const ChatPopupContainer = styled.div`
  position: relative;
`;

const Title = styled.h2`
  color: black;
`;

const ShowButton = styled.button`
  background-color: black;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: darkgray;
  }
`;

const ChatPopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const ChatPopupWindow = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: black;
  color: white;
  padding: 20px;
  border-radius: 8px;
  z-index: 1001;
  width: 70%;
  height: 80%;
  overflow: auto;
`;

const CloseButton = styled.button`
  background-color: transparent;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;

  &:hover {
    color: #ccc;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: white;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const SubmitButton = styled.button`
  background-color: black;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: darkgray;
  }
`;

export default AddNewUsers;
