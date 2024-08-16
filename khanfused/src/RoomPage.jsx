import logo from "./Assets/Khanfused.svg";
import './RoomPage.css';
import React, { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client"

function RoomPage() {

    const navigate = useNavigate();
    const { code } = useParams();
    const [hasConnected, setHasConnected] = useState(false);
    const socket = io("http://localhost:5000", {autoConnect: false});

    socket.on("connect", async (data) => {
        setHasConnected(true);
    });

    socket.on("join", async (data) => {
        console.log(data);
    });

    socket.connect();
    socket.emit("join");

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
                    <li>Ren Shyuen</li>
                    <li>Rick</li>
                    <li>Tina</li>
                    <li>Zhi Yun</li>
                    <li>Fakerayray</li>
                    <li className="player-input">
                        <input type="text" placeholder="Enter your name" />
                        <button>Submit</button>
                    </li>
                </ul>
            </div>
            <button className="start-button" disabled>Start Game</button>
        </div>}
    </> );
}

export default RoomPage;