import logo from "./Assets/Khanfused.svg";
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client"
import { checkSession, leaveLobby } from './restBoilerplate.js';
import { getSession } from './utility.js';
import RoomPageView from "./RoomPageView.jsx";
import './RoomPageView.css';

function RoomPage() {

    const navigate = useNavigate();
    const { code } = useParams();
    const [hasConnected, setHasConnected] = useState(false);
    const [shouldConnect, setShouldConnect] = useState(false);
    //fakerayray
    const [currentSeason, setCurrentSeason] = useState("waiting");
    //
    const socket = useRef(null);
    const [players, setPlayers] = useState(["Ren Shyuen"]);
    const [playerName, setPlayerName] = useState("");
    const [isEditing, setIsEditing] = useState(true);

    ///////////////////////////////////////////////////////////////////////////////

    const handlePlayerNameInput = (event) => {
        setPlayerName(event.target.value);
    }

    const handleSubmitClick = () => {
        if (playerName.trim() !== ""){
            setPlayers([...players, playerName]);

            // set editing name mode to false after submission
            setIsEditing(false);
        }
    }

    const handleEditClick = () => {
        setIsEditing(true);

        // remove the player name from the list to edit
        setPlayers(players.filter(player => player !== playerName));
    }

    const renderPage = () => {
        if (hasConnected) {
            switch (true) {
                default:
                    return (
                        <RoomPageView
                        code={code}
                        players={players}
                        playerName={playerName}
                        isEditing={isEditing}
                        handlePlayerNameInput={handlePlayerNameInput}
                        handleSubmitClick={handleSubmitClick}
                        handleEditClick={handleEditClick}
                        leaveRoomClick={leaveRoomClick}
                        />
                    )
            }
        }
    };

    const leaveRoomClick = async () => {
        let result = await leaveLobby();
        if ("redirect" in result) {
            navigate(result["redirect"], { replace: true });
        }
    }


    ///////////////////////////////////////////////////////////////////////////////


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

    useEffect(() => {
        if (!shouldConnect) {
            return;
        }

        // initialize socket connection
        //WebSockets are easier on the server than long-polling, but Werkzeug doesn't support it. Keep in mind!
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


    ///////////////////////////////////////////////////////////////////////////////


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

    return (
        <>
            {renderPage()}
        </>
    )

}
export default RoomPage;