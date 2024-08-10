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
        <div>

            <div className="whole-page">
                <div className="logo">
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
                <div className="button-container">
                    <button className="button">join game</button>
                </div>
            </div>
        </div>
    );
}

export default CreateRoomPage;