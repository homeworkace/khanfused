import './AutumnDouble.css';
import HelpButton from './Instructions';
import Timer from './Timer';
import GrainList from "./PlayerList"

function AutumnResults ({grain, banished, status, socket, role, players}) {

    const renderRoleSpecificContent = () => {
        console.log(banished)
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
        } else {
            // no one has been banished
            return (
            <div>
                <p>THE KING HAS CHOSEN NOT TO BANISH</p>
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

                <GrainList grain = {grain.initial_grain + grain.added_grain - grain.yearly_deduction} />
                <HelpButton role={role} />
                <Timer duration={5} onTimeUp={handleTimeUp} />

            </div>
        </div>
    );
}       

export default AutumnResults;
