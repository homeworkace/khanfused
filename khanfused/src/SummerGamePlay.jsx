import React, { useState, useEffect, useRef } from 'react';
import './SummerGamePlay.css';
import { getSession } from './utility.js';
import HelpButton from './Instructions';
import Timer from './Timer';
import GrainList from "./PlayerList";

function SummerGamePlay({ grain, status, socket, choices, setChoices, players, role, currentSeason }) {
  const [isScoutListOpen, setIsScoutListOpen] = useState(false);
  const [selectedPlayerSession, setSelectedPlayerSession] = useState(null);
  const [isFarm, setIsFarm] = useState(false);
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
        if (role === 'lord') {
          if (choices === 1) {
            socket.current.emit('ready', {
              state: currentSeason,
              session: getSession(),
              choice: selectedPlayerSessionRef.current 
            });
            console.log(`Ready button clicked. isReady: ${isReady}, role: ${role}, choices: ${choices}, selectedPlayerSession: ${selectedPlayerSessionRef.current}`);
          } else if (choices === 2) {
            socket.current.emit('ready', {
              state: currentSeason,
              session: getSession(),
              choice: -1
            });
            console.log(`Ready button clicked. isReady: ${isReady}, role: ${role}, choices: ${choices}, selectedPlayerSession: ${selectedPlayerSessionRef.current}`);
          }
        } else {
          socket.current.emit('ready', {
            state: currentSeason,
            session: getSession(),
          });
        }
        console.log('Emitted ready state:', isReady);
        console.log(`Ready button clicked. isReady: ${isReady}, role: ${role}, choices: ${choices}, selectedPlayerSession: ${selectedPlayerSessionRef.current}`);
      } else {
        socket.current.emit('unready', {
          state: currentSeason,
          session: getSession()
        });
        console.log('Emitted unready state:', isReady);
      }
    }
  }, [isReady, choices, role, socket, currentSeason]);
  
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
    if (role === "lord" && status === 0) {
      return (
        <div className="summer-lord-buttons">
          <button className={`farm-button ${isFarm ? "active" : ""}`} onClick={handleFarmClick} >Farm</button>
          <button className="scout-button" onClick={toggleScoutList} >Scout</button>
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
    } else if (status === 3) // includes if khan is chosen for DH
      {
        return (
          <p> You have been chosen for double harvest</p>
        )
      }
      else if (status === 2) {
        return (
        <div className = "banished">
          <p className="banished-text">YOU HAVE BEEN BANISHED</p>
        </div>
        )
      }
  };


  return (
    <div className={"summer"}>
      <div className="summer-container">


        {renderRoleSpecificContent()}
        
        {status !== 2 && status !== 1 && (
        <div className="summer-button-bar">
          <button onClick={summerReadyClick}>
            {isReady ? "Unready" : "Ready"}
          </button>
        </div>
        )}

        <HelpButton role={role}/>

        <GrainList grain = {grain.initial_grain + grain.added_grain - grain.yearly_deduction} />

        <Timer duration={30} onTimeUp={handleTimeUp} />
      </div>
    </div>
  );
}

export default SummerGamePlay;
