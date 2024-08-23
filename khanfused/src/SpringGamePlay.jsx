import React, { useState } from 'react';
import './SpringGamePlay.css';
import Timer from './Timer';

function SpringGamePlay( {handleDoubleHarvestChangeClick}) {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    }

    const handleTimeUp = () => {
        handleDoubleHarvestChangeClick();
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
                    <button onClick={handleDoubleHarvestChangeClick}> 
                        Proceed
                    </button>
                </div>
                <Timer duration={10} onTimeUp={handleTimeUp} />
            </div>
        </div>
    );
}

export default SpringGamePlay;
