import React from 'react';
import logo from "./Assets/Khanfused.svg";
import './RoomPageView.css';
import { useState, useEffect, useRef } from 'react';

function RoomPageView({ code, leaveRoomClick, socket }) {

    const [playerName, setPlayerName] = useState("");
    const [editMode, setEditMode] = useState(true);
    const [players, setPlayers] = useState([]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const handleEditClick = () => {
        setEditMode(!editMode);
    };

    const handleInputChange = (event) => {
        setPlayerName(event.target.value)
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        // Listen for player list updates
        socket.on("player_list_update", (data) => {
            const updatedPlayers = JSON.parse(data);
            setPlayers(updatedPlayers);
        });

        return() => {
            socket.off("player_list_update");
        };

    }, [socket]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
                    <li>
                        { editMode ? 
                            ( 
                                <div>
                                    <input placeholder="Enter your name" value={ playerName } onChange={ handleInputChange } />
                                    <button onClick={ handleEditClick }> Submit </button>
                                </div> 
                            ) : ( 
                                <div>
                                    <span> { playerName } </span>
                                    <button onClick={ handleEditClick }> Edit </button>
                                </div> 
                            ) }
                    </li>
                </ul>
            </div>
            <div className="roomPageView-button-bar">
                <button disabled>
                    Start Game
                </button>
                <button onClick={ leaveRoomClick }>
                    Leave Room
                </button>
            </div>
        </div>
    );
}

export default RoomPageView;