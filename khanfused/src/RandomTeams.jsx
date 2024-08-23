import React from 'react';
import Lottie from 'lottie-react';
import animationData from './Assets/questionMark-animation.json';
import './RandomTeams.css';

function RandomTeams ( {handleSpringChangeClick}) {
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
                <Lottie animationData={animationData} />
            </div>
        </div>
    );
}       

export default RandomTeams;
