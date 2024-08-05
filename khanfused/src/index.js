import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import MainPage from './MainPage';
import reportWebVitals from './reportWebVitals';
import checkSession from './restBoilerplate';

//Send the cookie to the server if it exists.
for (let pair of document.cookie.split("; ")) {
    if (pair.split("=")[0] === "session") {
        //Do the sending here.
        let result = await checkSession(pair.split("=")[1]);
        console.log(result);
    }
}
document.cookie = "session=nobruh; Secure"

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/starterpage" element={<App />} />
            </Routes>
        </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
