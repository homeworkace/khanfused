import { getSession, getName } from './utility';

async function checkSession() {
    let response = await fetch("/check-session", {
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

    //Update our session details.
    //document.cookie = "session=" + json["session"] + "; Secure; Max-Age=1800; path=/";
    document.cookie = "session=" + json["session"] + "; Max-Age=1800; path=/";
    let nameToUpdate = "";
    if ("name" in json) {
        nameToUpdate = json["name"];
    }
    //document.cookie = "name=" + nameToUpdate + "; Secure; Max-Age=1800; path=/";
    document.cookie = "name=" + nameToUpdate + "; Max-Age=1800; path=/";

    return json;
}

async function startLobby(password = "") {
    let response = await fetch("/create-lobby", {
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

async function joinLobby(lobbyCode, password = "") {
    let response = await fetch("/join-lobby", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            session: getSession(),
            lobby_code: lobbyCode,
            password: password
        })
    });
    let json = await response.json();
    return json;
}

async function leaveLobby() {
    let response = await fetch("/leave-lobby", {
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

export {
    checkSession,
    startLobby,
    joinLobby,
    leaveLobby
}