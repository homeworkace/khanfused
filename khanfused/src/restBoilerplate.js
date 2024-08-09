import { getSession } from './utility';

async function checkSession() {
    let response = await fetch("http://localhost:5000/check-session", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            session: getSession()
        })
    });
    let json = await response.json();
    return json;
}

async function startLobby(password = "") {
    let response = await fetch("http://localhost:5000/create-lobby", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            session: getSession(),
            password: password
        })
    });
    let json = await response.json();
    return json;
}

export {
    checkSession,
    startLobby
}