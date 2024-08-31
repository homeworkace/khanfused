import React, { useState, useEffect, useRef } from 'react';
import './SpringGamePlay.css';
import HelpButton from './Instructions';
import Timer from './Timer';
import { getSession } from './utility.js';
import PlayerList from "./PlayerList";

function SpringGamePlay({ socket, role, players }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDoubleHarvestListOpen, setIsDoubleHarvestListOpen] = useState(false);
  const [selectedPlayerSession, setSelectedPlayerSession] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const selectedPlayerSessionRef = useRef(selectedPlayerSession);

  useEffect(() => {
    selectedPlayerSessionRef.current = selectedPlayerSession;
  }, [selectedPlayerSession]);

  useEffect(() => {
    if (isReady) {
      socket.current.emit('ready', {
        session: getSession(),
        double_harvest: role === 'lord' ? selectedPlayerSessionRef.current : null
      }
    );
      console.log(`Player ${getSession()} is ready`);
      console.log(`Double Harvest: ${selectedPlayerSessionRef.current}`);
    } else {
      socket.current.emit('unready', {
        session: getSession()
      });
      console.log(`Player ${getSession()} is unready`);
    }
  }, [isReady, role, socket]); 

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleTimeUp = () => {
    // handleDoubleHarvestChangeClick();
  };

  const toggleDoubleHarvestList = () => {
    setIsDoubleHarvestListOpen(!isDoubleHarvestListOpen);
  };

  const handlePlayerSelect = (playerName) => {
    const selectedPlayer = players.find(p => p.name === playerName);
    if (selectedPlayer) {
      setSelectedPlayerSession(selectedPlayer.session);
    }
  };

  const springReadyClick = () => {
    // Check if double harvest is selected first
    if (role === "king") {
      if (selectedPlayerSessionRef.current === null) {
        console.log("King select a player for Double Harvest");
        return;
      }
    }
    setIsReady(!isReady); 
    
  };

  const renderRoleSpecificContent = () => {
    if (role === "lord") {
      return (
        <div>
          <button className="double-harvest-button" onClick={toggleDoubleHarvestList}>Double Harvest</button>
          {isDoubleHarvestListOpen && (
            <div className="double-harvest-list active">
              <ul>
                {players.filter(player => player.session != getSession()).map((player) => (
                  <li 
                    key={player.session} 
                    onClick={() => handlePlayerSelect(player.name)}
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
