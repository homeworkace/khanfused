import React, { useState } from 'react';
import './SpringGamePlay.css';

function SpringGamePlay( {handleSpringStage}) {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    }

    return (
        <div className="spring">
            <div className="spring-container">
                {isChatOpen && (
                    // ToDo:Retrieve chat content from backend
                    <div className="chat-box">
                        <p>Chat content goes here...</p>
                    </div>
                )}
                <div className="spring-button-bar">
                    <button onClick={toggleChat} className="chat-button">
                        Chat
                    </button>
                    <button onClick={handleSpringStage}> 
                        Proceed
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SpringGamePlay;
