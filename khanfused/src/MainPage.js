import logo from "./Assets/Khanfused.svg";
import './MainPage.css';
import { useNavigate } from "react-router-dom";

function MainPage() {

    const navigate = useNavigate();

    // ren shyuen: redirect to create room page
    const handleCreateRoomClick = () => {
        navigate('/create-room');
    }

    const handleJoinRoomClick = () => {
        navigate('/join-room');
    }

    return (
        <div className="mainPage">
            <div className="logo-main">
                <img src={logo} alt="Khanfused Logo" />
            </div>
            <div className="mainPage-container">
                <button onClick={handleCreateRoomClick}>create room</button>
                <button onClick={handleJoinRoomClick}>join room</button>
            </div>
        </div>
  );
}

export default MainPage;
