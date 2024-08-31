import React, { useState } from 'react';
import './SummerResults.css';
import { getSession } from './utility.js';
import HelpButton from './Instructions';
import Timer from './Timer';
import PlayerList from "./PlayerList";

function SummerResults ({socket, players, role}) {

    const handleTimeUp = () => {
        // handleDoubleHarvestChangeClick();
      };

    // lords who choose to 1. scout (display result), 2. farm, else king and khan
    const renderRoleSpecificContent = () => {

        if (role === 'king')
        {
            return (
                <div>
                    <p> Lords </p>
                </div>
            )
        } else {
            return (
                <div className = "nonlord-text">LORDS ARE VIEWING THEIR RESULTS
                    <br/>
                    <br/>
                    Please wait...
                </div>
            )
        }

    }

    // non-role specific content
    return (
        <div className="summerResults">
            <div className="summerResults-container">
            {renderRoleSpecificContent()}
            
            <HelpButton />

            <Timer duration={10} onTimeUp={handleTimeUp} />

            <div className = "summerResults-player-list">
                <PlayerList players={players} />
            </div>
            
            </div>
        </div>
    );
}       

export default SummerResults;
