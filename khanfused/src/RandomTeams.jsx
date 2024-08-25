import React from 'react';
import Lottie, {LottieRefCurrentProps} from 'lottie-react';
import animationData from './Assets/questionMark-animation.json';
import { useRef } from 'react';
import './RandomTeams.css';
import Timer from './Timer';

function RandomTeams ( {handleSpringChangeClick, handleLordWins}) {
    const questionRef = useRef<LottieRefCurrentProps>(null);
    
    const handleTimeUp = () => {
        handleSpringChangeClick();
    }

    return (
        <div className="randomTeams">
            <div className="randomTeams-container">
                <div className="randomTeams-button-bar">
                    <button onClick={handleLordWins}>
                        Randomise Teams
                    </button>
                    <button onClick = {handleSpringChangeClick}>
                        Proceed
                    </button>
                    <Timer duration={10} onTimeUp={handleTimeUp} />
                </div>
                <Lottie lottieRef = {questionRef} animationData={animationData} />
            </div>
        </div>
    );
}       

export default RandomTeams; 
