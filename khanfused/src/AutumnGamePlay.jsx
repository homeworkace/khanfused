import React, { useState, useEffect, useRef } from 'react';
import './AutumnGamePlay.css'; 
import { getSession } from './utility.js';
import HelpButton from './Instructions';
import Timer from './Timer';
import PlayerList from "./PlayerList";

function AutumnGamePlay({status, socket, role, players, currentSeason }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBanishListOpen, setBanishListOpen] = useState(false);
  const [selectedPlayerSession, setSelectedPlayerSession] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const isInitialMount = useRef(true);

  const selectedPlayerSessionRef = useRef(selectedPlayerSession);

  useEffect(() => {
    selectedPlayerSessionRef.current = selectedPlayerSession;
  }, [selectedPlayerSession]);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      if (isReady) {
        socket.current.emit('ready', {
          state: currentSeason,
          session: getSession(),
          banish: role === 'king' ? selectedPlayerSessionRef.current : null
        });
        console.log(`Banish: ${selectedPlayerSessionRef.current}`);
      } else {
        socket.current.emit('unready', {
          state: currentSeason,
          session: getSession()
        });
      }
    }
  }, [isReady, role, socket, currentSeason]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const toggleBanishList = () => {
    setBanishListOpen(!isBanishListOpen);
  };

  const handleTimeUp = () => {

  }

  const handlePlayerSelect = (player) => {
    setSelectedPlayerSession(player.session);
  };

  const autumnReadyClick = () => {
    setIsReady(!isReady);
  };

  const renderRoleSpecificContent = () => {
    if (role === "king" ) {
      return (
        <div>
          <button className="banish-button" onClick={toggleBanishList}>Banish</button>
          {isBanishListOpen && (
            <div className="banish-list active">
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
    <div className={`autumn ${status === 1 ? 'greyed-out': ""}`}>
      <div className="autumn-container">
        {isChatOpen && (
          <div className="chat-box">
            <p>Chat content goes here...</p>
          </div>
        )}

        <div className="autumn-button-bar">
          <button onClick={toggleChat} className="chat-button">Chat</button>

          <div className="autumn-player-list">
            <PlayerList players={players} />
          </div>

          {renderRoleSpecificContent()} 

          <HelpButton />
        
          <button onClick={autumnReadyClick} disabled = {status === 1}>
            {isReady ? "Unready" : "Ready"}
          </button>
        </div>

        <Timer duration={10} onTimeUp={handleTimeUp} />
      </div>
    </div>
  );
}

export default AutumnGamePlay;
