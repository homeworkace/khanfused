import React, { useEffect, useState, useRef } from 'react';
import './SummerResults.css';
import HelpButton from '../Helper/Instructions';
import PlayerList from "../Helper/PlayerList";

function SummerResults ({status, grain, scoutedRole, socket, players, role}) {

  const [currentGrain, setCurrentGrain] = useState(grain.initial_grain);
  const [grainAddChange, setGrainAddChange] = useState(0);
  const [grainDeductChange, setGrainDeductChange] = useState(0); 
  const [animateAdd, setAnimateAdd] = useState(false);
  const [animateDeduct, setAnimateDeduct] = useState(false);

  const prevGrainRef = useRef({
    added_grain: grain.added_grain,
    yearly_deduction: grain.yearly_deduction
  });

  useEffect(() => {
    const addedGrain = grain.added_grain; 
    const deductedGrain = grain.yearly_deduction; 

    // Detect changes in the added grain
    if (grain.added_grain !== prevGrainRef.current.added_grain) {
      setGrainAddChange(addedGrain);
      setAnimateAdd(true);
      setTimeout(() => setAnimateAdd(false), 2000);
    }

    // Detect changes in the deducted grain
    if (grain.yearly_deduction !== prevGrainRef.current.yearly_deduction) {
      setGrainDeductChange(-deductedGrain);
      setAnimateDeduct(true);
      setTimeout(() => setAnimateDeduct(false), 2000);
    }

    // Update the current grain count after animations
    const newGrainCount = currentGrain + addedGrain - deductedGrain;
    setCurrentGrain(newGrainCount);

    // Store the new grain values as previous values for the next comparison
    prevGrainRef.current = {
      added_grain: grain.added_grain,
      yearly_deduction: grain.yearly_deduction
    };

  }, [grain, currentGrain]);

  const renderRoleSpecificContent = () => {
    if (role === 'lord') {
      const scoutedPlayer = players.find(p => p.session === scoutedRole.session_id);
      if (scoutedRole.role === "khan") {
        return (
          <div>
            <p> {scoutedPlayer.name} is a</p>
            <p className="khanRole-text"> KHAN </p>
          </div>
        );
      } else if (scoutedRole.role === "lord") {
        return (
          <div>
            <p> {scoutedPlayer.name} is a </p>
            <p className="lordRole-text"> LORD </p>
          </div>
        );
      }
    } else {
      return (
        <div className="nonlord-text">
          LORDS ARE VIEWING THEIR RESULTS
          <br />
          <br />
          Please wait...
        </div>
      );
    }
  };

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
