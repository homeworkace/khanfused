import { useState } from 'react';
import player_icon from './Assets/player_icon.svg';
import './PlayerList.css';

function PlayerList({ players }) {

  const [isListVisible, setIsListVisible] = useState(false);

  const toggleListVisibility = () => {
    setIsListVisible(!isListVisible);
  };

  return (
    <div className="player-list-container">
      <img
        src={player_icon}
        alt="Player Icon"
        className="player-icon"
        onClick={toggleListVisibility} 
        style={{ cursor: 'pointer' }} 
      />

      {isListVisible && (
        <ul className="player-list">
          {players.map((player) => (
            <li key={player.session} className="player-item">
              <div>
                <img src={player_icon} alt="Player Icon" className="player-icon" />
              </div>
              <div>
                <span className="player-name">{player.name}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PlayerList;
