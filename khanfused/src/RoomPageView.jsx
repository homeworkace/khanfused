import logo from "./Assets/Khanfused.svg";
import './RoomPageView.css';
import { useState } from 'react';
import { getSession } from './utility.js';

function RoomPageView({ code, currentSeason, players, leaveRoomClick, handleRandomiseClick }) {

    const [playerName, setPlayerName] = useState("");
    const [editMode, setEditMode] = useState(true);

    // Please see the similar handler in RenderPage.jsx.
    const handleEditClick = () => {
        setEditMode(!editMode);
    };

    const handleInputChange = (event) => {

        setPlayerName(event.target.value);
    };

    const displayPlayerList = () => {

        console.log(players); // so far this the latest changes right?

        return players.map((player, index) => (
            <li key={ index }>
                {  player.session === getSession() && editMode ? 
                    (
                        <div>
                            <input placeholder="Enter your name" value={ playerName } onChange={ handleInputChange } />
                            <button onClick={ handleEditClick }> Submit </button>
                        </div>
                    ):(
                        <div>
                            <span> { playerName } </span>
                            <button onClick={ handleEditClick }> Edit </button>
                        </div>
                    ) }
            </li>
        ));
    }

    return (
        <div className="roomPageView">
            <div className="roomPageView-logo">
                <img src={logo} alt="Khanfused Logo" />
            </div>
            <div className="code-section">
                <p>Key in the code below:</p>
                <h1> { code } </h1>
            </div>
            <div className="roomPageView-container">
                <h2>Players</h2>
                <ul>
                    { displayPlayerList() }
                </ul>
            </div>
            <div className="current-season">
                <h2>Current Season: {currentSeason}</h2>
            </div>
            <div className="roomPageView-button-bar">
                <button disabled>
                    Start Game
                </button>
                <button onClick={ leaveRoomClick }>
                    Leave Room
                </button>
                <button onClick={ handleRandomiseClick }>
                    Randomise
                </button>
                

            </div>
           
        </div>
    );
}

export default RoomPageView;