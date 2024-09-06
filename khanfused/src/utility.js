function getSession() {
    let sessionID = "";
    for (let pair of document.cookie.split("; ")) {
        if (pair.split("=")[0] === "session") {
            sessionID = pair.split("=")[1];
        }
    }
    return sessionID;
}

function getName() {
    let name = "";
    for (let pair of document.cookie.split("; ")) {
        if (pair.split("=")[0] === "name") {
            name = pair.split("=")[1];
        }
    }
    if (name === "") {
        return null;
    }
    return name;
}

export {
    getSession,
    getName
}