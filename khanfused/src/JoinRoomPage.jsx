import './JoinRoomPage.css'
import logo from './Assets/Khanfused.svg'

function JoinRoomPage() {

    return (
        <div className="joinRoom-page">
            <div className="logo-joinRoom">
                <img src={logo} alt="Khanfused Logo" />
            </div>
            <div className="joinRoom-container">
                <input 
                    className="room-code-box"
                    type="text"
                    placeholder="enter the room code"
                />
                <input 
                    className="room-password-box"
                    type="password"
                    placeholder="enter the password"
                />
                <button>join game</button>
            </div>
        </div>
    );
}

export default JoinRoomPage;