import logo from "./Assets/Khanfused.svg";
import './RoomPage.css';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client"
import { checkSession, leaveLobby } from './restBoilerplate';
import { getSession } from './utility.js';

function RoomPage() {

    const navigate = useNavigate();
    const { code } = useParams();
    const [hasConnected, setHasConnected] = useState(false);
    const [shouldConnect, setShouldConnect] = useState(false);
    //fakerayray
    const [currentSeason, setCurrentSeason] = useState("waiting");
    //
    const socket = useRef(null);

    useEffect(() => {
        let promise = checkSession();
        promise.then((sessionDetails) => {
            if (!("redirect" in sessionDetails)) {
                navigate("/", { replace: true });
            }
            else if (sessionDetails["redirect"] !== window.location.pathname) {
                navigate(sessionDetails["redirect"], { replace: true });
            }
            else {
                setShouldConnect(true);
            }
        });
    }, [])

    const leaveRoomClick = async () => {
        let result = await leaveLobby();
        if ("redirect" in result) {
            navigate(result["redirect"], { replace: true });
        }
    }

    useEffect(() => {
        if (!shouldConnect) {
            return;
        }

        // initialize socket connection
        //socket.current = io("http://localhost:5000", { autoConnect: false, transports: ['websocket'] }); //WebSockets are easier on the server than long-polling, but Werkzeug doesn't support it. Keep in mind!
        socket.current = io("http://localhost:5000", { autoConnect: false });

        const handleConnect = () => {
            setHasConnected(true);
        }

        const handleJoin = (data) => {
            console.log(data);
        }

        const handleNewPlayer = (data) => {
            console.log(data);
        }

        const handlePlayerLeft = (data) => {
            console.log(data);
        }

        //fakerayray
        const handleSeasonChange = (data) => {
            console.log("Season change received:", data);  // Debugging
            setCurrentSeason(data.state);
        };
        

        // setup event listeners
        socket.current.on("connect", handleConnect);
        socket.current.on("join", handleJoin);
        socket.current.on("new_player", handleNewPlayer);
        socket.current.on("player_left", handlePlayerLeft);
        //fakerayray
        socket.current.on("state_changed", handleSeasonChange);

        // connect and emit join event
        socket.current.connect();
        socket.current.emit("join", {
            session: getSession()
        });
        //console.log("connected");

        // A reference to the cleanup function
        const cleanup = () => {
            socket.current.emit("leave", {
                session: getSession()
            });

            socket.current.off("connect", handleConnect);
            socket.current.off("join", handleJoin);
            socket.current.off("new_player", handleNewPlayer);
            socket.current.off("player_left", handlePlayerLeft);
            //fakerayray
            socket.current.off("state_changed", handleSeasonChange);
            socket.current.disconnect();
            //console.log("disconnected");
        }

        // Clean up if the browser refreshes
        window.addEventListener("beforeunload", cleanup);

        // Clean up when component dismounts gracefully
        return () => {
            window.removeEventListener("beforeunload", cleanup);
            cleanup();
        };
    }, [shouldConnect]);

    const [players, setPlayers] = useState(["Ren Shyuen"]);
    const [playerName, setPlayerName] = useState("");
    const [isEditing, setIsEditing] = useState(true);

    const handlePlayerNameInput = (event) => {
        setPlayerName(event.target.value);
    }

    const handleSubmitClick = () => {
        if (playerName.trim() !== ""){
            setPlayers([...players, playerName]);

            // set editing name mode to false after submission
            setIsEditing(false);

            // clears the input field
            // setPlayerName("");
        }
    }

    const handleEditClick = () => {
        setIsEditing(true);

        // remove the player name from the list to edit
        setPlayers(players.filter(player => player !== playerName));
    }

    //fakerayray
    
    const handleStartInstructionsClick = () => {
        socket.current.emit('start_instructions', {
            session: getSession()
        });
    };
    const handleChangeSeasonClick = () => {
        socket.current.emit('transition_season', {
            session: getSession()
        });
        console.log(currentSeason);

    };

    //



    return (<> {hasConnected &&
        <div className="roomPage">
            <div className="roomPage-logo">
                <img src={logo} alt="Khanfused Logo" />
            </div>
            <div className="code-section">
                <p>Key in the code below:</p>
                <h1>{code}</h1>
            </div>
            <div className="players-section">
                <h2>Players</h2>
                <ul className="players-list">

                    {players.map((player, index) => (
                        <li key={index}> {player} </li>
                    ))}

                    <li className="player-input">
                        {isEditing ? (
                            <input 
                            type="text" 
                            placeholder="Enter your name"
                            value={playerName}
                            onChange={handlePlayerNameInput}
                            />
                        ) : (
                            <div className="spacing"/>
                        )}
                        <button onClick={isEditing ? handleSubmitClick : handleEditClick}> {isEditing ? "Submit" : "Edit"} </button>
                    </li>
                </ul>
            </div>
            <div className="current-season">
                <h2>Current Season: {currentSeason}</h2>
            </div>
            
            <div className="button-bar">
                <button className="start-button" disabled>Start Game</button>
                <button className="leave-button" onClick={ leaveRoomClick }>Leave Room</button>
                
                {/* fakerayray */}
                {currentSeason === "waiting" ? (
                        <button className="start-instructions-button" onClick={handleStartInstructionsClick}>
                            Start Instructions
                        </button>
                    ) : (
                        <button className="change-season-button" onClick={handleChangeSeasonClick}>
                            Change Season
                        </button>
                    )}

            </div>
        </div>}
    </> );
}

export default RoomPage;