import logo from "./Assets/Khanfused.svg";
import './MainPage.css';
import { useNavigate } from "react-router-dom";

function MainPage() {

    const navigate = useNavigate();

    // ren shyuen: redirect to create room page
    const handleCreateRoomClick = () => {
        navigate('/create-room');
    }

    return (
        <div className="main-page">
            <div className="logo-main">
                <img src={logo} alt="Khanfused Logo" />
            </div>
            <div className="main-button-container">
                <button className="main-button" onClick={handleCreateRoomClick}>create room</button>
                <button className="main-button">join room</button>
            </div>
        </div>
  );
}

export default MainPage;
