import React, { useState, useEffect , useContext} from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { retrievecolors, saveColors } from '../../utils/APIRoutes';
import { UserContext } from '../../Context/context';

const ColorsSettings = () => {
  const { currentUser } = useContext(UserContext);
  console.log("curr0" , currentUser)
  // default color for teh chat  bubble 
  const defaultColors = {
    ChatBubbleBgStart: '#6660d6',
    ChatBubbleBgMid: '#a9dc52',
    ChatBubbleBgEnd: '#00d4ff',
    ChatBackgroundColor: '#ffffff',
    BotMsgBubbleColor: '#E5E5EA',
    HumanMsgBubbleColor: '#C7D8ED',
    UserMsgBubbleColor: '#f7f7f7',
    UserBotMsgTextColor: '#000000',
    ChatWindowBorderColor: '#007bff',
    ChatWindowColor: '#007bff',
    FormContainerColor: '#0a5db5',
    FormUserInfoColor: '#007bff',
    FormContainerTextColor: '#ffffff',
  };

  const [colors, setColors] = useState({ ...defaultColors });

  // rsest colors to default  
  const handleResetColors = () => {
    setColors({ ...defaultColors });
  };

  const fetchColors = async (companyPrefix) => {
    try {
      console.log(`${retrievecolors}?companyPrefix=${companyPrefix}`)
      const response = await axios.get(`${retrievecolors}?companyPrefix=${companyPrefix}`);
      setColors(response.data.colors);
    } catch (error) {
      console.error('Error fetching colors:', error);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.companyPrefix) {
        console.log("companyPrefix:", currentUser.companyPrefix); // Log the company prefix here
        fetchColors(currentUser.companyPrefix);
    }
}, [currentUser]);
  
  

  const handleColorChange = (key, value) => {
    setColors({ ...colors, [key]: value });
  };

  // function to save the colors
  const handleSaveColors = async (companyPrefix) => {
    try {
      await axios.post(saveColors, { colors ,companyPrefix });
      alert('Colors saved successfully.');
    } catch (error) {
      console.error('Error saving colors:', error);
      alert('Failed to save colors. Please try again.');
    }
  };
  useEffect(() => {
    fetchColors();
  }, []);
  

  const labels = {
    ChatBubbleBgStart: '[Chat window header + user bubble] color Start',
    ChatBubbleBgMid: '[Chat window header + user bubble] color Middle',
    ChatBubbleBgEnd: '[Chat window header + user bubble] color End',
    ChatBackgroundColor: 'Chat Background color',
    BotMsgBubbleColor: 'Bot Message Bubble Color',
    HumanMsgBubbleColor: 'Human agent Message Bubble Color',
    UserMsgBubbleColor: 'Customer Message Text Color',
    UserBotMsgTextColor: 'User/Bot Message Text Color',
    ChatWindowBorderColor: 'Chat Window Border Color',
    ChatWindowColor: 'Chat input and button Color',
    FormContainerColor: 'Form Button Color',
    FormUserInfoColor: 'Form User Info Color',
    FormContainerTextColor: 'Header, buttons Text Color',
  };

  return (
    <ColorSettingsContainer>
      <h2>Chat Bubble Colors Settings</h2>
      {/*  show teh colors in table , 2x(labels colonne + inpit colors colonne )*/ }
      <ColorTable>
        <tbody>
          {Object.entries(colors).map(([key, value], index) => (
            index % 2 === 0 && (
              <ColorTableRow key={key}>
                <ColorTableCell>
                  <ColorLabel>{labels[key]}</ColorLabel>
                </ColorTableCell>
                <ColorTableCell>
                  <ColorInput
                    type="color"
                    value={colors[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                  />
                </ColorTableCell>
                {index < Object.entries(colors).length - 1 && (
                  <ColorTableCell>
                    <ColorLabel>{labels[Object.keys(colors)[index + 1]]}</ColorLabel>
                  </ColorTableCell>
                )}
                {index < Object.entries(colors).length - 1 && (
                  <ColorTableCell>
                    <ColorInput
                      type="color"
                      value={colors[Object.keys(colors)[index + 1]]}
                      onChange={(e) => handleColorChange(Object.keys(colors)[index + 1], e.target.value)}
                    />
                  </ColorTableCell>
                )}
              </ColorTableRow>
            )
          ))}
        </tbody>
      </ColorTable>
      <ButtonContainer>
        <Button onClick={() => handleSaveColors(currentUser.companyPrefix)}>Save</Button>
        <Button onClick={handleResetColors}>Reset</Button>
      </ButtonContainer>
    </ColorSettingsContainer>
  );
};

const ColorSettingsContainer = styled.div`
    margin-top: 1%;
    margin-left: 2%;
    position: relative;
  `;

  const ColorTable = styled.table`
    width: 100%;
    border-collapse: collapse;
  `;

  const ColorTableRow = styled.tr`
    &:nth-child(odd) {
      background-color: #f2f2f2;
    }
  `;

  const ColorTableCell = styled.td`
    padding: 10px;
  `;

  const ColorLabel = styled.span`
    margin-right: 10px;
  `;

  const ColorInput = styled.input`
    margin-right: 20px;
  `;

const ButtonContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
`;

const Button = styled.button`
  background-color: #131324;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  padding: 8px 16px;
  margin-right: 10px;
  cursor: pointer;
`;

export default ColorsSettings;
