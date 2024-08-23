import './SummerDouble.css';

function SummerDouble ({handleAutumnChangeClick}) {
    return (
        <div className="summerDouble">
            <div className="summerDouble-container">
                <div className="summerDouble-button-bar">
                    <button>
                        Double Harvest
                    </button>
                    <button onClick={handleAutumnChangeClick}>
                        Proceed
                    </button>
                </div>
            </div>
        </div>
    );
}       

export default SummerDouble;
