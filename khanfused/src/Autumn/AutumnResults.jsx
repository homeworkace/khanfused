import './AutumnDouble.css';
import HelpButton from '../Helper/Instructions';

function AutumnResults ({grain, banished, status, socket, role, players}) {

    const renderRoleSpecificContent = () => {
            // if someone has been banished
            if (banished != -1){
                const banishedPlayer = players.find(p => p.session === banished);
                if (!banishedPlayer) {
                    return ;
                }
                
                if (status === 2) {
                    // show the person he has been banished
                    return (
                        <div >
                            <p> YOU HAVE BEEN BANISHED </p>
                        </div>
                    )
            } else {
                // show who the king has banished
                return (
                    <div>
                        <p>THE KING HAS CHOSEN TO BANISH </p>
                        <p className ="banished-player-name">{banishedPlayer.name}</p>
                    </div>
                )
            }
        } else if(banished === -1) {
            // no one has been banished
            return (
            <div>
                <p className ="non-banished-text">THE KING HAS CHOSEN NOT TO BANISH</p>
            </div>
            )

        } 
    }

    const handleTimeUp = () => {
    
    }

    return (
        <div className="autumnDouble">
            <div className="autumnDouble-container">

                <div className='status-container'>
                    {renderRoleSpecificContent()}
                </div>

                <HelpButton role={role} />

            </div>
        </div>
    );
}       

export default AutumnResults;
