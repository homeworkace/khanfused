import logo from "./Assets/Khanfused.svg";
import './RoomPageView.css';
import { useState } from 'react';

function RoomPageView({ code, currentSeason, players, leaveRoomClick, handleSpringChangeClick, handleSummerChangeClick, handleAutumnChangeClick, handleWinterChangeClick }) {

    const [playerName, setPlayerName] = useState("");
    const [editMode, setEditMode] = useState(true);

    const handleEditClick = () => {
        setEditMode(!editMode);
    };

    const handleInputChange = (event) => {
        setPlayerName(event.target.value)
    };


    return (
        <div className="roomPageView">
            <div className="roomPageView-logo">
                <img src={logo} alt="Khanfused Logo" />
            </div>
            <div className="code-section">
                <p>Key in the code below:</p>
                <h1> { code } </h1>
            </div>
            <div className="roomPageView-container">
                <h2>Players</h2>
                <ul>
                    <li>
                        { editMode ? 
                            ( 
                                <div>
                                    <input placeholder="Enter your name" value={ playerName } onChange={ handleInputChange } />
                                    <button onClick={ handleEditClick }> Submit </button>
                                </div> 
                            ) : ( 
                                <div>
                                    <span> { playerName } </span>
                                    <button onClick={ handleEditClick }> Edit </button>
                                </div> 
                            ) }
                    </li>
                </ul>
            </div>
            <div className="current-season">
                <h2>Current Season: {currentSeason}</h2>
            </div>
            <div className="roomPageView-button-bar">
                <button disabled>
                    Start Game
                </button>
                <button onClick={ leaveRoomClick }>
                    Leave Room
                </button>
                <button>
                    Randomise
                </button>
                <button onClick={ handleWinterChangeClick }>
                    BE SPRING
                </button>

            </div>
            <div className="roomPageView-button-bar">
                
                <button onClick={ handleSpringChangeClick }>
                    SPRING
                </button>

                <button onClick={ handleSummerChangeClick }>
                    SUMMER
                </button>
                
                <button onClick={ handleAutumnChangeClick }>
                    AUTUMN
                </button>

                <button onClick={ handleWinterChangeClick }>
                    WINTER
                </button>

            </div>
        </div>
    );
}

export default RoomPageView;