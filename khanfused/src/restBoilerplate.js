async function checkSession(sessionValue) {
    let response = await fetch("http://localhost:5000/check-session", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            session: sessionValue
        })
    });
    let json = await response.json();
    return json;
}

export default checkSession;