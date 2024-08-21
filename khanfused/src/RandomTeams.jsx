import './RandomTeams.css';

function RandomTeams ( {proceedToSpring}) {
    return (
        <div className="randomTeams">
            <div className="randomTeams-container">
                <div className="randomTeams-button-bar">
                    <button>
                        Randomise Teams
                    </button>
                    <button onClick = {proceedToSpring}>
                        Proceed
                    </button>
                </div>
            </div>
        </div>
    );
}       

export default RandomTeams;
