import React, { useState } from 'react';
import './SummerGamePlay.css';
import { getSession } from './utility.js';
import HelpButton from './Instructions';
import Timer from './Timer';
import PlayerList from "./PlayerList";

function SummerGamePlay( {players, handleSummerStage, role}) {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isScoutListOpen, setIsScoutListOpen] = useState(false);
    const [selectedPlayerSession, setSelectedPlayerSession] = useState(null);
    const [isReady, setIsReady] = useState(false);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    }

    const handleTimeUp = () => {
      // handleDoubleHarvestChangeClick();
    };

    const toggleScoutList = () => {
      setIsScoutListOpen(!isScoutListOpen);
    }

    const handlePlayerSelect = (player) => {
      setSelectedPlayerSession(player.session); 
    };


    const renderRoleSpecificContent = () => {
        console.log(`Current role is: ${role}`);
        if (role === "lord") {
          return (
            <div>
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
    }
    // non role specific content
    return (
        <div className="summer">
            <div className="summer-container">
                {isChatOpen && (
                    // ToDo:Retrieve chat content from backend
                    <div className="chat-box">
                        <p>Chat content goes here...</p>
                    </div>
                )}
                <div className="summer-button-bar">
                    <button onClick={toggleChat} className="chat-button">
                        Chat
                    </button>
                    
                    <button onClick={handleSummerStage}> 
                        Proceed
                    </button>

                  {renderRoleSpecificContent()} 

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
