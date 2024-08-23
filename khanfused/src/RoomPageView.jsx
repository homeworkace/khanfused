import logo from "./Assets/Khanfused.svg";
import './RoomPageView.css';
import { useEffect, useState } from 'react';
import { getSession, getName } from './utility.js';

function RoomPageView({ socket, code, currentSeason, players, setPlayers, leaveRoomClick, handleRoleAssignmentChangeClick }) {

    const [playerName, setPlayerName] = useState("");
    const [editMode, setEditMode] = useState(true);

    // Please see the similar handler in RenderPage.jsx.
    const handleEditClick = () => {
        let maxCharacters = 8;

        if (editMode) {
            const sanitizedInput = playerName.trim();

            if (!sanitizedInput || sanitizedInput.length > maxCharacters) {
                alert(`Name can only be maximum ${ maxCharacters } characters long`);
                return;
            }

            const nameExists = players.some(player => player.name === sanitizedInput);
            if (nameExists) {
                alert(`This name is already taken. Please choose a different one`);
                return;
            }

            // register existence of player object
            setPlayers(p => p.map(player => player.session.toString().padStart(9, '0') === getSession().toString().padStart(9, '0') ? 
            { ...player, name: sanitizedInput } : player));

            socket.emit("confirm_name", 
            {
                session: getSession(),
                name: sanitizedInput
            });

            setEditMode(false);
        } else {
            // clear the name property of player object 
            setPlayers(p => p.map(player => player.session.toString().padStart(9, '0') === getSession().toString().padStart(9, '0')? { ...player, name: "" } : player
            ));

            socket.emit("edit_name", 
            {
                session: getSession()
            });

            setEditMode(true);
        }
    };

    const handleInputChange = (event) => {
        setPlayerName(event.target.value);
    };

    const displayPlayerList = () => {

        return players.map((player, index) => (
            <li key={ index }>
                { (player.session.toString().padStart(9, '0') === getSession().toString().padStart(9, '0')) ? 
                    (
                        editMode ? 
                        (
                            <div>
                                <input placeholder="Enter your name" value={ playerName } onChange={ handleInputChange } />
                                <button onClick={ handleEditClick }> Submit </button>
                            </div>
                        ) : (
                            <div>
                            <span> { player.name } </span>
                            <button onClick={ handleEditClick }> Edit </button>
                            </div>
                        ) 
                    ) : (
                        <div>
                            <span> { player.name } </span>
                        </div>
                    ) 
                }
            </li>
        ));
    }

    console.log(`getSession() returns ${getSession().toString()}`);

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
                <button onClick={ handleRoleAssignmentChangeClick }>
                    Randomise
                </button>
                

            </div>
           
        </div>
    );
}

export default RoomPageView;