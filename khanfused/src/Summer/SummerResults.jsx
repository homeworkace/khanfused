import React, { useEffect, useState } from 'react';
import './SummerResults.css';
import HelpButton from '../Helper/Instructions';
import PlayerList from "../Helper/PlayerList";

function SummerResults ({status, grain, scoutedRole, socket, players, role}) {

  const [currentGrain, setCurrentGrain] = useState(grain.initial_grain); // Initial grain count
  const [grainAddChange, setGrainAddChange] = useState(0); // Grain addition amount
  const [grainDeductChange, setGrainDeductChange] = useState(0); // Grain deduction amount
  const [animateAdd, setAnimateAdd] = useState(false); // Trigger animation for addition
  const [animateDeduct, setAnimateDeduct] = useState(false); // Trigger animation for deduction
  const [phase,setPhase] = useState(0);

    const handleTimeUp = () => {

    };

    useEffect(() => {
      const addedGrain = grain.added_grain; 
      const deductedGrain = grain.yearly_deduction; 
      const newGrainCount = currentGrain + addedGrain - deductedGrain;
      // switch (phase) {
      //   case 0: 
        //   setCurrentGrain(currentGrain);
        //   setPhase(phase+1);
        //   break;

      //   case 1:
      // if (addedGrain > 0) {
      //   setGrainAddChange(addedGrain); // Set addition change amount
      //   setAnimateAdd(true); // Trigger addition animation
      //   setTimeout(() => setAnimateAdd(false), 2000); // Reset animation flag after duration
      //   setPhase(phase+1);
      //   break;

      //   case 2:
      



      //   case 3:
      // if (deductedGrain > 0) {
      //   setGrainDeductChange(-deductedGrain); // Set deduction change amount
      //   setAnimateDeduct(true); // Trigger deduction animation
      //   setTimeout(() => setAnimateDeduct(false), 2000); // Reset animation flag after duration
      // }
      
      // }

  

  

      // Update current grain count after animations
      setCurrentGrain(newGrainCount);
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
            {grainAddChange > 0 && (
              <span className={`grain-change add ${animateAdd ? 'fade-animation' : ''}`}>
                +{grainAddChange}
              </span>
            )}
            {grainDeductChange < 0 && (
              <span className={`grain-change deduct ${animateDeduct ? 'fade-animation' : ''}`}>
                {grainDeductChange}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  export default SummerResults;


