// use props
import React from 'react';
import logo from "./Assets/Khanfused.svg";
import './RoomPage.css';

function RoomPageView({code, players, playerName, isEditing, handlePlayerNameInput, handleSubmitClick, handleEditClick, leaveRoomClick }) {
    return (
        <>
            (
                <div className="roomPage">
                    <div className="roomPage-logo">
                        <img src={logo} alt="Khanfused Logo" />
                    </div>
                    <div className="code-section">
                        <p>Key in the code below:</p>
                        <h1>{code}</h1>
                    </div>
                    <div className="players-section">
                        <h2>Players</h2>
                        <ul className="players-list">
                            {players.map((player, index) => (
                                <li key={index}>{player}</li>
                            ))}
                            <li className="player-input">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={playerName}
                                        onChange={handlePlayerNameInput}
                                    />
                                ) : (
                                    <div className="spacing" />
                                )}
                                <button onClick={isEditing ? handleSubmitClick : handleEditClick}>
                                    {isEditing ? "Submit" : "Edit"}
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="button-bar">
                        <button className="start-button" disabled>
                            Start Game
                        </button>
                        <button className="leave-button" onClick={leaveRoomClick}>
                            Leave Room
                        </button>
                    </div>
                </div>
            )
        </>
    );
}

export default RoomPageView;
