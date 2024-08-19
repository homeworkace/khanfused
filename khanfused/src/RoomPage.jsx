import logo from "./Assets/Khanfused.svg";
import './RoomPage.css';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client"
import { checkSession } from './restBoilerplate';

function RoomPage() {

    const navigate = useNavigate();
    const { code } = useParams();
    const [hasConnected, setHasConnected] = useState(false);
    const socket = useRef(null);

    let promise = checkSession();
    promise.then((sessionDetails) => {
        console.log(sessionDetails["redirect"]);
        if (!("redirect" in sessionDetails)) {
            navigate("/", { replace: true });
        }
        else if (sessionDetails["redirect"] !== window.location.pathname) {
                navigate(sessionDetails["redirect"], { replace: true });
        }
    });

    useEffect(() => {
        // initialize socket connection
        socket.current = io("http://localhost:5000", { autoConnect: false });

        const handleConnect = () => {
            setHasConnected(true);
        }

        const handleJoin = (data) => {
            console.log(data);
        }

        // setup event listeners
        socket.current.on("connect", handleConnect);
        socket.current.on("join", handleJoin);

        // connect and emit join event
        socket.current.connect();
        socket.current.emit("join");

        // cleanup on component mount
        return () => {
            socket.current.off("connect", handleConnect);
            socket.current.off("join", handleJoin);
            socket.current.disconnect();
        };
    }, []); // empty dependency array ensures this runs only on mount and unmount

    const [players, setPlayers] = useState(["Ren Shyuen"]);
    const [playerName, setPlayerName] = useState("");
    const [isEditing, setIsEditing] = useState(true);

    const handlePlayerNameInput = (event) => {
        setPlayerName(event.target.value);
    }

    const handleSubmitClick = () => {
        if (playerName.trim() !== ""){
            setPlayers([...players, playerName]);

            // set editing name mode to false after submission
            setIsEditing(false);

            // clears the input field
            // setPlayerName("");
        }
    }

    const handleEditClick = () => {
        setIsEditing(true);

        // remove the player name from the list to edit
        setPlayers(players.filter(player => player !== playerName));
    }

    return (<> {hasConnected &&
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
                        <li key={index}> {player} </li>
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
                            <div className="spacing"/>
                        )}
                        <button onClick={isEditing ? handleSubmitClick : handleEditClick}> {isEditing ? "Submit" : "Edit"} </button>
                    </li>
                </ul>
            </div>
            <button className="start-button" disabled>Start Game</button>
        </div>}
    </> );
}

export default RoomPage;