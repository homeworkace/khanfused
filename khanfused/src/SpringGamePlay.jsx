import React, { useState } from 'react';
import './SpringGamePlay.css';
import HelpButton from './Instructions';
import Timer from './Timer';
import PlayerList from "./PlayerList";

function SpringGamePlay({ handleDoubleHarvestChangeClick, role, players}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDoubleHarvestOpen, setDoubleHarvestIsOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleTimeUp = () => {
    handleDoubleHarvestChangeClick();
  };

  const handleDoubleHarvestClick = () => {
    setDoubleHarvestIsOpen(!isDoubleHarvestOpen);
  }

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
  };

  // const renderRoleSpecificContent = () => {
  //   console.log(`Current role is: ${role}`);
  //   if (role === "king") {
  //     return (
  //       <div>
  //         <p>You are the King. Manage your resources wisely!</p>
  //       </div>
  //     );
  //   } else if (role === "lord") {
  //     return (
  //       <div>
  //         <p>You are a Lord. Protect your lands!</p>
  //       </div>
  //     );
  //   } else if (role === "khan") {
  //     return (
  //       <div>
  //         <p>You are the Khan. Conquer new territories!</p>
  //       </div>
  //     );
  //   }
  // };

  return (
    <div className="spring">
      <div className="spring-container">
        {isChatOpen && (
          <div className="chat-box">
            <p>Chat content goes here...</p>
          </div>
        )}

        <div className="spring-button-bar">
          <button onClick={toggleChat} className="chat-button">
            Chat
          </button>

          <div className="spring-player-list">
                <PlayerList players={players} />
          </div>

          {role === "king" && (
            <button onClick={handleDoubleHarvestClick}> Double Harvest </button>
          )}
          
          {
            isDoubleHarvestOpen && (
              <div className="double-harvest-list">
                <ul>
                  {players.map((player) => (
                  <li
                    key={player.session}
                    onClick={() => handlePlayerSelect(player)}
                    className={selectedPlayer === player ? "selected" : ""}
                    style={{ cursor: 'pointer' }}
                  >
                  {player.name}
                </li>
              ))}
            </ul>
          </div>
        )}

          <HelpButton />
        
          <button onClick={handleDoubleHarvestChangeClick}>
            Proceed
          </button>
        </div>

        <Timer duration={10} onTimeUp={handleTimeUp} />
      </div>
    </div>
  );
}

export default SpringGamePlay;
