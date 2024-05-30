import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

//import '../../Pages/Settings/Settings.css';
import {  trainRasaBot , startRasaActions , startRasaServer , stopRasaServer } from "../../utils/APIRoutes"


export default function RasaSettings() {

    const [loading, setLoading] = useState(false);

    // function to  stop teh  rasa server
    const handleStopRasaServer = async () => {
        setLoading(true);
        try {
          // Make a POST request to stop the Rasa server
          await axios.post(stopRasaServer);
          alert('Rasa server stopped successfully.');
        } catch (error) {
          alert('Error stopping Rasa server. Please check the console for details.');
          console.error('Error stopping Rasa server:', error);
        }
        setLoading(false);
      };
    
      // function to train teh rasa server
      const handletrainRasa = async () => {
        try {
          // Make a POST request to trigger the training process
          const response = await fetch( trainRasaBot, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log('response:', response);
    
          if (response.ok) {
            alert('Rasa Bot training initiated successfully.');
          } else {
            throw new Error('Failed to initiate Rasa Bot training.');
          }
        } catch (error) {
          console.error('Error initiating Rasa Bot training:', error.message);
          alert('Error initiating Rasa Bot training. Please try again later.');
        }
      };
    
    
      // function to start rasa sctions server
      const handleStartRasaActionsServer = async () => {
        try {
          // Make a POST request to trigger the training process
          const response = await fetch(startRasaActions, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log('response action :', response);
    
          if (response.ok) {
            alert('Rasa actions server started successfully.');
          } else {
            throw new Error('Failed to initiate Rasa actions server');
          }
        } catch (error) {
          console.error('Error starting Rasa actions server. Please check the console for details.', error.message);
          alert('Error initiating Rasa Bot Actiions server. Please try again later.');
        }
        setLoading(false);
      };
    
    
    
      // function to start rasa serer
      const handleStartRasaServer = async () => {
        try {
          // Make a POST request to trigger the training process
          const response = await fetch(startRasaServer, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log('response server:', response);
    
          if (response.ok) {
            alert('Rasa server started successfully.');
          } else {
            throw new Error('Failed to initiate Rasa  server');
          }
        } catch (error) {
          console.error('Error starting Rasa erver. Please check the console for details.', error.message);
          alert('Error initiating Rasa Bot  server. Please try again later.');
        }
      };
    

      return (
    <RasaSettingsContainer>
      <h2>Rasa Bot Settings</h2>
      <ButtonGrid>
        <ButtonName>1- Stop Rasa Server:</ButtonName>
        <StyledButton onClick={handleStopRasaServer}>Stop Rasa Server</StyledButton>

        <ButtonName>2- Train Rasa Bot:</ButtonName>
        <StyledButton onClick={handletrainRasa}>Train Rasa Bot</StyledButton>

        <ButtonName>3- Start Rasa Actions Server:</ButtonName>
        <StyledButton onClick={handleStartRasaActionsServer}>Start Rasa Actions Server</StyledButton>

        <ButtonName>4- Start Rasa Server:</ButtonName>
        <StyledButton onClick={handleStartRasaServer}>Start Rasa Server</StyledButton>

      </ButtonGrid>
    </RasaSettingsContainer>
      );
    }

const RasaSettingsContainer = styled.div`
    margin-top: 2%;
    margin-left: 2%;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two columns */
  gap: 10px; /* Gap between columns */
`;
const ButtonName = styled.span`
margin-right: 10px; // Adjust margin as needed
`;

const StyledButton = styled.button`
  background-color: #131324; /* Set the background color */
  color: white; /* Set the text color */
  padding: 8px 16px; /* Adjust padding as needed */
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;
