import React, { useState, useEffect } from 'react';
import './WinterGamePlay.css';
import { getSession } from './utility.js';
import HelpButton from './Instructions';
import Timer from './Timer';
import PlayerList from "./PlayerList";

function WinterGamePlay({ role, players, currentSeason, socket }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPillageListOpen, setIsPillageListOpen] = useState(false);
  const [votedPlayerSession, setVotedPlayerSession] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [votes, setVotes] = useState({}); // To store votes

  useEffect(() => {
    if (votedPlayerSession) {
      setVotes(prevVotes => ({
        ...prevVotes,
        [votedPlayerSession]: (prevVotes[votedPlayerSession] || 0) + 1
      }));
    }
  }, [votedPlayerSession]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleTimeUp = () => {
    // Handle time-up logic here
  };

  const handlePlayerSelect = (playerName) => {
    if (!isReady && !votedPlayerSession) { 
      const selectedPlayer = players.find(p => p.name === playerName);
      if (selectedPlayer) {
        setVotedPlayerSession(selectedPlayer.session);
      }
    }
  };

  const togglePillageList = () => {
    setIsPillageListOpen(!isPillageListOpen);
  };

  const handleReadyClick = () => {
    if (!isReady) {
      socket.current.emit('ready', {
        state: currentSeason,
        session: getSession(),
        pillage: votedPlayerSession,
      });
    } else {
      setVotedPlayerSession(null);
      setVotes({}); // Reset votes on unready
      socket.current.emit('unready', {
        session: getSession(),
      });
    }
    setIsReady(!isReady);
  };

  const renderRoleSpecificContent = () => {
    if (role === "lord" || role === "khan") {
      return (
        <div className="pillage-container">
          <button className="pillage-button" onClick={togglePillageList} disabled={isReady}>Pillage</button>
          {isPillageListOpen && (
            <div className="pillage-list active">
              <ul>
                {players.filter(player => player.session != getSession()).map((player) => (
                  <li
                    key={player.session}
                    onClick={() => handlePlayerSelect(player.name)}
                    className={votedPlayerSession === player.session ? "selected" : ""}
                  >
                    {player.name}
                    {votes[player.session] > 0 && (
                      <span className="ticks">
                        {Array.from({ length: votes[player.session] }, (_, index) => (
                          <span key={index} className="tick">✔</span>
                        ))}
                      </span>
                    )}
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
    <div className="winter">
      <div className="winter-container">
        {isChatOpen && (
          <div className="chat-box">
            <p>Chat content goes here...</p>
          </div>
        )}
        <div className="winter-button-bar">
          <button onClick={toggleChat} className="chat-button">
            Chat
          </button>
          <button onClick={handleReadyClick}>
            {isReady ? "Unready" : "Ready"}
          </button>
        </div>
        {renderRoleSpecificContent()}
      </div>
    </div>
  );
}

export default WinterGamePlay;
