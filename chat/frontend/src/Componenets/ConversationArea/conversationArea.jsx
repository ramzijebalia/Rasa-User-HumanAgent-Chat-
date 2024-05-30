import React from 'react';
import styled from 'styled-components';


// the area to show all the customers ( )
const ConversationArea = ({ users, handleUserClick   }) => {
  return (
    <ConversationContainer>
      {Object.keys(users).map((inquiryType) => (
        <div key={inquiryType}>
          <h3>{inquiryType}</h3>
          {users[inquiryType].map((user, index) => (
            <UserInfo key={index} onClick={() => handleUserClick(user)}>
              {user && (
                <MessageContainer>
                  <ProfileImage
                src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/3364143/download+%2812%29.png"
                alt=""
              />
                  <MessageDetail>
                    <div className="msg-username">{user.name}</div>
                    <div className="msg-username">{user.email}</div>
                    <div className="msg-content">

                    </div>
                  </MessageDetail>
                </MessageContainer>
              )}
            </UserInfo>
          ))}
        </div>
      ))}
    </ConversationContainer>
  );
  

}

const ConversationContainer = styled.div`
width: 20%;
flex-shrink: 0;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  transition: 0.2s;
  position: relative;

  &:hover {
    background-color: var(--msg-hover-bg);
  }

  &:active {
    background: var(--active-conversation-bg);
    border-left: 4px solid var(--theme-color);
  }

  &:before {
    content: "";
    position: absolute;
    background-color: #23be7e;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    border: 2px solid var(--theme-bg-color);
    left: 50px;
    bottom: 19px;
  }
`;

const MessageContainer = styled.div`
  display: flex;
`;

const ProfileImage = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
`;

const MessageDetail = styled.div`
  overflow: hidden;

  .msg-username {
    margin-bottom: 4px;
    font-weight: 600;
    font-size: 15px;
  }

  .msg-content {
    font-weight: 500;
    font-size: 13px;
    display: flex;

    .msg-message {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--msg-message);
    }

    .msg-date {
      font-size: 14px;
      color: var(--msg-date);
      margin-left: 3px;
    }
  }
`;

export default ConversationArea;
