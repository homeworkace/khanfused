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
        <div className="global">
            <div className="logo">
                <img src={logo} alt="Khanfused Logo" />
            </div>
            <div className="button-container">
                <button className="button" onClick={handleCreateRoomClick}>create room</button>
                <button className="button">join room</button>
            </div>
        </div>
  );
}

export default MainPage;
