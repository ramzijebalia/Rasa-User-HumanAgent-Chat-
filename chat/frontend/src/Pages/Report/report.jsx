import React, { useState, useEffect , useContext} from 'react';
import axios from 'axios';
import { allConversations } from '../../utils/APIRoutes';
import styled from 'styled-components'
import { addTrainingData } from '../../utils/APIRoutes';
import { UserContext } from '../../Context/context';

const Report = () => {
  const [conversations, setConversations] = useState([]);
  const [unansweredMessages, setUnansweredMessages] = useState([]);
  const [unansweredPercentage, setUnansweredPercentage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(7); // Set the number of rows per page
  const [showForm, setShowForm] = useState(false); // State to control form visibility
  const [selectedMessage, setSelectedMessage] = useState(null); // State to store selected message data
  const [intentData, setIntentData] = useState({name: '' , examples: '', response: ''});
  const { currentUser } = useContext(UserContext);
  console.log("hedi fil report " ,currentUser);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`${allConversations}?companyPrefix=${currentUser.companyPrefix}`);
        setConversations(response.data.conversations);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    fetchData();
  }, [currentUser]); 
  

  useEffect(() => {
    // Filter out messages sent by the user with no response
    const unanswered = conversations.flatMap(conversation => {
      const unansweredUserMessages = conversation.messages.filter((msg, index) => {
        if (msg && msg.sender === 'user' && msg.message && typeof msg.message === 'string' && msg.message.trim().length > 0) {
          const nextMsg = conversation.messages[index + 1];
          return nextMsg && nextMsg.sender === 'bot' && nextMsg.message === "Sorry, I didn't understand that. Would you like to talk with a human agent?";
        }
        return false;
      });
      return unansweredUserMessages;
    });

    // Count occurrences of each unanswered message
    const unansweredMap = new Map();
    unanswered.forEach(msg => {
      const text = msg.message.trim();
      if (unansweredMap.has(text)) {
        unansweredMap.set(text, unansweredMap.get(text) + 1);
      } else {
        unansweredMap.set(text, 1);
      }
    });

    // Convert map to array of objects for rendering
    const uniqueUnansweredMessages = Array.from(unansweredMap.entries()).map(([text, count]) => ({ text, count }));
    setUnansweredMessages(uniqueUnansweredMessages);

    // Calculate the percentage of unanswered messages
    const totalUserMessages = conversations.reduce((acc, conversation) => {
      return acc + conversation.messages.filter(msg => msg.sender === 'user').length;
    }, 0);
    const percentage = (unanswered.length / totalUserMessages) * 100;
    setUnansweredPercentage(percentage.toFixed(1)); // Rounded to 2 decimal places
  }, [conversations]);

  const handleButtonClick = (message) => {
    setSelectedMessage(message);
    setShowForm(true);
    setIntentData({
      ...intentData,
      examples: message.text // Populate the examples input with the message text
    });
  };
  
  const getCurrentRows = () => {
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return unansweredMessages.slice(indexOfFirstRow, indexOfLastRow);
  };

  // set pages in the table
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCloseForm = () => {
    setShowForm(false);
  };

  // function to add the rasa data after fill in the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formDataObject = {};
    formData.forEach((value, key) => {
      formDataObject[key] = value;
    });
    try {
      const response = await axios.post(addTrainingData, formDataObject);
      console.log(response.data);
    } catch (error) {
      console.error('Error adding rasa  data', error);
    }
    setShowForm(false);
  };
  return (

    <Content>
      <MessageTableContainer>
        <BorderWrapper>
          <TableTitle>Unanswered Messages</TableTitle>
          <MessageTable>
            <thead>
              <tr>
                <th> </th>
                <th>Message</th>
                <th>Occurrences</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentRows().map((msg, index) => (
                <tr key={index}>
                  <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                  <td>{msg.text}</td>
                  <td>{msg.count}</td>
                  <td>
                    <button onClick={() => handleButtonClick(msg)}>Action</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </MessageTable>
          <PaginationContainer>
            {Array.from({ length: Math.ceil(unansweredMessages.length / rowsPerPage) }, (_, i) => (
              <PaginationButton key={i} onClick={() => paginate(i + 1)}>
                {i + 1}
              </PaginationButton>
            ))}
          </PaginationContainer>
        </BorderWrapper>
      </MessageTableContainer>
      {showForm && (
          <>
            <FormOverlay />
            <FormBox>
            <form onSubmit={handleSubmit}>
              <CloseButton onClick={handleCloseForm}>X</CloseButton>
              <h2>Add New Intent</h2>
              <FormLabel>Company Prefix:</FormLabel>
              <FormInput type="text" name="companyPrefix" value={currentUser.companyPrefix} readOnly />
              <FormLabel>Intent Name:</FormLabel>
              <FormInput type="text" name="name" />
              <FormLabel>Example Phrases (comma-separated):</FormLabel>
              <FormInput type="text" name="examples" value={intentData.examples} onChange={(e) => setIntentData({ ...intentData, examples: e.target.value })} />
              <FormLabel>Response:</FormLabel>
              <FormInput type="text" name="response" />
              <SubmitButton type="submit">Add Intent</SubmitButton>
              </form>

            </FormBox>
          </>
        )}
    </Content>
  );
};


const FormOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black */
  z-index: 999; /* Ensure it's behind the form box but above the rest of the content */
`;

const FormBox = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  z-index: 1000;
  width: 30%;
  height: 60%;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center align form elements */
  justify-content: center; /* Center align form elements */
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
`;

/* Style for form inputs */
const FormInput = styled.input`
  width: 80%;
  padding: 10px;
  margin: 10px;
  border: 2px solid #4e0eff;
  border-radius: 10px;
`;

/* Style for form labels */
const FormLabel = styled.label`
  margin: 8px;
  font-weight: bold;
`;

/* Style for submit button */
const SubmitButton = styled.button`
  width: 40%;
  padding: 10px;
  margin: 10px;
  background-color: #4e0eff;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
`;


const Content = styled.div`
  display: flex;
  flex: 1;
  margin-top: 2%;
  overflow: hidden; /* Prevent content overflow */
`;

const TableTitle = styled.h2`
  margin-bottom: 10px;
  color: #4e0eff;
`;
const MessageTableContainer = styled.div`

  width: 100%;
  margin-right : 2%;
  margin-left : 2%;
`;


const MessageTable = styled.table`
  width: 100%;
  margin-top: 20px;
  position: relative;

  th,
  td {
    padding: 8px;
    text-align: left;
    line-height: 2.5;
  }

  th {
    background-color: #f2f2f2;
    position: sticky;
    top: 0;
    z-index: 2;
  }

  tbody::-webkit-scrollbar {
    display: none;
  }

  tr:nth-child(even),
  tr:nth-child(odd) {
    background-color: #f2f2f2;
  }

  tr:first-child th {
    position: sticky;
    left: 0;
    background-color: #f2f2f2;
    z-index: 1;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const PaginationButton = styled.button`
  margin: 0 5px;
  padding: 5px 10px;
  background-color: #4e0eff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #6200ea;
  }
`;
const BorderWrapper = styled.div`
  border: 2px solid #4e0eff;
  border-radius: 20px;
  padding: 10px;
  background-color: #f2f2f2;
`;

export default Report;
