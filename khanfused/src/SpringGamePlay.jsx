import React, { useEffect, useState } from 'react';
import './SpringGamePlay.css';
import HelpButton from './Instructions';
import Timer from './Timer';

function SpringGamePlay({ handleDoubleHarvestChangeClick, role}) {
  const [isChatOpen, setIsChatOpen] = useState(false);


  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleTimeUp = () => {
    handleDoubleHarvestChangeClick();
  };

  const renderRoleSpecificContent = () => {
    console.log(`Current role is: ${role}`);
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
  };

  return (
    <div className="spring">
      <div className="spring-container">
        {isChatOpen && (
          <div className="chat-box">
            <p>Chat content goes here...</p>
          </div>
        )}

        <div className="spring-button-bar">
          <button onClick={toggleChat} className="chat-button">
            Chat
          </button>

          {renderRoleSpecificContent()} {}

          <HelpButton />

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
