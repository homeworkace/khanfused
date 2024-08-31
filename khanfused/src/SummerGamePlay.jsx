import React, { useState, useEffect, useRef } from 'react';
import './SummerGamePlay.css';
import { getSession } from './utility.js';
import HelpButton from './Instructions';
import Timer from './Timer';
import PlayerList from "./PlayerList";

function SummerGamePlay({ socket, choices, setChoices, players, role }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isScoutListOpen, setIsScoutListOpen] = useState(false);
  const [selectedPlayerSession, setSelectedPlayerSession] = useState(null);
  const [isFarm, setIsFarm] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const selectedPlayerSessionRef = useRef(selectedPlayerSession);

  useEffect(() => {
    selectedPlayerSessionRef.current = selectedPlayerSession;
  }, [selectedPlayerSession]);

  useEffect(() => {
    if (isReady) {
      if (role === 'lord') {
        if (choices === 1) {
          socket.current.emit('ready', {
            session: getSession(),
            choice: selectedPlayerSessionRef.current 
          });
          console.log(`Ready button clicked. isReady: ${isReady}, role: ${role}, choices: ${choices}, selectedPlayerSession: ${selectedPlayerSessionRef.current}`);
        } else if (choices === 2) {
          socket.current.emit('ready', {
            session: getSession(),
            choice: -1
          });
          console.log(`Ready button clicked. isReady: ${isReady}, role: ${role}, choices: ${choices}, selectedPlayerSession: ${selectedPlayerSessionRef.current}`);
        }
      } else {
        socket.current.emit('ready', {
          session: getSession(),
        });
      }
      console.log('Emitted ready state:', isReady);
      console.log(`Ready button clicked. isReady: ${isReady}, role: ${role}, choices: ${choices}, selectedPlayerSession: ${selectedPlayerSessionRef.current}`);
    } else {
      socket.current.emit('unready', {
        session: getSession()
      });
      console.log('Emitted unready state:', isReady);
    }
  }, [isReady, choices, role, socket]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleTimeUp = () => {
    // handleDoubleHarvestChangeClick();
  };

  const toggleScoutList = () => {
    setIsScoutListOpen(!isScoutListOpen);
  };

  const handlePlayerSelect = (playerName) => {
    const selectedPlayer = players.find(p => p.name === playerName);
    if (selectedPlayer) {
      setSelectedPlayerSession(selectedPlayer.session);
    }
    setChoices(1);
  };

  const handleFarmClick = () => {
    setIsFarm(!isFarm);

    if (isFarm) {
      setChoices(2);
    } else {
      setChoices(null);
    }
  };

  const summerReadyClick = () => {
    setIsReady(!isReady);
    
  };

  const renderRoleSpecificContent = () => {
    if (role === "lord") {
      return (
        <div className="summer-lord-buttons">
          <button className={`farm-button ${isFarm ? "active" : ""}`} onClick={handleFarmClick}>Farm</button>
          <button className="scout-button" onClick={toggleScoutList}>Scout</button>
          {isScoutListOpen && (
            <div className="scout-list active">
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
    <div className="summer">
      <div className="summer-container">
        {isChatOpen && (
          <div className="chat-box">
            <p>Chat content goes here...</p>
          </div>
        )}
        <button onClick={toggleChat} className="chat-button">
          Chat
        </button>

        {renderRoleSpecificContent()}

        <div className="summer-button-bar">
          <button onClick={summerReadyClick}>
            {isReady ? "Unready" : "Ready"}
          </button>
        </div>

        <HelpButton />

        <div className="summer-player-list">
          <PlayerList players={players} />
        </div>

        <Timer duration={10} onTimeUp={handleTimeUp} />
      </div>
    </div>
  );
}

export default SummerGamePlay;
