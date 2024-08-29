import React, { useState } from 'react';
import './SummerGamePlay.css';

function SummerGamePlay( {handleSummerStage, role}) {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    }

    const renderRoleSpecificContent = () => {
        if (role === "king") {
            return (
                <div>
                    <p>You are the King. Manage your resources wisely!</p>
                </div>
            );
        } else if (role === "lord") {
            return (
                <div>
                    <p>You are a Lord. Protect your lands!</p>
                </div>
            );
        } else if (role === "khan") {
            return (
                <div>
                    <p>You are the Khan. Conquer new territories!</p>
                </div>
            );
        }
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
