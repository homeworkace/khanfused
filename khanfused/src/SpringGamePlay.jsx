import React, { useState, useEffect, useRef } from 'react';
import './SpringGamePlay.css';
import HelpButton from './Instructions';
import Timer from './Timer';
import { getSession } from './utility.js';
import GrainList from "./PlayerList";

function SpringGamePlay({ grain, status, socket, role, players, currentSeason}) {
  const [isDoubleHarvestListOpen, setIsDoubleHarvestListOpen] = useState(false);
  const [selectedPlayerSession, setSelectedPlayerSession] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const selectedPlayerSessionRef = useRef(selectedPlayerSession);

  useEffect(() => {
    selectedPlayerSessionRef.current = selectedPlayerSession;
  }, [selectedPlayerSession]);

    const springReadyClick = async () => {
        if (!isReady) {
            // Check if double harvest is selected first
            if (role === "king" && status === 0) {
                if (selectedPlayerSessionRef.current === null) {
                    console.log("King select a player for Double Harvest");
                    return;
                }
            }
            socket.current.emit('ready', {
                state: currentSeason,
                session: getSession(),
                double_harvest: role === 'king' ? selectedPlayerSessionRef.current : null
            });
            console.log(`Player ${getSession()} is ready`);
            console.log(`Double Harvest: ${selectedPlayerSessionRef.current}`);
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

  const renderRoleSpecificContent = () => {
    if (role === "king") {      // King will not get pillaged
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
    } else if (status === 2) {
      return (
      <div className = "banished">
        <p className="banished-text">YOU HAVE BEEN BANISHED</p>
      </div>
      )
    }
  };

  return (
    <div className={"spring"}>
      <div className="spring-container">

        <div className="spring-button-bar">

          <GrainList grain = {grain.initial_grain + grain.added_grain - grain.yearly_deduction} />

          {renderRoleSpecificContent()} 

          <HelpButton role={role}/>

          {status !== 2 && (
            <button onClick={springReadyClick}>
            {isReady ? "Unready" : "Ready"}
            </button>
          )}

        </div>
        <Timer duration={60} onTimeUp={handleTimeUp} />
      </div>

    </div>
  );
}

export default SpringGamePlay;
