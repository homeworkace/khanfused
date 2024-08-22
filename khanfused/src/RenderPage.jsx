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
    const [currentSeason, setCurrentSeason] = useState("waiting");
    const socket = useRef(null);
    const [players, setPlayers] = useState([]);

    const leaveRoomClick = async () => {
        let result = await leaveLobby();
        if ("redirect" in result) {
            navigate(result["redirect"], { replace: true });
        }
    }

    const renderPage = () => {
        if (hasConnected) {
            switch (currentSeason) {
                case "double_harvest":
                    return <SpringDouble />
                
                case "spring":
                    return <SpringGamePlay
                    handleDoubleHarvestChangeClick = {handleDoubleHarvestChangeClick}
                />

                case "role_assignment":
                    return <RandomTeams
                    handleSpringChangeClick = {handleSpringChangeClick}
                    //proceedToSpring = {proceedToSpring}
                    />

                default:
                    return (
                        <RoomPageView
                            code={code}
                            currentSeason={currentSeason}
                            leaveRoomClick={leaveRoomClick}
                            players={players}
                            handleRoleAssignmentChangeClick = {handleRoleAssignmentChangeClick}
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
        if (!shouldConnect) {
            return;
        }

        //WebSockets are easier on the server than long-polling, but Werkzeug doesn't support it. Keep in mind!
        socket.current = io("http://localhost:5000", { autoConnect: false });

        // Makes the decision to load the lobby pages when the server returns acknowledgement.
        const handleConnect = () => {
            setHasConnected(true);
        }
        socket.current.on("connect", handleConnect);

        // Receives all relevant information to start the client off.
        const handleJoin = (data) => {
            // console.log(data.name);
            // console.log(data.session)
            console.log(data);
        }
        socket.current.on("join", handleJoin);

        /*
         * ALL RoomPageView COMMANDS ARE BELOW.
         * Consider porting page-specific handlers to their respective .jsx files.
         */
        // Receives the session ID ("session", integer) and name ("name", string or null) of the new player.
        const handleNewPlayer = (data) => {
            console.log(data);
            setPlayers(p => [...p, { session: data.session, name: data.name }]);
        }
        socket.current.on("new_player", handleNewPlayer);

        // Receives the session ID ("session", integer) of the leaving player.
        const handlePlayerLeft = (data) => {
            console.log(data);
            setPlayers(p => p.filter(player => player.session !== data.session));
        }
        socket.current.on("player_left", handlePlayerLeft);

        // Receives the session ID ("session", integer) of the player who has readied, and optionally their name ("name", string) if it has changed.
        const handleReady = (data) => {
            console.log(data);
        }
        socket.current.on("ready", handleReady);

        // Receives the session ID ("session", integer) of the player who has unreadied.
        const handleUnready = (data) => {
            console.log(data);
        }
        socket.current.on("unready", handleUnready);

        //fakerayray

        const handleRoleAssignmentChange = (data) => {
            console.log("Role Assignment change received:", data);  // Debugging
            setCurrentSeason(data.state);
        };
        socket.current.on("role_assignment_changed", handleRoleAssignmentChange);

        const handleSpringChange = (data) => {
            console.log("Spring change received:", data);  // Debugging
            setCurrentSeason(data.state);
        };
        socket.current.on("spring_changed", handleSpringChange);

        const handleDoubleHarvestChange = (data) => {
            console.log("Double Harvest change received:", data);  // Debugging
            setCurrentSeason(data.state);
        };
        socket.current.on("double_harvest_changed", handleDoubleHarvestChange);

        const handleSummerChange = (data) => {
            console.log("Summer change received:", data);  // Debugging
            setCurrentSeason(data.state);
            
        };
        socket.current.on("summer_changed", handleSummerChange);

        const handleAutumnChange = (data) => {
            console.log("Autumn change received:", data);  // Debugging
            setCurrentSeason(data.state);
            
        };
        socket.current.on("autumn_changed", handleAutumnChange);

        const handleWinterChange = (data) => {
            console.log("Winter change received:", data);  // Debugging
            setCurrentSeason(data.state);
            
        };
        socket.current.on("winter_changed", handleWinterChange);

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
            socket.current.off("ready", handleReady);
            socket.current.off("unready", handleUnready);
            //fakerayray
            socket.current.off("role_assignment_changed", handleRoleAssignmentChange);
            socket.current.off("spring_changed", handleSpringChange);
            socket.current.off("double_harvest_changed", handleDoubleHarvestChange);
            socket.current.off("summer_changed", handleSummerChange);
            socket.current.off("autumn_changed", handleAutumnChange);
            socket.current.off("winter_changed", handleWinterChange);
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

    const handleEditButtonClick = () => {
        // If in edit mode, this click is to confirm the name.
            // Do input sanitisation check and reject if it doesn't meet the criteria.

            // Reject if someone else in the room already has the name.

            // Emit the event and ready yourself.
            //socket.current.emit("confirm_name", {
            //    session: getSession(),
            //    name: ""
            //});

        // If not in edit mode, this click is to edit the name.
            // Emit the event and unready yourself.
            //socket.current.emit("edit_name", {
            //    session: getSession()
            //});
    }

    //fakerayray

    const handleStartInstructionsClick = () => {
        socket.current.emit('start_instructions', {
            session: getSession()
        });
    };

    const handleRoleAssignmentChangeClick = () => {
        socket.current.emit('role_assignment_transition', {
            session: getSession()
        });
        console.log(currentSeason);

    };

    const handleSpringChangeClick = () => {
        socket.current.emit('spring_transition', {
            session: getSession()
        });
        console.log(currentSeason);

    };

    const handleDoubleHarvestChangeClick = () => {
        socket.current.emit('double_harvest_transition', {
            session: getSession()
        });
        console.log(currentSeason);

    };

    const handleSummerChangeClick = () => {
        socket.current.emit('summer_transition', {
            session: getSession()
        });
        console.log(currentSeason);

    };

    const handleAutumnChangeClick = () => {
        socket.current.emit('autumn_transition', {
            session: getSession()
        });
        console.log(currentSeason);

    };

    const handleWinterChangeClick = () => {
        socket.current.emit('winter_transition', {
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