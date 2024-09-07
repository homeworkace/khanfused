import logo from "./Assets/Khanfused.svg";
import './RoomPage.css';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

function RoomPage() {
    const { code } = useParams();
    const [hasConnected, setHasConnected] = useState(false);
    const socket = useRef(null);

    useEffect(() => {
        socket.current = io("http://localhost:5000", { autoConnect: false });

        const handleConnect = () => {
            setHasConnected(true);
        };

        const handleJoin = (data) => {
            
        };

        const handleBackButton = (event) => {
            event.preventDefault();

            alert("You cannot leave the room at this moment.");
            window.history.pushState(null, null, window.location.pathname);
        };

        // Properly attach the event listeners
        socket.current.on("connect", handleConnect);
        socket.current.on("join", handleJoin);

        // Connect to the socket server
        socket.current.connect();

        // Emit the join event with the room code
        socket.current.emit("join", { code });

        // Handle the back button
        window.history.pushState(null, null, window.location.pathname);
        window.addEventListener('popstate', handleBackButton);

        // Cleanup on component unmount
        return () => {
            socket.current.off("connect", handleConnect);
            socket.current.off("join", handleJoin);
            socket.current.disconnect();
            window.removeEventListener('popstate', handleBackButton);
        };
    }, [code]);

    return (
        <>
            {hasConnected && (
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
                            <li>Raymond</li>
                            <li className="player-input">
                                <input type="text" placeholder="Enter your name" />
                                <button>Submit</button>
                            </li>
                        </ul>
                    </div>
                    <button className="start-button" disabled>Start Game</button>
                </div>
            )}
        </>
    );
}

export default RoomPage;
