import React from 'react';
import Lottie, {LottieRefCurrentProps} from 'lottie-react';
import animationData from './Assets/questionMark-animation.json';
import { useRef } from 'react';
import './RandomTeams.css';

function RandomTeams ( {handleSpringChangeClick}) {
    const questionRef = useRef<LottieRefCurrentProps>(null);
    return (
        <div className="randomTeams">
            <div className="randomTeams-container">
                <div className="randomTeams-button-bar">
                    <button>
                        Randomise Teams
                    </button>
                    <button onClick = {handleSpringChangeClick}>
                        Proceed
                    </button>
                </div>
                <Lottie lottieRef = {questionRef} animationData={animationData} />
            </div>
        </div>
    );
}       

export default RandomTeams; 
