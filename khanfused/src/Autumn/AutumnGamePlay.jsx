import React, { useState, useEffect, useRef } from 'react';
import './AutumnGamePlay.css';
import kingIcon from "../Assets/king.svg";
import lordIcon from "../Assets/lord.svg";
import khanIcon from "../Assets/khan.svg";
import unknownIcon from "../Assets/unknown.svg";
import { getSession } from '../utility.js';
import HelpButton from '../Helper/Instructions.jsx';
import Timer from '../Helper/Timer.jsx';
import GrainList from "../Helper/PlayerList.jsx";

function AutumnGamePlay({grain, status, socket, role, roleArray, statusArray, players, currentSeason }) {
  const [selectedPlayerSession, setSelectedPlayerSession] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const selectedPlayerSessionRef = useRef(selectedPlayerSession);

  useEffect(() => {
    selectedPlayerSessionRef.current = selectedPlayerSession;
  }, [selectedPlayerSession]);

    const autumnReadyClick = async () => {
            if (!isReady) {
                socket.current.emit('ready', {
                    state: currentSeason,
                    session: getSession(),
                    banish: role === 'king' ? selectedPlayerSessionRef.current : null
                });
                setIsReady(true);
            }
            else {
                socket.current.emit('unready', {
                    state: currentSeason,
                    session: getSession()
                });
                setIsReady(false);
            };
    }

  const handleTimeUp = () => {

  }

    const handlePlayerSelect = (playerSession) => {
        setSelectedPlayerSession(playerSession);
      if (isReady) {
          autumnReadyClick();
      }
    };

    const roleIcon = (index) => {
        switch (roleArray[index]) {
            case -1:
                return unknownIcon;
            case 0:
                return kingIcon;
            case 1:
                return lordIcon;
            case 2:
                return khanIcon;
        }
    };

  const renderRoleSpecificContent = () => {
      if (role === "king") {
          return (
              <div className="banish-container">
                  {players.map((player, index) => (
                      <button
                          key={player.session}
                          onClick={() => handlePlayerSelect(player.session)}
                          className={"banish-button" +
                              (selectedPlayerSession === player.session ? " selected" : "") +
                              (roleArray[index] !== -1 ? " ineligible" : "") +
                              (statusArray[index] == 1 ? " pillaged" : "") +
                              (statusArray[index] == 2 ? " banished" : "")
                          }
                          disabled={roleArray[index] !== -1 || statusArray[index] !== 0}
                      >
                          <img src={roleIcon(index)} />
                          {player.name + (player.session === Number(getSession()) ? " (You)" : "")}
                      </button>
                  ))}
                  <button
                      key={-1}
                      onClick={() => handlePlayerSelect(-1)}
                      className={"banish-button" +
                          (selectedPlayerSession === -1 ? " selected" : "")
                      }
                      disabled={status !== 0}
                  >
                      Don't banish
                  </button>
              </div>
          );
      }
      else {
          return (
              <div className="player-container">
                  {players.map((player, index) => (
                      <button
                          key={player.session}
                          className={"player-button" +
                              (statusArray[index] == 1 ? " pillaged" : "") +
                              (statusArray[index] == 2 ? " banished" : "")
                          }
                          disabled={true}
                      >
                          <img src={roleIcon(index)} />
                          {player.name + (player.session === Number(getSession()) ? " (You)" : "")}
                      </button>
                  ))}
              </div>
          );
      }

  };

  return (
    <div className="autumn">
      <div className="autumn-container">

      <div className="intro-container">
            <span className="autumn-title">AUTUMN</span>
            <p className="autumn-subtitle">The King makes a choice...</p>
      </div>

          {renderRoleSpecificContent()} 

          {status === 0 && (
        <div className="autumn-button-bar">
            <button onClick={autumnReadyClick}>
            {isReady ? "Unready" : "Ready"}
            </button>
        </div>
          )}
              <HelpButton role={role} />

        <GrainList grain = {grain.initial_grain} />

        <Timer duration={60} onTimeUp={handleTimeUp} />
      </div>
    </div>
  );
}

export default AutumnGamePlay;
