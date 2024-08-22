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
            </div>
        </div>
    );
}       

export default RandomTeams;
