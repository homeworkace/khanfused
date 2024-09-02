import './AutumnDouble.css';
import HelpButton from './Instructions';
import Timer from './Timer';
import PlayerList from "./PlayerList";

function AutumnResults ({banished, status, socket, role, players}) {

    const renderRoleSpecificContent = () => {
        console.log(banished)
            // if someone has been banished
            if (banished !== -1){
                const banishedPlayer = players.find(p => p.session === banished);
                console.log(banishedPlayer.name);
                if (status === 2) {
                    // show the person he has been banished
                    return (
                        <div>
                            <p> YOU HAVE BEEN BANISHED </p>
                        </div>
                    )
            } else {
                // show who the king has banished
                return (
                    <div>
                        <p>THE KING HAS CHOSEN TO BANISH {banishedPlayer.name}</p>
                    </div>
                )
            }
        } else {
            // no one has been banished
            <div>
                <p>THE KING HAS CHOSEN NOT TO BANISH</p>
            </div>
        } 
    }

    const handleTimeUp = () => {
    
    }

    return (
        <div className="autumnDouble">
            <div className="autumnDouble-container">

                {renderRoleSpecificContent()}

                <HelpButton />
                <Timer duration={10} onTimeUp={handleTimeUp} />

                <div className ="autumnResults-player-list">
                    <PlayerList players={players} />
                </div>

            </div>
        </div>
    );
}       

export default AutumnResults;
