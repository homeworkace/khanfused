import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import MainPage from './MainPage';
import CreateRoomPage from './CreateRoomPage.jsx'; // import the new page component
import reportWebVitals from './reportWebVitals';
import { checkSession } from './restBoilerplate';

async function heartbeat() {
    //Send the sessionID to the server if it exists.
    let sessionDetails = await checkSession();

    //Update our session details.
    document.cookie = "session=" + sessionDetails["session"] + "; Secure; Max-Age=1800";
    let nameToUpdate = "";
    if ("name" in sessionDetails) {
        nameToUpdate = sessionDetails["name"];
    }
    document.cookie = "name=" + nameToUpdate + "; Secure; Max-Age=1800";

    setTimeout(heartbeat, 60000);
}

await heartbeat();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/create-room" element={<CreateRoomPage />} />
            </Routes>
        </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
