import logo from "./Assets/Khanfused.svg";
import tick from "./Assets/tick.svg";
import './RoomPageView.css';
import { useEffect, useState } from 'react';
import { getSession, getName } from './utility.js';

function RoomPageView({ socket, code, currentSeason, players, setPlayers, myName, setMyName, leaveRoomClick, startGameClick, handleRoleAssignmentChangeClick }) {

    //const [myName, setMyName] = useState(getName() ? getName() : "");
    const [editMode, setEditMode] = useState(myName === "");
    let sanitizedInput = myName.trim();

    const placeholderNames = [
        "Serf", "Nomad", "Bandit", "Burgher", "Tanner",
        "Hunter", "Farmer", "Sailor", "Miller", "Merchant",
        "Blacksmith", "Fisher", "Miner", "Brewer", "Baker",
        "Knight", "Scribe", "Alchemist", "Shepherd", "Carpenter",
        "Guard", "Soldier", "Spy", "Archer", "Healer",
        "Monk", "Priest", "Seer", "Sage", "Scholar",
        "Ranger", "Rogue", "Wanderer", "Vagabond", "Troubadour",
        "Peasant", "Noble", "Page", "Jester", "Herald",
        "Thief", "Mercenary", "Outlaw", "Pilgrim", "Merchant",
        "Noblewoman", "Warlord", "Shaman", "Witch", "Warlock",
        "Bard", "Cleric", "Druid", "Barbarian", "Berserker",
        "Chieftain", "Gladiator", "Artisan", "Weaver", "Potioneer",
        "Cook", "Falconer", "Navigator", "Astrologer", "Magician",
        "Artisan", "Cartographer", "Envoy", "Diplomat", "Courier",
        "Marshal", "General", "Admiral", "Cavalier", "Footman",
        "Squire", "Artisan", "Vintner", "Smuggler", "Apprentice",
        "Seafarer", "Lorekeeper", "Apothecary", "Conjurer", "Necromancer",
        "Warden", "Sentinel", "Ward", "Mason", "Fencer",
        "Gunslinger", "Duelist", "Engineer", "Scout", "Explorer",
        "Cartwright", "Clockmaker", "Stonecutter", "Gardener", "Chandler"
    ];

    // Please see the similar handler in RenderPage.jsx.
    const handleEditClick = () => {
        let maxCharacters = 8;

        if (editMode) {
            if (sanitizedInput.length > maxCharacters) {
                alert(`Name can only be maximum ${ maxCharacters } characters long`);
                return;
            }

            if (!sanitizedInput) {
                alert(`Enter your name`);
                return;
            }
            
            const nameExists = players.some(player => player.name === sanitizedInput && player.session !== Number(getSession()));
            if (nameExists) {
                alert(`This name is already taken. Please choose a different one`);
                return;
            }


            setPlayers(p => p.map(player => player.session === Number(getSession()) ? 
            { ...player, name: sanitizedInput } : player));


            socket.current.emit("confirm_name", 
            {
                session: getSession(),
                name: sanitizedInput
            });

            setEditMode(false);
            setPlayers(p => p.map(player => player.session === Number(getSession()) ? { ...player, ready: true } : player));
        }
        else {

            socket.current.emit("edit_name", 
            {
                session: getSession()
            });

            setEditMode(true);
            setPlayers(p => p.map(player => player.session === Number(getSession()) ? { ...player, ready: false } : player));
        }

    };

    const handleInputChange = (event) => {

        setMyName(event.target.value);
    };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const displayPlayerList = () => {

        return players.map((player) => {
            //console.log(player.session);
            //console.log(Number(getSession()));


        
            return (
                <li key={player.session}>
                    {player.session === Number(getSession()) ?
                        (editMode ?
                            (
                                <div className="roomPageView-list-container">
                                    <input placeholder="Enter your name" value={myName} onChange={handleInputChange} />
                                    <button onClick={handleEditClick}> Submit </button>
                                </div>
                            ) : (
                                <div className="roomPageView-list-container">
                                    <img src={tick} />
                                    <span> {myName} </span>
                                    <button onClick={handleEditClick}> Edit </button>

                                </div>
                            )
                        ) : (
                            <div className="roomPageView-list-container">
                                {player.ready && (
                                    <img src={tick} />
                                )}
                                <span key={player.name} className={player.name ? "listed-name" : "grayed-out"}>
                                    {player.name ? player.name : "Anonymous " + placeholderNames[player.session % 100]}
                                </span>
                            </div>
                        )
                    }
                </li>
            )
        });
    }


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
                    { displayPlayerList() }
                </ul>
            </div>

            <div className="roomPageView-button-bar">
                {players.length > 0 && players[0]["session"] == Number(getSession()) &&
                    (
                        // Set to 5 when needed
                        <button disabled={players.length > 0 && players.some(player => !player["ready"])} onClick={startGameClick}>
                            Start Game
                        </button>
                    )
                }
                <button onClick={ leaveRoomClick }>
                    Leave Room
                </button>
            </div>

            <button className="randomise-button" onClick={ handleRoleAssignmentChangeClick }>
                    Randomise
            </button>

            <div className="current-season">
            <h2>Current Season: {currentSeason}</h2>
            </div>         
        </div>
    );
}

export default RoomPageView;