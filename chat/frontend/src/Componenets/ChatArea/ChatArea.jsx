import React, { useRef, useEffect } from 'react';
import "./chatarea.css"

const ChatArea = ({ selectedUserConversation, currentUser, handleSubmit, setInputMessage, inputMessage, selectedUser }) => {
    const chatAreaRef = useRef(null);

    // Function to scroll to the bottom of the chat area
    const scrollToBottom = () => {
        chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    };

    // Scroll to bottom on initial render and whenever selectedUserConversation changes
    useEffect(() => {
        scrollToBottom();
    }, [selectedUserConversation]);

    return (
        <div className="chat-area" ref={chatAreaRef}>
            <div className="chat-area-header">
                <div className="chat-area-title">Sneder</div>
            </div>
            <div className="chat-area-main">
                {/* Render full conversation for selected user */}
                {selectedUserConversation.map((message, index) => (
                    <div key={index} className={`chat-msg ${message.sender === 'user' ? '' : 'owner'}`}>
                        <div className="chat-msg-profile">
                            <img
                                className="chat-msg-img"
                                src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/3364143/download+%2812%29.png"
                                alt=""
                            />
                            <div className="chat-msg-date">{message.timestamp}</div>
                        </div>
                        {/* Render message content */}
                        <div className="chat-msg-content">
                            <div className="chat-msg-text">
                                {message.message}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="chat-area-footer">
                <form onSubmit={(evt) => handleSubmit(evt, currentUser.companyPrefix, selectedUser.email)}>
                    <input onChange={e => setInputMessage(e.target.value)} value={inputMessage} type="text" />
                </form>
            </div>
        </div>
    );
};

export default ChatArea;
