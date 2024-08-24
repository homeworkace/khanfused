import './AutumnDouble.css';

function AutumnDouble ({handleWinterChangeClick}) {
    return (
        <div className="autumnDouble">
            <div className="autumnDouble-container">
                <div className="autumnDouble-button-bar">
                    <button>
                        Double Harvest
                    </button>
                    <button onClick={handleWinterChangeClick}>
                        Proceed
                    </button>
                </div>
            </div>
        </div>
    );
}       

export default AutumnDouble;
