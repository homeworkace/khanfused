import logo from "./Assets/Khanfused.svg";
import './RoomPageView.css';
import { useState } from 'react';
import { getSession, getName } from './utility.js';

function RoomPageView({ code, currentSeason, players, leaveRoomClick, handleRoleAssignmentChangeClick }) {

    const [playerName, setPlayerName] = useState(getName() ? getName() : "");
    const [editMode, setEditMode] = useState(playerName === "");
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
        setEditMode(!editMode);
    };

    const handleInputChange = (event) => {

        setPlayerName(event.target.value);
    };

    const displayPlayerList = () => {

        return players.map((player, index) => {
            console.log(player.session);
            console.log(Number(getSession()));


            return (
                <li key={index}>
                    {(player.session === Number(getSession())) ?
                        (
                            editMode ?
                                (
                                    <div>
                                        <input placeholder="Enter your name" value={playerName} onChange={handleInputChange} />
                                        <button onClick={handleEditClick}> Submit </button>
                                    </div>
                                ) : (
                                    <div>
                                        <span> {playerName} </span>
                                        <button onClick={handleEditClick}> Edit </button>
                                    </div>
                                )
                        ) : (
                            <div>
                                <span className={ player.name ? "" : "grayed-out" }>
                                    { player.name ? player.name : placeholderNames[player.session % 100] }
                                </span>
                            </div>
                        )
                    }
                </li>
            )
        });
    }

    console.log(`getSession() returns ${getSession().toString()}`);

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