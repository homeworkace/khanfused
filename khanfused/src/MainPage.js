import logo from "./Assets/Khanfused.svg";
import './MainPage.css';

function MainPage() {
    return (
        <div className="global">
            <div className="logo">
                <img src={logo} alt="Khanfused Logo" />
            </div>
            <div className="button-container">
                <button className="button">Create Room</button>
                <button className="button">Join Room</button>
            </div>
        </div>
  );
}

export default MainPage;
