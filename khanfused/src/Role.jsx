import logo from "./Assets/Khanfused.svg";
import './Role.css'

function Role({ players, king }) {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const displayKing = () => {
        const kingName = players.find(p => p.session === king);

        if (kingName) {

            return kingName.name;
        }

        console.log(`King not found ${king}`);
        return;
    };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    return (
        <div className="rolePage">
            <div className="rolePage-container">
                <h4>Our King will be</h4>
                <h1 className="fade-in-text">{ displayKing() }</h1>
            </div>
        </div>
    );
}

export default Role 