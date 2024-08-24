import './SpringDouble.css';

function SpringDouble ({handleSummerChangeClick}) {
    return (
        <div className="springDouble">
            <div className="springDouble-container">
                <div className="springDouble-button-bar">
                    <button>
                        Double Harvest
                    </button>
                    <button onClick={handleSummerChangeClick}>
                        Proceed
                    </button>
                </div>
            </div>
        </div>
    );
}       

export default SpringDouble;
