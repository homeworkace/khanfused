import React, { useState, useEffect, useRef, useContext, createContext} from 'react';
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
import KhanWin from './KhanWin.jsx';
import LordWin from './LordWin.jsx';
import InsufficentFood from './InsufficentFood.jsx';
import Role from './Role.jsx';
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
    const [pageToRender, setPageToRender] = useState("default");
    const socket = useRef(null);
    const [myName, setMyName] = useState(getName() ? getName() : "");
    const [players, setPlayers] = useState([]);
    const [role, setRole] = useState(""); // 0 if king, 1 if lord, 2 if khan
    const [status, setStatus] = useState(0); // 0 if active, 1 if pillaged, 2 if banished, 3 if double harvest
    const [king, setKing] = useState(0); // session ID of king
    const [grain, setGrain] = useState(0);
    const [action, setAction] = useState("");

    // Test switch case purposes -- to be changed to states
    const [summerStage, setSummerStage] = useState(false);
    const [autumnStage, setAutumnStage] = useState(false);
    const [winterStage, setWinterStage] = useState(false);
    const [khanWin, setKhanWin] = useState(false);
    const [lordWin, setLordWin] = useState(false);
    const [insufficentFood, setInsufficentFood] = useState(false);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Because of the update delay bugs, this button will not work at first. Quickly edit and submit your name to refresh the display.
    const startGameClick = () => {
        socket.current.emit("start_game", {
            session: getSession()
        });
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
            switch (pageToRender) {
                default:
                    return (
                        <RoomPageView
                            code={code}
                            currentSeason={currentSeason}
                            leaveRoomClick={leaveRoomClick}
                            players={players}
                            setPlayers={setPlayers}
                            startGameClick={startGameClick}
                            handleRoleAssignmentChangeClick = {handleRoleAssignmentChangeClick}
                            socket={socket}
                            myName={myName}
                            setMyName={setMyName}
                        />
                    )

                case "role_assignment": 
                    return <RandomTeams
                        handleSpringChangeClick = {handleSpringChangeClick}
                        // handleKhanWin = {handleKhanWin}
                        // handleLordWins = {handleLordWins}
                        // handleInsufficentFood = {handleInsufficentFood}
                />

                case "spring":
                    return <SpringGamePlay
                        players={players}
                        role ={role}
                        socket={socket}
                />  

                // insufficentFood scenario -- to be replaced with actual state
                // case "insufficentFood":
                //     return <InsufficentFood
                // />

                // lordWin scenario -- to be replaced with actual state
                // case lordWin:
                //     return <LordWin
                // />

                // khanWin screnario -- to be repladed with actual state
                // case khanWin:
                //     return <KhanWin
                // />

                // case "winterStage":
                //     return <WinterDouble
                // />

                case "winter":
                    return <WinterGamePlay
                        // handleWinterStage = {handleWinterStage}
                />

                // case "autumnStage":
                //     return <AutumnDouble
                //         handleWinterChangeClick={handleWinterChangeClick}
                // />

                case "autumn":
                    return <AutumnGamePlay 
                        // handleAutumnStage = {handleAutumnStage}
                />

                // case "summerStage":
                //     return <SummerDouble
                //         handleAutumnChangeClick={handleAutumnChangeClick}
                //         role = {role}
                // />

                case "summer":
                    return <SummerGamePlay
                        players = {players}
                        // handleSummerStage = {handleSummerStage}
                        role = {role}
                />

                case "double_harvest":
                    return <SpringDouble
                        handleSummerChangeClick={handleSummerChangeClick} 
                />

                case "reveal_role":
                    return <Role 
                        players={players}
                        king={king}
                    />;
            }
        }
    };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////  GLOBAL USE EFFECT 
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

    useEffect(() => {
        if (!shouldConnect) {
            return;
        }

        //WebSockets are easier on the server than long-polling, but Werkzeug doesn't support it. Keep in mind!
        socket.current = io("http://localhost:5000", { autoConnect: false });

        // Receives all relevant information to start the client off.
        const handleJoin = (data) => {
            let _players = [];
            for (let i = 0; i < data['players'].length; ++i) {
                let thePlayer = {};
                thePlayer.session = data['players'][i][0];
                thePlayer.name = data['players'][i][1];
                thePlayer.ready = data['ready'][i];
                _players.push(thePlayer);
                //if (data['state'] !== 'waiting' && data['state'] !== 'instructions' && data['state'] !== 'role_assignment') {
                //    _players
            }
            setPlayers(_players);

            // renders page based on current state for joining players
            setCurrentSeason(data['state']);
        

            setHasConnected(true);
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
/////   WAITING USE EFFECT 
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

    // Receives the session ID ("session", integer) of the leaving player.
    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        socket.current.removeAllListeners("player_left");
        const handlePlayerLeft = (data) => {
            setPlayers(p => p.filter(player => player.session !== data['session']));
        }
        socket.current.on("player_left", handlePlayerLeft);
        

        return () => {
            socket.current.off("player_left", handlePlayerLeft);
        }
    }, [players]);

    // Receives the session ID ("session", integer) of the player who has readied, and optionally their name ("name", string) if it has changed.
    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        if (currentSeason !== "waiting") {
            return;
        }

        socket.current.removeAllListeners("ready");
        const handleReady = (data) => {
            const sessionID = data['session'];

            // 'p' is the previous state of 'players'
            setPlayers((p) => {
                // return a new array of 'p' with elements of 'p' named 'player'
                return p.map((player) => {
                    // find that specific 'player' with matching sessionID
                    if (player.session === sessionID) {

                        // creates a shallow copy of existing found 'player' with ready property set to true
                        let thePlayer = { ...player, ready: true };

                        // if the session ID turns out to be my own session ID
                        if (sessionID === Number(getSession())) {
                            
                            thePlayer.name = myName;

                        } else if ("name" in data) {
                            // update the other player's name if name is provided
                            thePlayer.name = data['name'];
                        }

                        return thePlayer;
                    }

                    return player;
                });
            });
        }

        socket.current.on("ready", handleReady);

        return () => {
            socket.current.off("ready", handleReady);
        }
    }, [players]);

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        socket.current.removeAllListeners("confirm_name_name_exists");
        const handleConfirmNameNameExists = () => {

            // restore the old name
            const p = players.find(player => player.session === Number(getSession()));

            if (p) {
                setMyName(p.name); // This stale state thing still exists
                p.ready = false;
            }
        }
        socket.current.on("confirm_name_name_exists", handleConfirmNameNameExists);

        return () => {
            socket.current.off("confirm_name_name_exists", handleConfirmNameNameExists);
        }
    }, [players]);

    // Receives the session ID ("session", integer) of the player who has unreadied.
    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        socket.current.removeAllListeners("unready");
        const handleUnready = (data) => {
            const sessionID = data['session'];

            setPlayers((p) => {
                return p.map((player) => {
                    // find that specific 'player' with matching sessionID
                    if (player.session === sessionID) {
                        let thePlayer = player;

                        // creates a copy of existing found 'player' with ready property set to false
                        thePlayer = { ...player, ready: false };

                        return thePlayer;
                    }

                    return player;
                });
            });

        }
        socket.current.on("unready", handleUnready);

        return () => {
            socket.current.off("unready", handleUnready);
        }
    }, [players]);

    useEffect(() => {
        if (!hasConnected) {
            return;
        }
        if (currentSeason !== "waiting") {
            return;
        }

        socket.current.removeAllListeners('start_game_failed');
        // handle game start failure
        const handleStartGameFailure = (data) => {
            console.log(data['message']);
        };

        socket.current.on("start_game_failed", handleStartGameFailure);

        return () => {
            socket.current.off("start_game_failed", handleStartGameFailure);
        }
    }, [hasConnected]);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////  STATE TRANSITION USES
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        // determines what page to render based on currentSeason
        if (currentSeason !== "waiting") {

            if (currentSeason === "role_assignment") setPageToRender("reveal_role");
            if (currentSeason === "spring") setPageToRender("spring");
            if (currentSeason === "summer") setPageToRender("summer");
            if (currentSeason === "autumn") setPageToRender("autumnStage");
            if (currentSeason === "winter") setPageToRender("winterStage");
            if (currentSeason === "double_harvest") setPageToRender("double_harvest");
            

        } else {
            setPageToRender("default");
        }

        
        return () => {

        }
    }, [currentSeason]);

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        socket.current.removeAllListeners("change_state");
        const handleChangeState = (data) => {
            console.log(data);

            // sync client's state with server's state
            // setCurrentSeason(data["state"]);
            setCurrentSeason("summer");
            switch (data['state']) {

                case "role_assignment":
                    let role_int = Math.max(...data['role']);

                    if (role_int === 0) setRole("king"); // king
                    if (role_int === 1) setRole("lord"); // lord
                    if (role_int === 2) setRole("khan"); // khan   

                    let index = data['role'].indexOf(0);
                    setKing(players[index]['session']);

                case "spring":
                    // if not pillaged or banished
                    if (status === 0) {
                        // set every player to unready state at start of spring
                        setPlayers(p => p.map(player => ({ ...player, ready: false })));
                    }

                case "summer":
                    
                    if (status === 0) {
                        // set every player to unready state at start of spring
                        setPlayers(p => p.map(player => ({ ...player, ready: false })));

                        // if key "double_harvest" is found in data payload
                        if ("double_harvest" in data) {
                            if (role !== "lord") return;

                            // assuming "double harvest" is a session ID
                            if (data['double_harvest'] !== getSession()) {
                                return;
                            }

                            // set current player status as double harvest
                            setStatus(3);
                        }
                    }
                
                case "autumn":
                    if (status === 0) {
                        // set every player to unready state at start of spring
                        setPlayers(p => p.map(player => ({ ...player, ready: false })));
                    }

                case "winter":
                    if (status === 0) {
                        // set every player to unready state at start of spring
                        setPlayers(p => p.map(player => ({ ...player, ready: false })));
                    }
            }
        }
        socket.current.on("change_state", handleChangeState);

        return () => {
            socket.current.off("change_state", handleChangeState);
        }
    }, [hasConnected]);

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        if (currentSeason === "waiting") {
            return;
        }

        socket.current.removeAllListeners("ready");
        const handleReadyState = (data) => {
            console.log(data);

            setPlayers((p) => p.map((player) => player.session === data['session'] ? { ...player, ready: true } : player));
        };
        socket.current.on("ready", handleReadyState);
        
        return () => {
            socket.current.off("ready", handleReadyState);
        }
    }, [players]);

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        if (currentSeason === "waiting") {
            return;
        }

        socket.current.removeAllListeners("unready");
        const handleUnreadyState = (data) => {
            console.log(data);

            setPlayers((p) => p.map((player) => player.session === data['session'] ? { ...player, ready: false } : player));
        };
        socket.current.on("unready", handleUnreadyState);
        
        return () => {
            socket.current.off("unready", handleUnreadyState);
        }
    }, [players]);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        console.log(players);
        
        return () => {

        }
    }, [players]);

    // useEffect for debugging
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

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

        // A reference to the cleanup function
        const cleanup = () => {
            socket.current.emit("leave", {
                session: getSession()
            });

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

    // const handleStartInstructionsClick = () => {
    //     socket.current.emit('start_instructions', {
    //         session: getSession()
    //     });
    // };

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

    const handleSummerChangeClick = () => {
        socket.current.emit('summer_transition', {
            session: getSession()
        });
        console.log(currentSeason);
    };

    // const handleAutumnChangeClick = () => {
    //     socket.current.emit('autumn_transition', {
    //         session: getSession()
    //     });
    //     console.log(currentSeason);

    // };

    // const handleWinterChangeClick = () => {
    //     socket.current.emit('winter_transition', {
    //         session: getSession()
    //     });
    //     console.log(currentSeason);

    // };

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

export default RoomPage