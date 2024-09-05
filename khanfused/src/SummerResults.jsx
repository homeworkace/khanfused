import React, { useEffect, useState } from 'react';
import './SummerResults.css';
import HelpButton from './Instructions';
import PlayerList from "./PlayerList";

function SummerResults ({status, grain, scoutedRole, socket, players, role}) {

    const [totalGrain, setTotalGrain] = useState(0);
    const [currentGrain, setCurrentGrain] = useState(grain[0]); // Initial grain count
  const [grainChange, setGrainChange] = useState(0); // Grain change amount
  const [animateChange, setAnimateChange] = useState(false); // Flag to trigger animation

    useEffect(() => {
      setTotalGrain(grain.initial_grain + grain.added_grain - grain.yearly_deduction);
    }, [grain]);
  
    const handleTimeUp = () => {

    };

    useEffect(() => {
        // Calculate the new grain count
        const newGrainCount = grain[0] + grain[2] - grain[1];
        const changeAmount = newGrainCount - currentGrain;
    
        if (changeAmount !== 0) {
          setGrainChange(changeAmount); // Set the change amount
          setAnimateChange(true); // Trigger the animation
          setTimeout(() => setAnimateChange(false), 2000); // Reset animation flag after duration
          setCurrentGrain(newGrainCount); // Update current grain count
        }
      }, [grain, currentGrain]);

    // lords who choose to 1. scout (display result), 2. farm, else king and khan
    const renderRoleSpecificContent = () => {

        console.log("scoutedRole: ", scoutedRole);
        if (role === 'lord')
        {
            const scoutedPlayer = players.find(p => p.session === scoutedRole.session_id);
            if(scoutedRole.role === "khan") {
                return (
                <div>
                    <p> {scoutedPlayer.name} is a</p>
                    <p className ="khanRole-text"> KHAN </p>
                </div>
                )
            }  else if (scoutedRole.role === "lord") {
                return (
                <div>
                    <p> {scoutedPlayer.name} is a </p>
                    <p className ="lordRole-text"> LORD </p>
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

        <div className="grain-info">
          Grains: {currentGrain}
          {grainChange !== 0 && (
            <span className={`grain-change ${animateChange ? 'fade-animation' : ''}`}>
              {grainChange > 0 ? `+${grainChange}` : `${grainChange}`}
            </span>
          )}
        </div>
            
            </div>
        </div>
    );
}       

export default SummerResults;
