import React, { useState } from 'react';
import './WinterGamePlay.css';

function WinterGamePlay( {handleWinterStage}) {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    }

    return (
        <div className="winter">
            <div className="winter-container">
                {isChatOpen && (
                    // ToDo:Retrieve chat content from backend
                    <div className="chat-box">
                        <p>Chat content goes here...</p>
                    </div>
                )}
                <div className="winter-button-bar">
                    <button onClick={toggleChat} className="chat-button">
                        Chat
                    </button>
                    <button onClick={handleWinterStage}> 
                        Proceed
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WinterGamePlay;
