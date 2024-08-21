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
        if (!shouldConnect)
            return

        // initialize socket connection
        //WebSockets are easier on the server than long-polling, but Werkzeug doesn't support it. Keep in mind!
        socket.current = io("http://localhost:5000", { autoConnect: false });

        const handleConnect = () => {
            setHasConnected(true);
        }

        const handleJoin = (data) => {
            console.log(data);
        }

        // setup event listeners
        socket.current.on("connect", handleConnect);
        socket.current.on("join", handleJoin);

        // connect and emit join event
        socket.current.connect();
        socket.current.emit("join", {
            session: getSession()
        });

        // cleanup on component mount
        return () => {
            socket.current.off("connect", handleConnect);
            socket.current.off("join", handleJoin);
            socket.current.disconnect();
        };
    }, [shouldConnect]);


    ///////////////////////////////////////////////////////////////////////////////



    return (
        <>
            {renderPage()}
        </>
    )

}
export default RoomPage;