import React, { useState } from 'react';
import './SummerGamePlay.css';
import { getSession } from './utility.js';
import HelpButton from './Instructions';
import Timer from './Timer';
import PlayerList from "./PlayerList";

function SummerGamePlay({ socket, choices, setChoices, players, role, currentSeason }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isScoutListOpen, setIsScoutListOpen] = useState(false);
  const [selectedPlayerSession, setSelectedPlayerSession] = useState(null);
  const [isFarm, setIsFarm] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleTimeUp = () => {
    // handleDoubleHarvestChangeClick();
  };

  const toggleScoutList = () => {
    setIsScoutListOpen(!isScoutListOpen);
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayerSession(player.session);
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

    if (!isReady) {
      if (role === 'lord') {
        // scout
        if (choices === 1) {
          socket.current.emit('ready', {
            state: currentSeason,
            session: getSession(),
            choice: selectedPlayerSession
          });
        // farm
        } else if (choices === 2) {
          socket.current.emit('ready', {
            state: currentSeason,
            session: getSession(),
            choice: -1
          });
          console.log('Farm choice selected.');
        }
      } else {
        socket.current.emit('ready', {
          state: currentSeason,
          session: getSession(),
        });
      }
      console.log(`Ready button clicked. isReady: ${isReady}, role: ${role}, choices: ${choices}, selectedPlayerSession: ${selectedPlayerSession}`);
    } else {
      socket.current.emit('unready', {
        state: currentSeason,
        session: getSession()
      });
    }
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
            Ready
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
