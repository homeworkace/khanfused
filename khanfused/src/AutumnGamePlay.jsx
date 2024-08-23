import React, { useState } from 'react';
import './AutumnGamePlay.css';

function AutumnGamePlay( {handleAutumnStage}) {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    }

    return (
        <div className="autumn">
            <div className="autumn-container">
                {isChatOpen && (
                    // ToDo:Retrieve chat content from backend
                    <div className="chat-box">
                        <p>Chat content goes here...</p>
                    </div>
                )}
                <div className="autumn-button-bar">
                    <button onClick={toggleChat} className="chat-button">
                        Chat
                    </button>
                    <button onClick={handleAutumnStage}> 
                        Proceed
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AutumnGamePlay;
