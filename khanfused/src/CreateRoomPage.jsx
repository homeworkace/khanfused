import './CreateRoomPage.css';
import logo from "./Assets/Khanfused.svg";
import React, { useState } from 'react';
import getSession from './utility';

function createRoomClick() {

}

function CreateRoomPage(){

    // ren shyuen: state to manage input value
    const [password, setPassword] = useState("");

    return (
        <div>
            <p className="page-indicator">CREATE A PASSWORD</p>
            <div className="whole-page">
                <div className="logo">
                    <img src={logo} alt="Khanfused Logo" />
                </div>
                <div className="input-password-container">
                    <input 
                    className="password-input-box"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    />
                </div>
                <div className="button-container">
                    <button className="button">Join Game</button>
                </div>
            </div>
        </div>
    );
}

export default CreateRoomPage;