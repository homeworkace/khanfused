import './CreateRoomPage.css';
import logo from './Assets/Khanfused.svg';
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import getSession from './utility';
import { startLobby } from './restBoilerplate'

function CreateRoomPage() {

    const password = useRef();

    const createRoomClick = async () => {
        let result = await startLobby(password.current.value);
        console.log(result);
    }

    return (
        <div>
            {/*<p className="page-indicator">CREATE A PASSWORD</p>*/}
            <div className="whole-page">
                <div className="logo">
                    <img src={logo} alt="Khanfused Logo" />
                </div>
                <div className="input-password-container">
                    <input 
                        ref={ password }
                        className="password-input-box"
                        placeholder="Create a password"
                    />
                </div>
                <div className="button-container">
                    <button className="button" onClick={ createRoomClick }>Create Room</button>
                </div>
            </div>
        </div>
    );
}

export default CreateRoomPage;