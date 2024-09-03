import './WinterDouble.css';

function PillageResult ({players, socket, role, pillaged, status}) {

    const renderRoleSpecificContent = () => {
        if(pillaged != -1){
            const pillagedPlayer = players.find(p => p.session === pillaged);
            if (!pillagedPlayer)
            {
                return (
                    <div>
                        <p>THE KHANS HAS CHOSEN NOT TO PILLAGE</p>
                    </div>
                )
            }
            if (status === 1) {
                return (
                    <div>
                        <p> YOU HAVE BEEN PILLAGED </p>
                    </div>
                )
            } else {
                return (
                    <div>
                        <p>THE KHANS HAS CHOSEN TO PILLAGE {pillagedPlayer.name}</p>
                    </div>
                )
            }
        } 
    }
    return (
        <div className={`pillage ${status === 1 ? "greyed-out" : ""}`}>
            <div className="winterDouble-container">
                {renderRoleSpecificContent()}
            </div>
        </div>
    );
}       

export default PillageResult;
