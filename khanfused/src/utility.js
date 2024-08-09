function getSession() {
    let sessionID = "";
    for (let pair of document.cookie.split("; ")) {
        if (pair.split("=")[0] === "session") {
            sessionID = pair.split("=")[1];
        }
    }
    return sessionID;
}