import './CreateRoomPage.css';
import logo from './Assets/Khanfused.svg';
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startLobby } from './restBoilerplate'

function CreateRoomPage() {

    const password = useRef();

    const createRoomClick = async () => {
        let result = await startLobby(password.current.value);
        console.log(result);
    }

    return (
        <div>
            <div className="createRoom-page">
                <div className="logo-createRoom">
                    <img src={logo} alt="Khanfused Logo" />
                </div>
                <div className="input-password-container">
                    <input 
                        ref={ password }
                        className="password-input-box"
                        placeholder="Create a password"
                    />
                </div>
                <div className="createRoom-button-container">
                    <button className="createRoom-button" onClick={ createRoomClick }>Create Room</button>
                </div>
            </div>
        </div>
    );
}

export default CreateRoomPage;