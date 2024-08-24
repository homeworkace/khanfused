import logo from "./Assets/Khanfused.svg";
import tick from "./Assets/tick.svg";
import './RoomPageView.css';
import { useEffect, useState } from 'react';
import { getSession, getName } from './utility.js';

function RoomPageView({ socket, code, currentSeason, players, setPlayers, leaveRoomClick, handleRoleAssignmentChangeClick }) {

    const [myName, setMyName] = useState(getName() ? getName() : "");
    const [editMode, setEditMode] = useState(myName === "");
    const placeholderNames = [
        "Anonymous Serf", "Anonymous Nomad", "Anonymous Bandit", "Anonymous Burgher", "Anonymous Tanner",
        "Anonymous Hunter", "Anonymous Farmer", "Anonymous Sailor", "Anonymous Miller", "Anonymous Merchant",
        "Anonymous Blacksmith", "Anonymous Fisher", "Anonymous Miner", "Anonymous Brewer", "Anonymous Baker",
        "Anonymous Knight", "Anonymous Scribe", "Anonymous Alchemist", "Anonymous Shepherd", "Anonymous Carpenter",
        "Anonymous Guard", "Anonymous Soldier", "Anonymous Spy", "Anonymous Archer", "Anonymous Healer",
        "Anonymous Monk", "Anonymous Priest", "Anonymous Seer", "Anonymous Sage", "Anonymous Scholar",
        "Anonymous Ranger", "Anonymous Rogue", "Anonymous Wanderer", "Anonymous Vagabond", "Anonymous Troubadour",
        "Anonymous Peasant", "Anonymous Noble", "Anonymous Page", "Anonymous Jester", "Anonymous Herald",
        "Anonymous Thief", "Anonymous Mercenary", "Anonymous Outlaw", "Anonymous Pilgrim", "Anonymous Merchant",
        "Anonymous Noblewoman", "Anonymous Warlord", "Anonymous Shaman", "Anonymous Witch", "Anonymous Warlock",
        "Anonymous Bard", "Anonymous Cleric", "Anonymous Druid", "Anonymous Barbarian", "Anonymous Berserker",
        "Anonymous Chieftain", "Anonymous Gladiator", "Anonymous Artisan", "Anonymous Weaver", "Anonymous Potioneer",
        "Anonymous Cook", "Anonymous Falconer", "Anonymous Navigator", "Anonymous Astrologer", "Anonymous Magician",
        "Anonymous Artisan", "Anonymous Cartographer", "Anonymous Envoy", "Anonymous Diplomat", "Anonymous Courier",
        "Anonymous Marshal", "Anonymous General", "Anonymous Admiral", "Anonymous Cavalier", "Anonymous Footman",
        "Anonymous Squire", "Anonymous Artisan", "Anonymous Vintner", "Anonymous Smuggler", "Anonymous Apprentice",
        "Anonymous Seafarer", "Anonymous Lorekeeper", "Anonymous Apothecary", "Anonymous Conjurer", "Anonymous Necromancer",
        "Anonymous Warden", "Anonymous Sentinel", "Anonymous Ward", "Anonymous Mason", "Anonymous Fencer",
        "Anonymous Gunslinger", "Anonymous Duelist", "Anonymous Engineer", "Anonymous Scout", "Anonymous Explorer",
        "Anonymous Cartwright", "Anonymous Clockmaker", "Anonymous Stonecutter", "Anonymous Gardener", "Anonymous Chandler"
    ];

    // Please see the similar handler in RenderPage.jsx.
    const handleEditClick = () => {
        let maxCharacters = 8;

        if (editMode) {
            const sanitizedInput = myName.trim();

            if (!sanitizedInput || sanitizedInput.length > maxCharacters) {
                alert(`Name can only be maximum ${ maxCharacters } characters long`);
                return;
            }

            const nameExists = players.some(player => player.name === sanitizedInput);
            if (nameExists) {
                alert(`This name is already taken. Please choose a different one`);
                return;
            }

            // register existence of player object
            setPlayers(p => p.map(player => player.session.toString().padStart(9, '0') === getSession().toString().padStart(9, '0') ? 
            { ...player, name: sanitizedInput } : player));

            socket.emit("confirm_name", 
            {
                session: getSession(),
                name: sanitizedInput
            });

            setEditMode(false);
        } else {
            // clear the name property of player object 
            setPlayers(p => p.map(player => player.session.toString().padStart(9, '0') === getSession().toString().padStart(9, '0')? { ...player, name: "" } : player
            ));

            socket.emit("edit_name", 
            {
                session: getSession()
            });

            setEditMode(true);
        }
    };

    const handleInputChange = (event) => {

        setMyName(event.target.value);
    };

    const displayPlayerList = () => {

        return players.map((player, index) => {
            //console.log(player.session);
            //console.log(Number(getSession()));

            return (
                <li key={index}>
                    {player.session === Number(getSession()) ?
                        (editMode ?
                            (
                                <div>
                                    <input placeholder="Enter your name" value={myName} onChange={handleInputChange} />
                                    <button onClick={handleEditClick}> Submit </button>
                                </div>
                            ) : (
                                <div>
                                    <span> {myName} </span>
                                    <button onClick={handleEditClick}> Edit </button>
                                    <div className="roomPageView-tick">
                                        <img src={tick} />
                                    </div>
                                </div>
                            )
                        ) : (
                            <div>
                                <span className={player.name ? "" : "grayed-out"}>
                                    {player.name ? player.name : placeholderNames[player.session % 100]}
                                </span>
                                {player.ready && (
                                    <div className="roomPageView-tick">
                                        <img src={tick} />
                                    </div>
                                )}
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
                <button onClick={ handleRoleAssignmentChangeClick }>
                    Randomise
                </button>
                

            </div>
           
        </div>
    );
}

export default RoomPageView;