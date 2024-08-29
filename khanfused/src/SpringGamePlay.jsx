import React, { useState } from 'react';
import './SpringGamePlay.css';
import HelpButton from './Instructions';
import Timer from './Timer';
import { getSession } from './utility.js';
import PlayerList from "./PlayerList";

function SpringGamePlay({ socket, role, players}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDoubleHarvestListOpen, setDoubleHarvestListOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

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
    setSelectedPlayer(player);
  };

  const springReadyClick = () => {

    // check if double harvest is selected first
    if (role === "king") {
      if (selectedPlayer === null) {
        console.log("King select a player for DH");
        return;
      }
    }

    socket.current.emit('ready', {
        session: getSession()
    });

    console.log(`Player ${getSession()} is ready`);
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
                {players.map((player) => (
                  <li 
                    key={player.session} 
                    onClick={() => handlePlayerSelect(player)}
                    className={selectedPlayer?.session === player.session ? "selected" : ""}
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
            Ready
          </button>
        </div>

        <Timer duration={10} onTimeUp={handleTimeUp} />
      </div>
    </div>
  );
}

export default SpringGamePlay;
