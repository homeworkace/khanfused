import React, { useState, useEffect, useRef } from 'react';
import './WinterGamePlay.css';
import { getSession } from './utility.js';
import HelpButton from './Instructions';
import Timer from './Timer';
import PlayerList from "./PlayerList";

function WinterGamePlay( { role, players, currentSeason, socket }) {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isPillageListOpen, setIsPillageListOpen] = useState(false); 
    const [selectedPlayerSession, setSelectedPlayerSession] = useState(null);

    const selectedPlayerSessionRef = useRef(selectedPlayerSession);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    }

    const handleTimeUp = () => {
    
    }


    const handlePlayerSelect = (playerName) => {
        const selectedPlayer = players.find(p => p.name === playerName);
        if (selectedPlayer) {
          setSelectedPlayerSession(selectedPlayer.session);
        }
      };
    

    const togglePillageList = () => {
        setIsPillageListOpen(!isPillageListOpen);
    }

    const renderRoleSpecificContent = () => {
        if (role === "lord" || role === "khan") {
          return (
            <div className="pillage-container">
              <button className="pillage-button" onClick={togglePillageList}>Double Harvest</button>
              {isPillageListOpen && (
                <div className="pillage-list active">
                  <ul>
                  {players.filter (player => player.session != getSession()).map((player) => (
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
        <div className="winter">
            <div className="winter-container">
                {isChatOpen && (
                    // ToDo:Retrieve chat content from backend
                    <div className="chat-box">
                        <p>Chat content goes here...</p>
                    </div>
                )}
                <div className="winter-button-bar">
                    <button onClick={toggleChat} className="chat-button">
                        Chat
                    </button>
                    <button> 
                        Proceed
                    </button>
                </div>
                {renderRoleSpecificContent()}
            </div>
        </div>
    );
}

export default WinterGamePlay;
