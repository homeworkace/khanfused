import React, { useState, useEffect, useRef } from 'react';
import './SummerGamePlay.css';
import kingIcon from "../Assets/king.svg";
import lordIcon from "../Assets/lord.svg";
import khanIcon from "../Assets/khan.svg";
import unknownIcon from "../Assets/unknown.svg";
import { getSession } from '../utility.js';
import HelpButton from '../Helper/Instructions.jsx';
import Timer from '../Helper/Timer.jsx';
import GrainList from "../Helper/PlayerList.jsx";

function SummerGamePlay({ grain, status, socket, choices, setChoices, players, role, roleArray, statusArray, currentSeason }) {
  const [isScoutListOpen, setIsScoutListOpen] = useState(false);
  const [selectedPlayerSession, setSelectedPlayerSession] = useState(null);
  const [isFarm, setIsFarm] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const selectedPlayerSessionRef = useRef(selectedPlayerSession);

  useEffect(() => {
    selectedPlayerSessionRef.current = selectedPlayerSession;
  }, [selectedPlayerSession]);
  
  const handleTimeUp = () => {
  };

    const handlePlayerSelect = (playerSession) => {
        setSelectedPlayerSession(playerSession);
    };

    const summerReadyClick = () => {
        if (!isReady) {
            if (role === 'lord') {
                socket.current.emit('ready', {
                    state: currentSeason,
                    session: getSession(),
                    choice: selectedPlayerSession
                });
            } else {
                socket.current.emit('ready', {
                    state: currentSeason,
                    session: getSession(),
                });
            }
            setIsReady(true);
        } else {
            socket.current.emit('unready', {
                state: currentSeason,
                session: getSession()
            });
            setIsReady(false);
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
        let infoText = "";
        switch (status) {
            case 1:
                infoText = "YOU HAVE BEEN PILLAGED";
                break;
            case 2:
                infoText = "YOU HAVE BEEN BANISHED";
                break;
            case 3:
                infoText = "You have been chosen for double harvest";
                break;
        }
        let result = (
            <div className="banished">
                <p className="banished-text">{ infoText }</p>
            </div>
        );

        if (role === "lord" && status === 0) {
            return (
                <div className="scout-container">
                    {players.map((player, index) => (
                        <button
                            key={player.session}
                            onClick={() => handlePlayerSelect(player.session)}
                            className={"scout-button" +
                                (selectedPlayerSession === player.session ? " selected" : "") +
                                (roleArray[index] !== -1 ? " ineligible" : "") +
                                (statusArray[index] == 1 ? " pillaged" : "") +
                                (statusArray[index] == 2 ? " banished" : "")
                            }
                            disabled={ roleArray[index] !== -1 || statusArray[index] !== 0}
                        >
                            <img src={roleIcon(index)} />
                            {player.name + (player.session === Number(getSession()) ? " (You)" : "")}
                        </button>
                    ))}
                    <button
                        key={-1}
                        onClick={() => handlePlayerSelect(-1)}
                        className={"scout-button" +
                            (selectedPlayerSession === -1 ? " selected" : "")
                        }
                        disabled={status !== 0}
                    >
                        Farm
                    </button>
                </div>
            );
        } 
      };


  return (
    <div className="summer">
      <div className="summer-container">


        {renderRoleSpecificContent()}
        
        {status === 0 && (
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
