import React, { useState } from 'react';
import './SpringGamePlay.css';
import HelpButton from './Instructions';
import Timer from './Timer';
import { getSession } from './utility.js';
import PlayerList from "./PlayerList";

function SpringGamePlay({ socket, role, players, currentSeason}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDoubleHarvestListOpen, setDoubleHarvestListOpen] = useState(false);
  const [selectedPlayerSession, setSelectedPlayerSession] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleTimeUp = () => {
    // handleDoubleHarvestChangeClick();
  };

  const toggleDoubleHarvestList = () => {
    setDoubleHarvestListOpen(!isDoubleHarvestListOpen);
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayerSession(player.session); 
  };

  const springReadyClick = () => {

    // check if double harvest is selected first
    if (role === "king") {
      if (selectedPlayerSession === null) {
        console.log("King select a player for DH");
        return;
      }
    }
    
    if(!isReady) {
      
      socket.current.emit('ready', {
        state: currentSeason,
        session: getSession(),
        double_harvest : role === 'king' ? selectedPlayerSession : null
      });
      console.log(`Player ${getSession()} is ready`);
      console.log(`Double Harvest: ${selectedPlayerSession}`);
    } else {
      socket.current.emit('unready', {
        state: currentSeason,
        session: getSession()
      });
      console.log(`Player ${getSession()} is unready`);
    }

    setIsReady(!isReady);

};

  const renderRoleSpecificContent = () => {
    console.log(`Current role is: ${role}`);
    if (role === "king") {
      return (
        <div>
          <button className="double-harvest-button" onClick={toggleDoubleHarvestList}>Double Harvest</button>
          {isDoubleHarvestListOpen && (
            <div className="double-harvest-list active">
              <ul>
                {players.filter(player => player.session != getSession()).map((player) => (
                  <li 
                    key={player.session} 
                    onClick={() => handlePlayerSelect(player)}
                    className={selectedPlayerSession === player.session ? "selected" : ""}
                  >
                    {player.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
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

          <div className="spring-player-list">
                <PlayerList players={players} />
          </div>

        {renderRoleSpecificContent()} 

          <HelpButton />
        
          <button onClick={springReadyClick}>
            {isReady ? "Unready" : "Ready"}
          </button>
        </div>

        <Timer duration={10} onTimeUp={handleTimeUp} />
      </div>
    </div>
  );
}

export default SpringGamePlay;
