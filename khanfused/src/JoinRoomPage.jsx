import './JoinRoomPage.css'
import logo from './Assets/Khanfused.svg'
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSession } from './restBoilerplate';

function JoinRoomPage() {

    const navigate = useNavigate();
    const password = useRef();

    let promise = checkSession();
    promise.then((sessionDetails) => {
        if ("redirect" in sessionDetails) {
            if (sessionDetails["redirect"].substring(0, 6) === "/room/") {
                navigate(sessionDetails["redirect"], { replace: true });
            }
        }
    });

    return (
        <div className="joinRoom-page">
            <div className="logo-joinRoom">
                <img src={logo} alt="Khanfused Logo" />
            </div>
            <div className="joinRoom-container">
                <input 
                    className="room-code-box"
                    type="text"
                    placeholder="enter the room code"
                />
                <input 
                    className="room-password-box"
                    type="password"
                    placeholder="enter the password"
                />
                <button>join game</button>
            </div>
        </div>
    );
}

export default JoinRoomPage;