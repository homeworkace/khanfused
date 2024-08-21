import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client"
import { checkSession, leaveLobby } from './restBoilerplate.js';
import { getSession } from './utility.js';
import RoomPageView from "./RoomPageView.jsx";
import './RoomPageView.css';

// Testing 
import RandomTeams from "./RandomTeams.jsx";
import SpringGamePlay from "./SpringGamePlay.jsx";
import SpringDouble from './SpringDouble.jsx';

function RoomPage() {

    const navigate = useNavigate();
    const { code } = useParams();
    const [hasConnected, setHasConnected] = useState(false);
    const [shouldConnect, setShouldConnect] = useState(false);
    const socket = useRef(null);
    const [players, setPlayers] = useState([]);

    // Test switch case purposes
    const [isRandomising, setIsRandomising] = useState(false);
    const [isSpring,springComes] = useState(false);
    const [springStage, setSpringStage] = useState(false);

    const handleRandomiseClick = () => {
        setIsRandomising(true);
    }

    const proceedToSpring = () => {
        springComes(true);
  
    }

    const handleSpringStage = () => {
        setSpringStage(true);
        console.log(springStage);
    }

    const leaveRoomClick = async () => {
        let result = await leaveLobby();
        if ("redirect" in result) {
            navigate(result["redirect"], { replace: true });
        }
    }

    const renderPage = () => {
        if (hasConnected) {
            switch (true) {
                case springStage:
                    return <SpringDouble />

                case isSpring:
                    return <SpringGamePlay
                    handleSpringStage = {handleSpringStage} 
                    />

                case isRandomising:
                    return <RandomTeams
                    proceedToSpring = {proceedToSpring}
                    />

                default:
                    return (
                        <RoomPageView
                        code={ code }
                        leaveRoomClick={ leaveRoomClick }
                        players={ players }
                        />
                    )
            }
        }
    };

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
    }, [navigate]);

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


    return (
        <>
            {renderPage()}
        </>
    )

}
export default RoomPage;