import './Banished.css';

function Banished ({status}) {
    if (status === 2) {
        return (
            <div className="banished">
                <div className="banished-container">
                    <p> YOU HAVE BEEN BANISHED </p>
                </div>
            </div>
        );
    }
}       

export default Banished;
