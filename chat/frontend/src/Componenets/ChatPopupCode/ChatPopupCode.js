import React, { useState } from 'react';
import styled from 'styled-components';
import { chatCode, chatPopupStyles, APIRoutes, cssVariables, fetchColorsAndUpdateCSSString } from "./ChatPopupCodesStrings";


const ChatPopupCode = () => {
  const [showWindow, setShowWindow] = useState(false);
  const [selectedCode, setSelectedCode] = useState('chat.css');
  const [copied, setCopied] = useState({});

  const toggleWindow = () => {
    setShowWindow(!showWindow);
  };

  const copyToClipboard = (code, version) => {
    navigator.clipboard.writeText(code);
    setCopied({ ...copied, [version]: true });
    setTimeout(() => setCopied({ ...copied, [version]: false }), 2000);
  };

  const codeVersions = [
    { version: 'chat.js', code: chatCode },
    { version: 'chat.css', code: chatPopupStyles },
    { version: 'variables.css', code: cssVariables },
    { version: 'variables.js', code: fetchColorsAndUpdateCSSString },
    { version: 'apiroutes.js', code: APIRoutes }
  ];

  return (
    <ChatPopupContainer>
      <Title>Chat Pop-up Code</Title>
      <ShowButton onClick={toggleWindow}>Show Chat Pop-up Code</ShowButton>
      {showWindow && (
        <ChatPopupOverlay>
          <ChatPopupWindow>
            <div className="chat-popup-header">
              <CloseButton onClick={toggleWindow}>✕</CloseButton>
            </div>
            <div className="chat-popup-body">
              <CodeOptions>
                {codeVersions.map((codeObj) => (
                  <div key={codeObj.version} className="code-option">
                    <CodeOptionButton
                      className={selectedCode === codeObj.version ? 'selected' : ''}
                      onClick={() => setSelectedCode(codeObj.version)}
                    >
                      {codeObj.version}
                    </CodeOptionButton>
                    <button onClick={() => copyToClipboard(codeObj.code, codeObj.version)}>{copied[codeObj.version] ? "Copied!" : "Copy"}</button>
                  </div>
                ))}
              </CodeOptions>
              <CodeContainer>
                <pre>
                  <code>{codeVersions.find((codeObj) => codeObj.version === selectedCode).code}</code>
                </pre>
              </CodeContainer>
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

const CodeOptions = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
`;

const CodeOptionButton = styled.button`
  background-color: blue;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: darkblue;
  }

  &.selected {
    background-color: white;
    color: black;
  }
`;

const CodeContainer = styled.div`
  border: 2px solid white;
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  overflow: auto;
`;

export default ChatPopupCode;
