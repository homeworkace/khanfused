import React, { useState, useEffect, useRef } from 'react';
import './AutumnGamePlay.css'; 
import { getSession } from './utility.js';
import HelpButton from './Instructions';
import Timer from './Timer';
import GrainList from "./PlayerList";

function AutumnGamePlay({grain, status, socket, role, players, currentSeason }) {
  const [isBanishListOpen, setBanishListOpen] = useState(false);
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
                console.log(`Banish: ${selectedPlayerSessionRef.current}`);
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


  const toggleBanishList = () => {
    setBanishListOpen(!isBanishListOpen);
  };

  const handleTimeUp = () => {

  }

  const handlePlayerSelect = (player) => {
    setSelectedPlayerSession(player.session);
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
    } else if (status === 2) {
      return (
      <div className = "banished">
        <p className="banished-text">YOU HAVE BEEN BANISHED</p>
      </div>
      )
    }
  };

  return (
    <div className="autumn">
      <div className="autumn-container">

        <div className="autumn-button-bar">
          <GrainList grain = {grain.initial_grain + grain.added_grain - grain.yearly_deduction} />
          {renderRoleSpecificContent()} 

          <HelpButton role={role}/>
          {status !== 2 && (
            <button onClick={autumnReadyClick}>
            {isReady ? "Unready" : "Ready"}
            </button>
          )}
        </div>

        <Timer duration={60} onTimeUp={handleTimeUp} />
      </div>
    </div>
  );
}

export default AutumnGamePlay;
