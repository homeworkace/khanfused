import logo from "./Assets/Khanfused.svg";
import './RoomPage.css';
import React, { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client"

function RoomPage() {

    const navigate = useNavigate();
    const { code } = useParams();
    const [hasConnected, setHasConnected] = useState(false);
    const socket = io("http://localhost:5000/join", {autoConnect: false});

    socket.on("connect", async (data) => {
        console.log(data);
        setHasConnected(true);
    });

    socket.connect();
    socket.emit("join");

    return ( <> hasConnected && 
        <div className="roomPage">
            <div className="logo">
                <img src={logo} alt="Khanfused Logo" />
            </div>
            <div className="code-section">
                <p className="instruction-text">Key in the code below:</p>
                <h1 className="room-code">BAPX2</h1>
            </div>
            <div className="players-section">
                <h2>Players:</h2>
                <ul className="players-list">
                    <li className="player"> RICK</li>
                    <li className="player"> RAY</li>
                    <li className="player"> TINA</li>
                    <li className="player"> RENSHYUEN</li>
                    <li className="player-input">
                        <input type="text" placeholder="Enter your name" />
                        <button className="submit-button">Submit</button>
                    </li>
                </ul>
            </div>
            <button className="start-button" disabled>Start Game</button>
        </div>
    </> );
}

export default RoomPage;