import React, { useState, useEffect, useRef} from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client"
import { checkSession, leaveLobby } from './restBoilerplate.js';
import { getSession, getName } from './utility.js';
import RoomPageView from "./RoomPageView.jsx";
import './RoomPageView.css';

// Testing 
import SpringGamePlay from "./Spring/SpringGamePlay.jsx";
import SummerResults from './Summer/SummerResults.jsx';
import SummerGamePlay from './Summer/SummerGamePlay.jsx';
import AutumnGamePlay from './Autumn/AutumnGamePlay.jsx';
import AutumnResults from './Autumn/AutumnResults.jsx';
import WinterGamePlay from './Winter/WinterGamePlay.jsx';
import WinterDouble from './Winter/WinterDouble.jsx';
import KhanWin from './GameEnd/KhanWin.jsx';
import LordWin from './GameEnd/LordWin.jsx';
import InsufficentFood from './GameEnd/InsufficentFood.jsx';
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
    const [roleArray, setRoleArray] = useState([]);
    const [status, setStatus] = useState(0); // 0 if active, 1 if pillaged, 2 if banished, 3 if double harvest
    const [statusArray, setStatusArray] = useState([]);
    const [king, setKing] = useState(0); // session ID of king
    const [grain, setGrain] = useState({ initial_grain: 0, yearly_deduction: 0, added_grain: 0 }); // initial_grain, yearly_deduction, added_grain
    const [scoutedRole, setScoutedRole] = useState({});
    const [choices, setChoices] = useState(0); // 0 is default, 1 is scout, 2 is farm
    const [banished, setBanished] = useState(null); // store session id of banished player temporarily
    const [pillaged, setPillaged] = useState(null); 

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
                            socket={socket}
                            myName={myName}
                            setMyName={setMyName}
                        />
                    )

                                   
                case "reveal_role":
                    return <Role 
                        players={players}
                        roles={roleArray}
                />

                case "spring":
                    return <SpringGamePlay
                        players={players}
                        role={role}
                        roleArray={roleArray}
                        socket={socket}
                        currentSeason={currentSeason}
                        status={status}
                        statusArray={statusArray}
                        grain = {grain}
                />  

                case "summer":
                    return <SummerGamePlay
                        players = {players}
                        role={role}
                        roleArray={roleArray}
                        socket = {socket}
                        choices={choices}
                        setChoices={setChoices}
                        status={status}
                        statusArray={statusArray}
                        currentSeason={currentSeason}
                        grain ={grain}
                />

                case "summerResults":
                    return <SummerResults
                    players = {players}
                    socket = {socket}
                        role={role}
                        roleArray={roleArray}
                    scoutedRole = {scoutedRole}
                    grain = {grain}
                        status={status}
                        statusArray={statusArray}
                />

                case "autumn":
                    return <AutumnGamePlay
                        players = {players}
                        role={role}
                        roleArray={roleArray}
                        socket = {socket}
                        currentSeason={currentSeason}
                        status={status}
                        statusArray={statusArray}
                        grain ={grain}
                />

                case "banishedResult":
                    return <AutumnResults
                        players = {players}
                        socket = {socket}
                        role={role}
                        roleArray={roleArray}
                        banished = {banished}
                        status={status}
                        statusArray={statusArray}
                        grain = {grain}
                />
                case "winter":
                    return <WinterGamePlay
                        socket={socket}
                        players={players}
                        role={role}
                        roleArray={roleArray}
                        status={status }
                        statusArray={statusArray }
                        currentSeason={currentSeason}
                        grain = {grain}

                    />

                case "pillageResult":
                    return <WinterDouble
                    players = {players}
                    socket = {socket}
                        role={role}
                        roleArray={roleArray}
                    pillaged = {pillaged}
                        status={status}
                        statusArray={statusArray}
                />    

                // insufficentFood scenario -- to be replaced with actual state
                case "insufficentFood":
                    return <InsufficentFood
                />

                // lordWin scenario -- to be replaced with actual state
                case "lordWin":
                    return <LordWin
                />

                // khanWin screnario -- to be repladed with actual state
                case "khanWin":
                    return <KhanWin
                />
                
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
        socket.current = io("/", { autoConnect: false });

        // Receives all relevant information to start the client off.
        const handleJoin = (data) => {
            let _players = [];
            let roleInt = 0;
            switch (data["state"]) {
                case "waiting":
                    for (let i = 0; i < data['players'].length; ++i) {
                        let thePlayer = {};
                        thePlayer.session = data['players'][i][0];
                        thePlayer.name = data['players'][i][1];
                        thePlayer.ready = data['ready'][i];
                        _players.push(thePlayer);
                    }
                    setPlayers(_players);
                    break;

                case "role_assignment":
                    for (let i = 0; i < data['players'].length; ++i) {
                        let thePlayer = {};
                        thePlayer.session = data['players'][i][0];
                        thePlayer.name = data['players'][i][1];
                        thePlayer.ready = true;
                        _players.push(thePlayer);
                    }
                    setPlayers(_players);

                    roleInt = data['roles'][data['players'].map(p => p[0]).indexOf(Number(getSession()))];
                    if (roleInt === 0) {
                        setRole("king");
                    }
                    else if (roleInt === 1) {
                        setRole("lord");
                    }
                    else {
                        setRole("khan");
                    }
                    setRoleArray(data['roles']);

                    setStatus(data['status'][data['players'].map(p => p[0]).indexOf(Number(getSession()))]);
                    setStatusArray(data['status']);

                    setKing(data['players'][data['roles'].indexOf(0)]['session']);
                    setGrain({ ...grain, yearly_deduction: data['game_rules']['yearly_deduction'] });
                    break;

                case "spring":
                    for (let i = 0; i < data['players'].length; ++i) {
                        let thePlayer = {};
                        thePlayer.session = data['players'][i][0];
                        thePlayer.name = data['players'][i][1];
                        thePlayer.ready = data['ready'][i];
                        _players.push(thePlayer);
                    }
                    setPlayers(_players);

                    roleInt = data['roles'][data['players'].map(p => p[0]).indexOf(Number(getSession()))];
                    if (roleInt === 0) {
                        setRole("king");
                    }
                    else if (roleInt === 1) {
                        setRole("lord");
                    }
                    else {
                        setRole("khan");
                    }
                    setRoleArray(data['roles']);

                    setStatus(data['status'][data['players'].map(p => p[0]).indexOf(Number(getSession()))]);
                    setStatusArray(data['status']);

                    setKing(data['players'][data['roles'].indexOf(0)]['session']);
                    setGrain({ ...grain, yearly_deduction: data['game_rules']['yearly_deduction'] });

                    if (roleInt === 0) {
                        setChoices(data["choices"]);
                    }
                    break;
                case "summer":
                    for (let i = 0; i < data['players'].length; ++i) {
                        let thePlayer = {};
                        thePlayer.session = data['players'][i][0];
                        thePlayer.name = data['players'][i][1];
                        if (thePlayer.session === Number(getSession())) {
                            thePlayer.ready = data['ready'];
                        }
                        else {
                            thePlayer.ready = true;
                        }
                        _players.push(thePlayer);
                    }
                    setPlayers(_players);

                    roleInt = data['roles'][data['players'].map(p => p[0]).indexOf(Number(getSession()))];
                    if (roleInt === 0) {
                        setRole("king");
                    }
                    else if (roleInt === 1) {
                        setRole("lord");
                    }
                    else {
                        setRole("khan");
                    }
                    setRoleArray(data['roles']);

                    setStatus(data['status'][data['players'].map(p => p[0]).indexOf(Number(getSession()))]);
                    setStatusArray(data['status']);

                    setKing(data['players'][data['roles'].indexOf(0)]['session']);
                    setGrain({ ...grain, yearly_deduction: data['game_rules']['yearly_deduction'] });

                    if (roleInt === 0) {
                        // the king should know who they have chosen for double harvest
                        setChoices(data["choices"]);
                    }
                    if (roleInt === 1) {
                       // being chosen for double harvest is indicated in the lord's choice
                       if (data["choices"] === -2) {
                           setStatus(3);
                       }
                       else {
                           setChoices(data["choices"]);
                       }
                    }

                case "summer_result":
                    break;
            }

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
            if (currentSeason === "summer_result") setPageToRender("summerResults");
            if (currentSeason === "autumn") setPageToRender("autumn");
            if (currentSeason === "winter") setPageToRender("winter");

            if (currentSeason === "food_end") setPageToRender("insufficentFood");
            if (currentSeason === "no_lords_end") setPageToRender("khanWin");
            if (currentSeason === "no_khans_end") setPageToRender("lordWin");

            if (currentSeason === "pillage_result") setPageToRender("pillageResult");
            if (currentSeason === "banish_result") setPageToRender("banishedResult");
            
        } else {
            setPageToRender("default");
        }

        
        return () => {

        }
    }, [currentSeason]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     *      FROM WAITING TO ROLE ASSIGNMENT
     */
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        if (currentSeason !== "waiting") {
            return;
        }

        socket.current.removeAllListeners("change_state");
        const handleChangeState = (data) => {
            
            // check if 'state' received from server is not "role_assignment"
            if (data['state'] !== "role_assignment") {
                return;
            }

            // set state to "role_assignment"
            setCurrentSeason(data['state']);
            // update 'grains' of how much of grains to be deducted every loop
            setGrain({ initial_grain: 0, added_grain: 0, yearly_deduction: data['game_rules']['yearly_deduction'] });
            
            // store the array 'role'
            setRoleArray(data['role']);

            // populate the array 'Status'
            setStatusArray(Array.from({ length: players.length }).map(() => 0));

            // find max number from the array and assign the respective role
            let role_int = Math.max(...data['role']);
            if (role_int === 0) setRole("king"); // king
            if (role_int === 1) setRole("lord"); // lord
            if (role_int === 2) setRole("khan"); // khan
            
            // find the index of 0 (King) in 'role' array
            let index = data['role'].indexOf(0);

            // store the session id of king based on the corresponding index in 'players' array
            setKing(players[index]['session']);
        }
        socket.current.on("change_state", handleChangeState);

        return () => {
            socket.current.off("change_state", handleChangeState);
        }

    }, [hasConnected, players, currentSeason]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     *      FROM ROLE ASSIGNMENT TO SPRING
     */
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        if (currentSeason !== "role_assignment") {
            return;
        }

        socket.current.removeAllListeners("change_state");
        const handleChangeState = (data) => {
            
            // check if 'state' received from server is not "spring"
            if (data['state'] !== "spring") {
                return;
            }

            // set current state to "spring"
            setCurrentSeason(data['state']);
            // ready everyone who is banished and unready everyone else
            let updated_players = players.map((player, index) => {

                // create a new player object with the updated 'ready' value
                return { ...player, ready: (statusArray[index]) === 2 };
            });

            setPlayers(updated_players);
        }
        socket.current.on("change_state", handleChangeState);

        return () => {
            socket.current.off("change_state", handleChangeState);
        }

    }, [hasConnected, currentSeason, status]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     *      FROM SPRING TO SUMMER
     */
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        if (currentSeason !== "spring") {
            return;
        }

        socket.current.removeAllListeners("change_state");
        const handleChangeState = (data) => {
            
            // check if 'state' received from server is not "summer"
            if (data['state'] !== "summer") {
                return;
            }

            // set current state to "summer"
            setCurrentSeason(data['state']);

            // unready everyone who is active and ready everyone else
            let updated_players = players.map((player, index) => {

                // create a new player object with the updated 'ready' value
                return { ...player, ready: (statusArray[index]) === 2 };
            });

            setPlayers(updated_players);

            // if key "double_harvest" is found in data
            setChoices(null);
            if ("double_harvest" in data) {

                if (role === "king") {
                    setChoices(data['double_harvest']);
                }
                // check if the key is a boolean true, then set the player as double harvest status
                else {
                    setStatus(3);
                }
            }
        }
        socket.current.on("change_state", handleChangeState);

        return () => {
            socket.current.off("change_state", handleChangeState);
        }

    }, [hasConnected, currentSeason, status, role]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     *      FROM SUMMER TO SUMMER RESULT
     */
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        if (currentSeason !== "summer") {
            return;
        }

        socket.current.removeAllListeners("change_state");
        const handleChangeState = (data) => {

            // check if 'state' received from server is not "summer_result"
            if (data['state'] !== "summer_result") {
                return;
            }

            // set current state to "summer_result"
            setCurrentSeason(data['state']);

            // checks if data contains the "result" key
            if ("result" in data) {

                // checks if the role of current player is lord
                if (role !== "lord") {
                    return;
                }

                // store session ID of the player who got chosen to get scouted
                let sessionID = data['result'][0];

                // store the index of the player found 'players' array based on matching session ID
                const index = players.findIndex(player => player.session === sessionID);

                // next, checks if the boolean is true
                if (data['result'][1] === true) {

                    // if it is true, then set scouted role to "khan"
                    setScoutedRole({ session_id: sessionID, role: "khan" });

                    // manipulate the corresponding index in 'role' array to 2
                    setRoleArray(r => {

                        // create a copy of current 'role' array and update to 2
                        const updatedRole = [...r];
                        updatedRole[index] = 2;

                        return updatedRole;
                    });

                } else {

                    // else set scouted role to "lord"
                    setScoutedRole({ session_id: sessionID, role: "lord" });

                    // manipulate the corresponding index in 'role' array to 1
                    setRoleArray(r => {

                        // create a copy of current 'role' array and update to 1
                        const updatedRole = [...r];
                        updatedRole[index] = 1;

                        return updatedRole;
                    });
                }
            }

            // update the 'grain' how much of grains are added
            setGrain({ ...grain, added_grain: data['grain'] });

            // reset double harvest guy to active status
            if (status === 3) {
                setStatus(0);
            }
        };
        socket.current.on("change_state", handleChangeState);

        return () => {
            socket.current.off("change_state", handleChangeState);
        }

    }, [hasConnected, currentSeason, role, players, grain, status]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     *      FROM SUMMER RESULT TO AUTUMN OR FOOD END
     */
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        if (currentSeason !== "summer_result") {
            return;
        }

        socket.current.removeAllListeners("change_state");
        const handleChangeState = (data) => {

            // check if 'state' received from server is "autumn"
            if (data['state'] === "autumn") {
                // set current state to "autumn"
                setCurrentSeason(data['state']);

                // recalculate grain after the cutscene
                setGrain({ ...grain, initial_grain: grain.initial_grain + grain.added_grain - grain.yearly_deduction });

                // ready everyone who is banished and unready everyone else
                let updated_players = players.map((player, index) => {

                    // create a new player object with the updated 'ready' value
                    return { ...player, ready: (statusArray[index]) === 2 };
                });

                setPlayers(updated_players);
            }
            // check if 'state' received from server is "food_end"
            if (data["state"] === "food_end") {
                // set current state to "food_end"
                setCurrentSeason(data['state']);
            }
        };
        socket.current.on("change_state", handleChangeState);

        return () => {
            socket.current.off("change_state", handleChangeState);
        }
    }, [hasConnected, currentSeason, status, players, role, grain]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     *      FROM AUTUMN TO BANISH RESULT
     */
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        if (currentSeason !== "autumn") {
            return;
        }

        socket.current.removeAllListeners("change_state");
        const handleChangeState = (data) => {

            // check if 'state' received from server is "banish_result"
            if (data['state'] !== "banish_result") {
                return;
            }

            // set current state to "banish_result"
            setCurrentSeason(data['state']);

            // checks if there is no banishment
            if (data['banished'] === -1) {

            }

            // checks if session id of chosen player matches with current player session id
            if (data['banished'] === getSession()) {

                // set current player status to banished
                setStatus(2);
            }

            // store session id of player chosen to be banished
            setBanished(data['banished']);
        };
        socket.current.on("change_state", handleChangeState);

        return () => {
            socket.current.off("change_state", handleChangeState);
        }
    }, [hasConnected, currentSeason, status, players, grain, banished]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     *      FROM BANISH RESULT TO WINTER OR NO KHANS END OR NO LORDS END
     */
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        if (currentSeason !== "banish_result") {
            return;
        }

        socket.current.removeAllListeners("change_state");
        const handleChangeState = (data) => {

            // check if 'state' received from server is "winter"
            if (data['state'] === "winter") {
                // set current state to "winter"
                setCurrentSeason(data['state']);

                // reset the previous data stored in 'banished'
                setBanished(null);

                // unready everyone who is acttive and ready everyone else
                let updated_players = players.map((player, index) => {

                    // create a new player object with the updated 'ready' value
                    return { ...player, ready: (statusArray[index]) !== 0 };
                });
                setPlayers(updated_players);
            }
            else if (data['state'] === "no_khans_end") {
                // set current state to "no_khans_end"
                setCurrentSeason(data['state']);
            }
            else if (data['state'] === "no_lords_end") {
                // set current state to "no_lords_end"
                setCurrentSeason(data['state']);
            }

        };
        socket.current.on("change_state", handleChangeState);

        return () => {
            socket.current.off("change_state", handleChangeState);
        }

    }, [hasConnected, currentSeason, banished, status, players]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     *      WINTER TO PILLAGED RESULT
     */
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        if (currentSeason !== "winter") {
            return;
        }

        socket.current.removeAllListeners("change_state");
        const handleChangeState = (data) => {

            // check if 'state' received from server is "pillage_result"
            if (data['state'] !== "pillage_result") {
                return;
            }

            // set current state to "pillage_result"
            setCurrentSeason(data['state']);

            // check if no lord was chosen for pillage
            if (data['pillaged'] === -1) {

            }
            else {
                //change the status of someone to pillaged
                let updatedStatus = statusArray;
                updatedStatus[players.map(p => p[0]).indexOf(data['pillaged'])] = 1;
                setStatusArray(updatedStatus);

                if (data['pillaged'] === Number(getSession())) {
                    setStatus(1);
                }
            }

            // store session id of player chosen to be pillaged
            setPillaged(data['pillaged']);


        };
        socket.current.on("change_state", handleChangeState);

        return () => {
            socket.current.off("change_state", handleChangeState);
        }

    }, [hasConnected, currentSeason, pillaged, status, players]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     *      PILLAGED RESULT TO SPRING OR NO LORDS END
     */
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        if (currentSeason !== "pillage_result") {
            return;
        }

        socket.current.removeAllListeners("change_state");
        const handleChangeState = (data) => {

            // check if 'state' received from server is "spring"
            if (data['state'] === "spring") {
                // set current state to "spring"
                setCurrentSeason(data['state']);
            }
            // check if 'state' received from server is "no_lords_end"
            else if (data['state'] === "no_lords_end") {
                // set current state to "no_lords_end"
                setCurrentSeason(data['state']);
            }

            // reset the previous data of 'pillaged' to null
            setPillaged(null);
        };
        socket.current.on("change_state", handleChangeState);

        return () => {
            socket.current.off("change_state", handleChangeState);
        }

    }, [hasConnected, currentSeason, pillaged, status, players]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     *      GAME END STATES TO WAITING
     */
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        if (currentSeason !== "food_end" && currentSeason !== "no_khans_end" && currentSeason !== "no_lords_end") {
            return;
        }

        socket.current.removeAllListeners("change_state");
        const handleChangeState = (data) => {


            // check if 'state' received from server is "waiting"
            if (data['state'] !== "waiting") {
                return;
            }

            // ready everyone
            let readyPlayers = [];
            for (let i = 0; i < players.length; ++i) {
                let player = players[i];
                player.ready = true;
                readyPlayers.push(player);
            }
            setPlayers(readyPlayers);


            // set current state to "waiting"
            setCurrentSeason(data['state']);
        };
        socket.current.on("change_state", handleChangeState);

        return () => {
            socket.current.off("change_state", handleChangeState);
        }

    }, [hasConnected, currentSeason, grain]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     *      END OF STATE TRANSITIONS
     */
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        if (currentSeason === "waiting") {
            return;
        }

        socket.current.removeAllListeners("ready");
        const handleReadyState = (data) => {

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

            setPlayers((p) => p.map((player) => player.session === data['session'] ? { ...player, ready: false } : player));
        };
        socket.current.on("unready", handleUnreadyState);
        
        return () => {
            socket.current.off("unready", handleUnreadyState);
        }
    }, [players]);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 *      USE EFFECT TEMPLATE / DEBUG
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (!hasConnected) {
            return;
        }

        return () => {

        }
    }, [roleArray]);

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

    return (
        <>
            {renderPage()}
        </>
    )

}

export default RoomPage