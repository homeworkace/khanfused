import './JoinRoomPage.css'
import logo from './Assets/Khanfused.svg'
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSession, joinLobby } from './restBoilerplate';

function JoinRoomPage() {

    const navigate = useNavigate();
    const roomCode = useRef();
    const password = useRef();

    let promise = checkSession();
    promise.then((sessionDetails) => {
        if ("redirect" in sessionDetails) {
            if (sessionDetails["redirect"].substring(0, 6) === "/room/") {
                navigate(sessionDetails["redirect"], { replace: true });
            }
        }
    });

    const joinRoomClick = async () => {
        let result = await joinLobby(roomCode.current.value, password.current.value);
        if ("reset_name" in result) {
            document.cookie = "name=; Max-Age=1800; path=/";
        }
        if ("redirect" in result) {
            navigate(result["redirect"], { replace: true });
        }
    }

    const backClick = () => {
        navigate("/", { replace: true });
    }

    return (
        <div className="joinRoom-page">
            <div className="logo-joinRoom">
                <img src={logo} alt="Khanfused Logo" />
            </div>
            <div className="joinRoom-container">
                <input
                    ref={roomCode}
                    className="room-code-box"
                    type="text"
                    placeholder="Enter the room code"
                />
                <input
                    ref={password}
                    className="room-password-box"
                    type="password"
                    placeholder="Enter the password"
                />
                <div className="joinRoom-button-bar">
                    <button onClick={joinRoomClick}>Join Room</button>
                    <button onClick={backClick}>Back</button>
                </div>
            </div>
        </div>
    );
}

export default JoinRoomPage;