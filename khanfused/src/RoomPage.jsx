import logo from "./Assets/Khanfused.svg";
import './RoomPage.css';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client"
import { getCookieEnd } from "./cookieEndTime";

function RoomPage() {
    const navigate = useNavigate();
    const { code } = useParams();
    const [hasConnected, setHasConnected] = useState(false);
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const cookieEnd = getCookieEnd();   

        if(cookieEnd && cookieEnd > new Date()) {
            if (!socketRef.current) {
                socketRef.current = io("http://localhost:5000", { autoConnect: false });

                socketRef.current.on("connect", () => {
                    setHasConnected(true);
                });

                socketRef.current.on("join", (data) => {
                    console.log(data);
                });

                socketRef.current.connect();
                socketRef.current.emit("join");

                // setSocket(newSocket);
            }
        }

        return () => {
            if(cookieEnd && new Date()  > cookieEnd) {
                socketRef.current.off("connect");
                socketRef.current.off("join");
                socketRef.current.disconnect();
            }
        };
    }, []); 

    return (
        <div className={hasConnected ? "roomPage" : "loading"}>
            {hasConnected && (
                <>
                    <div className="logo">
                        <img src={logo} alt="Khanfused Logo" />
                    </div>
                    <div className="code-section">
                        <p className="instruction-text">Key in the code below:</p>
                        <h1 className="room-code">{code}</h1>
                    </div>
                    <div className="players-section">
                        <h2>Players:</h2>
                        <ul className="players-list">
                            <li className="player">RICK</li>
                            <li className="player">RAY</li>
                            <li className="player">TINA</li>
                            <li className="player">RENSHYUEN</li>
                            <li className="player-input">
                                <input type="text" placeholder="Enter your name" />
                                <button className="submit-button">Submit</button>
                            </li>
                        </ul>
                    </div>
                    <button className="start-button" disabled>Start Game</button>
                </>
            )}
        </div>
    );
}

export default RoomPage;
