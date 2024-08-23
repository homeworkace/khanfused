import React, { useState } from 'react';
import './SummerGamePlay.css';

function SummerGamePlay( {handleSummerStage}) {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    }

    return (
        <div className="summer">
            <div className="summer-container">
                {isChatOpen && (
                    // ToDo:Retrieve chat content from backend
                    <div className="chat-box">
                        <p>Chat content goes here...</p>
                    </div>
                )}
                <div className="summer-button-bar">
                    <button onClick={toggleChat} className="chat-button">
                        Chat
                    </button>
                    <button onClick={handleSummerStage}> 
                        Proceed
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SummerGamePlay;
