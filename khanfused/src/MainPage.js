import logo from "./Assets/Khanfused.svg";
import './MainPage.css';
import { useNavigate } from "react-router-dom";
import { checkSession } from './restBoilerplate';

function MainPage() {

    let promise = checkSession();
    promise.then((sessionDetails) => {
        if ("redirect" in sessionDetails) {
            if (sessionDetails["redirect"].substring(0, 6) === "/room/") {
                navigate(sessionDetails["redirect"], { replace: true });
            }
        }
    });

    const navigate = useNavigate();

    // ren shyuen: redirect to create room page
    const handleCreateRoomClick = () => {
        navigate('/create-room', { replace: true });
    }

    const handleJoinRoomClick = () => {
        navigate('/join-room', { replace: true });
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
