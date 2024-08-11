import './CreateRoomPage.css';
import logo from "./Assets/Khanfused.svg";
import React, { useState } from 'react';

function CreateRoomPage(){

    // ren shyuen: state to manage input value
    const [password, setPassword] = useState("");

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    }

    return (
        <div className="createRoom-page">
            <div className="logo-createRoom">
                <img src={logo} alt="Khanfused Logo" />
            </div>
            <div className="input-password-container">
                <input 
                className="password-input-box"
                placeholder="create a password"
                onChange={handlePasswordChange}
                value={password}
                />
            </div>
            <div className="createRoom-button-container">
                <button className="createRoom-button">join game</button>
            </div>
        </div>
    );
}

export default CreateRoomPage;