import './AutumnDouble.css';

function AutumnResults ({socket, role, players}) {
    // show who has been banished
    return (
        <div className="autumnDouble">
            <div className="autumnDouble-container">
                <div className="autumnDouble-button-bar">
                    <button>
                        Double Harvest
                    </button>
                    <button>
                        Proceed
                    </button>
                </div>
            </div>
        </div>
    );
}       

export default AutumnResults;
