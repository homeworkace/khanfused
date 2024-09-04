import React, { useState, useEffect } from 'react';
import './WinterGamePlay.css';
import { getSession } from './utility.js';
import HelpButton from './Instructions';
import Timer from './Timer';
import PlayerList from "./PlayerList";

function WinterGamePlay({ role, roleArray, statusArray, players, currentSeason, socket }) {
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

    const handlePlayerSelect = (playerName) => {
        console.log("bruh"); 
        const selectedPlayer = players.find(p => p.name === playerName);
        if (selectedPlayer) {
        setVotedPlayerSession(selectedPlayer.session);
        }
        socket.current.emit('select', {
            state: currentSeason,
            session: getSession(),
            pillage: selectedPlayer.session,
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

    const renderRoleSpecificContent = () => {
        switch (role) {
            case "khan":
                console.log(statusArray);
                return (
                    <div className="pillage-container">
                        {players.map((player, index) => (
                            <button
                                key={player.session}
                                onClick={() => handlePlayerSelect(player.name)}
                                className={"pillage-button " +
                                    (votedPlayerSession === player.session ? "selected" : "") +
                                    (roleArray[index] == 0 ? " king" : "") +
                                    (roleArray[index] == 2 ? " khan" : "") +
                                    (statusArray[index] == 1 ? " pillaged" : "") +
                                    (statusArray[index] == 2 ? " banished" : "")
                                }
                                style={{ "--khanColour": (player.session % 256) }}
                                disabled={roleArray[index] !== 1 || statusArray[index] !== 0}
                            >
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
                    </div>
                );
            default :
                {

                }
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
