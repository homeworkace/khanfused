import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client"
import { checkSession, leaveLobby } from './restBoilerplate.js';
import { getSession, getName } from './utility.js';
import RoomPageView from "./RoomPageView.jsx";
import './RoomPageView.css';

// Testing 
import RandomTeams from "./RandomTeams.jsx";
import SpringGamePlay from "./SpringGamePlay.jsx";
import SpringDouble from './SpringDouble.jsx';
import SummerDouble from './SummerDouble.jsx';
import SummerGamePlay from './SummerGamePlay.jsx';
import AutumnGamePlay from './AutumnGamePlay.jsx';
import AutumnDouble from './AutumnDouble.jsx';
import WinterGamePlay from './WinterGamePlay.jsx';
import WinterDouble from './WinterDouble.jsx';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function RoomPage() {

    const navigate = useNavigate();
    const { code } = useParams();
    const [shouldConnect, setShouldConnect] = useState(false);
    const [hasConnected, setHasConnected] = useState(false);
    const [currentSeason, setCurrentSeason] = useState("waiting");
    const socket = useRef(null);
    const [players, setPlayers] = useState([]);

    // Test switch case purposes
    const [isRandomising, setIsRandomising] = useState(false);
    const [isSpring,springComes] = useState(false);
    const [springStage, setSpringStage] = useState(false);
    const [summerStage, setSummerStage] = useState(false);
    const [autumnStage, setAutumnStage] = useState(false);
    const [winterStage, setWinterStage] = useState(false);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const handleRandomiseClick = () => {
        setIsRandomising(true);
        console.log(isRandomising);
    }

    const handleSpringStage = () => {
        setSpringStage(true);
    }

    const handleSummerStage = () => {
        setSummerStage(true);
    }

    const handleAutumnStage = () => {
        setAutumnStage(true);
    }

    const handleWinterStage = () => { 
        setWinterStage(true);
    }

    const leaveRoomClick = async () => {
        let result = await leaveLobby();
        if ("redirect" in result) {
            navigate(result["redirect"], { replace: true });
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    const renderPage = () => {
        if (hasConnected) {
            switch (true) {

                case winterStage:
                    return <WinterDouble
                />

                case currentSeason == "winter":
                    return <WinterGamePlay
                    handleWinterStage = {handleWinterStage}
                />

                case autumnStage:
                    return <AutumnDouble
                    handleWinterChangeClick={handleWinterChangeClick}
                />

                case currentSeason == "autumn":
                    return <AutumnGamePlay 
                    handleAutumnStage = {handleAutumnStage}
                />

                case summerStage:
                    return <SummerDouble
                    handleAutumnChangeClick={handleAutumnChangeClick}
                />

                case currentSeason == "summer":
                    return <SummerGamePlay
                    handleSummerStage = {handleSummerStage}
                />

                case currentSeason == "double_harvest":
                    return <SpringDouble
                    handleSummerChangeClick={handleSummerChangeClick} 
                />
                
                case currentSeason == "spring":
                    return <SpringGamePlay
                    handleDoubleHarvestChangeClick = {handleDoubleHarvestChangeClick}
                />  

                /*case isSpring:
                    return <SpringGamePlay
                    handleSpringStage = {handleSpringStage} 
                    />*/

                case isRandomising: 
                    return <RandomTeams
                    handleSpringChangeClick = {handleSpringChangeClick}
                    //proceedToSpring = {proceedToSpring}
                    />

                default:
                    return (
                        <RoomPageView
                            handleRandomiseClick={handleRandomiseClick}
                            code={code}
                            currentSeason={currentSeason}
                            leaveRoomClick={leaveRoomClick}
                            players={players}
                            setPlayers={setPlayers}
                            handleRoleAssignmentChangeClick = {handleRoleAssignmentChangeClick}
                            socket={socket}
                            
                        />
                    )
            }
        }
    };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
        socket.current.once("connect", handleConnect);

        // Receives all relevant information to start the client off.
        const handleJoin = (data) => {
            let _players = [];
            for (let i = 0; i < data['players'].length; ++i) {
                _players.push({
                    session: data['players'][i][0],
                    name: data['players'][i][1],
                    ready: data['ready'][i]
                });
            }

            setPlayers(_players);
            console.log('Players joined: ', players);
        }
        socket.current.once("join", handleJoin);

        // connect and emit join event
        socket.current.connect();
        socket.current.emit("join", {
            session: getSession()
        });

        return () => {
            // cleanup code
        }
    }, [shouldConnect]);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Receives the session ID ("session", integer) and name ("name", string or null) of the new player.
    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        socket.current.removeAllListeners("new_player");
        const handleNewPlayer = (data) => {
            const sessionID = data['session'];
            let sessionName = data['name'];
            const _player = players.find(p => p.session === sessionID);
            if (!_player) {
                setPlayers(p => [...p, { session: sessionID, name: sessionName, ready: data['name'] !== null }]);
            }
            console.log(players);
        }
        socket.current.on("new_player", handleNewPlayer);

        return () => {
            socket.current.off("new_player", handleNewPlayer);
        }
    }, [players]);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        // Receives the session ID ("session", integer) of the leaving player.
        const handlePlayerLeft = (data) => {
            setPlayers(p => p.filter(player => player.session !== data['session']));
        }
        socket.current.on("player_left", handlePlayerLeft);

        return () => {
            socket.current.off("player_left", handlePlayerLeft);
        }
    }, []);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        // Receives the session ID ("session", integer) of the player who has readied, and optionally their name ("name", string) if it has changed.
        const handleReady = (data) => {
            // If the player is yourself, then forget the old name.
        }
        socket.current.on("ready", handleReady);

        return () => {
            socket.current.off("ready", handleReady);
        }
    }, [players]);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        socket.current.removeAllListeners("confirm_name_name_exists");
        const handleConfirmNameNameExists = () => {
            // restore the old name
            console.log(`confirm_name_name_exists`);
            console.log(players);
        }
        socket.current.on("confirm_name_name_exists", handleConfirmNameNameExists);

        return () => {
            socket.current.off("confirm_name_name_exists", handleConfirmNameNameExists);
        }
    }, [players]);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        // Receives the session ID ("session", integer) of the player who has unreadied.
        const handleUnready = (data) => {
            // console.log(data);
        }
        socket.current.on("unready", handleUnready);

        return () => {
            socket.current.off("unready", handleUnready);
        }
    }, []);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        
        return () => {

        }
    }, []);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        // Makes the decision to reverse the name change because the server has detected that someone else has this name.
        const handleEditNameNameExists = () => {
            // console.log("edit_name_name_exists");
            // Return to edit mode and restore your old name.
        }

        //fakerayray

        const handleRoleAssignmentChange = (data) => {
            console.log("Role Assignment change received:", data);  // Debugging
            setIsRandomising(true);
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

        // A reference to the cleanup function
        const cleanup = () => {
            socket.current.emit("leave", {
                session: getSession()
            });

            // socket.current.off("player_left", handlePlayerLeft);
            // socket.current.off("ready", handleReady);
            // socket.current.off("unready", handleUnready);
            // socket.current.off("confirm_name_name_exists", handleConfirmNameNameExists);
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
    }, [hasConnected]);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // pass socket to roompageview
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
            // Write the previous name to another variable.

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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    return (
        <>
            {renderPage()}
        </>
    )

}
export default RoomPage;