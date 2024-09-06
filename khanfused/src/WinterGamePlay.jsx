import React, { useState, useEffect } from 'react';
import './WinterGamePlay.css';
import kingIcon from "./Assets/king.svg";
import lordIcon from "./Assets/lord.svg";
import khanIcon from "./Assets/khan.svg";
import unknownIcon from "./Assets/unknown.svg";
import { getSession } from './utility.js';
import HelpButton from './Instructions';
import Timer from './Timer';
import PlayerList from "./PlayerList";

function WinterGamePlay({ role, roleArray, status, statusArray, players, currentSeason, socket }) {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isPillageListOpen, setIsPillageListOpen] = useState(true);
    const [votedPlayerSession, setVotedPlayerSession] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [votes, setVotes] = useState({}); // To store votes

    useEffect(() => {
        if (votedPlayerSession) {
            setVotes(prevVotes => ({
                ...prevVotes,
                [votedPlayerSession]: (prevVotes[votedPlayerSession] || 0) + 1
            }));
        }
    }, [votedPlayerSession]);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    const handleTimeUp = () => {
        // Handle time-up logic here
    };

    const handlePlayerSelect = (playerSession) => {
        setVotedPlayerSession(playerSession);
        socket.current.emit('select', {
            state: currentSeason,
            session: getSession(),
            pillage: playerSession,
        });
    };

    const handleReadyClick = () => {
        if (!isReady) {
            socket.current.emit('ready', {
                state: currentSeason,
                session: getSession(),
            });
        } else {
            //setVotedPlayerSession(null);
            //setVotes({}); // Reset votes on unready
            socket.current.emit('unready', {
            session: getSession(),
            });
        }
        setIsReady(!isReady);
    };

    const roleIcon = (index) => {
        switch (roleArray[index]) {
            case -1:
                return unknownIcon;
            case 0:
                return kingIcon;
            case 1:
                return lordIcon;
            case 2:
                return khanIcon;
        }
    };

    const renderRoleSpecificContent = () => {
        switch (role) {
            case "khan":
                return (
                    <div className="pillage-container">
                        {players.map((player, index) => (
                            <button
                                key={player.session}
                                onClick={() => handlePlayerSelect(player.session)}
                                className={"pillage-button" +
                                    (votedPlayerSession === player.session ? " selected" : "") +
                                    (roleArray[index] == 0 ? " king" : "") +
                                    (roleArray[index] == 2 ? " khan" : "") +
                                    (statusArray[index] == 1 ? " pillaged" : "") 
                                    (statusArray[index] == 2 ? " banished" : "")
                                }
                                style={{ "--khanColour": (player.session % 256) }}
                                disabled={status !== 0 || roleArray[index] !== 1 || statusArray[index] !== 0}
                            >
                                <img src={roleIcon(index)} />
                                {player.name + (player.session === Number(getSession()) ? " (You)" : "")}
                                {false && (
                                    <span className="ticks">
                                        {Array.from({ length: votes[player.session] }, (_, index) => (
                                            <span key={index} className="tick">✔</span>
                                        ))}
                                    </span>
                                )}
                            </button>
                        ))}
                        <button
                            key={-1}
                            onClick={() => handlePlayerSelect(-1)}
                            className={"pillage-button" +
                                (votedPlayerSession === -1 ? " selected" : "")
                            }
                            disabled={status !== 0}
                        >
                            Do not pillage
                        </button>
                    </div>
                );
            default:
                return (
                    <div className="player-container">
                        {players.map((player, index) => (
                            <button
                                key={player.session}
                                className={"player-button" +
                                    (statusArray[index] == 1 ? " pillaged" : "") +
                                    (statusArray[index] == 2 ? " banished" : "")
                                }
                                disabled={true }
                            >
                                <img src={roleIcon(index)} />
                                {player.name + (player.session === Number(getSession()) ? " (You)" : "")}
                            </button>
                        ))}
                    </div>
                );
        }
    };

    return (
        <div className="winter">
            <div className="winter-container">
                {isChatOpen && (
                    <div className="chat-box">
                        <p>Chat content goes here...</p>
                    </div>
                )}
                {renderRoleSpecificContent()}
                <div className="winter-button-bar">
                    <button onClick={toggleChat} className="chat-button">
                        Chat
                    </button>
                    <button onClick={handleReadyClick}>
                        {isReady ? "Unready" : "Ready"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WinterGamePlay;
