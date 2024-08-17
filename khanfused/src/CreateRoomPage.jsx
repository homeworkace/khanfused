import './CreateRoomPage.css';
import logo from './Assets/Khanfused.svg';
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startLobby } from './restBoilerplate'
import { checkSession } from './restBoilerplate';

function CreateRoomPage() {

    const navigate = useNavigate();
    const password = useRef();

    let promise = checkSession();
    promise.then((sessionDetails) => {
        console.log(sessionDetails["redirect"]);
        if ("redirect" in sessionDetails) {
            if (sessionDetails["redirect"].substring(0, 6) == "/room/") {
                navigate(sessionDetails["redirect"], { replace: true });
            }
        }
    });

    const createRoomClick = async () => {
        let result = await startLobby(password.current.value);
        if ("redirect" in result) {
            navigate(result["redirect"], { replace: true });
        }
    }

    return (
        <div>
            <div className="createRoom-page">
                <div className="logo-createRoom">
                    <img src={logo} alt="Khanfused Logo" />
                </div>
                <div className="createRoom-container">
                    <input 
                        ref={ password }
                        type="password"
                        className="password-input-box"
                        placeholder="Create a password"
                    />
                    <button onClick={ createRoomClick }>Create Room</button>
                </div>
            </div>
        </div>
    );
}

export default CreateRoomPage;