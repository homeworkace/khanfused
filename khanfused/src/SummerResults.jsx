import React, { useEffect, useState } from 'react';
import './SummerResults.css';
import HelpButton from './Instructions';
import Timer from './Timer';
import PlayerList from "./PlayerList";

function SummerResults ({grain, scoutedRole, socket, players, role}) {

    const [totalGrain, setTotalGrain] = useState(0);

    useEffect(() => {
      setTotalGrain(prevTotal => prevTotal + grain - 3);
    }, [grain]);
  
    const handleTimeUp = () => {
        // handleDoubleHarvestChangeClick();
    };

    // lords who choose to 1. scout (display result), 2. farm, else king and khan
    const renderRoleSpecificContent = () => {

        console.log("scoutedRole: ", scoutedRole);
        if (role === 'lord')
        {
            const scoutedPlayer = players.find(p => p.session === scoutedRole.session_id);
            if(scoutedRole.role === "khan") {
                return (
                <div>
                    <p> {scoutedPlayer.name} is a KHAN </p>
                </div>
                )
            }  else if (scoutedRole.role === "lord") {
                return (
                <div>
                    <p> {scoutedPlayer.name} is a LORD </p>
                </div>
                )
            }
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

            <div className ="grain-info"> THE LORDS HAVE HARVESTED {grain} GRAINS.
                <br/>
                <p>THE KINGDOM INITIALLY HAD {totalGrain + 3 - grain} GRAINS AND WILL CONSUME 3 GRAINS</p>
                <p>THE KINGDOM NOW HAS {totalGrain} GRAINS IN SURPLUS.</p>
            </div>
            
            </div>
        </div>
    );
}       

export default SummerResults;
