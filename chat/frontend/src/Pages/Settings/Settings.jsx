
import React from 'react';
import styled from 'styled-components';
import RasaSettings from '../../Componenets/RasaSetting/RasaSettings';
import ColorsSettings from '../../Componenets/ColorsSettings/ColorsSettings';
import ChatPopupCode from '../../Componenets/ChatPopupCode/ChatPopupCode';
import AddNewUsers from '../../Componenets/AddNewUsers/AddNewUsers';

const Settings = () => {
  return (
    <SettingsContainer>
      <FirstColumn>
        <ColorsSettings/>
        <RasaSettings />
      </FirstColumn>
      <SecondColumn>
        <ChatPopupCode />
        <AddNewUsers />
      </SecondColumn>
    </SettingsContainer>
  );
};



const SettingsContainer = styled.div`
  display: flex;
  width: 100%;
`;

const FirstColumn = styled.div`
  flex: 0 0 70%; /* 70% width */
`;

const SecondColumn = styled.div`
  flex: 1; /* Remaining space */
  border-left: 1px solid black; /* Add black border to the left */
  padding-left: 10px; /* Optional: Add padding to separate the border from the content */
`;

export default Settings;
