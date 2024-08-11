from flask import Flask, request
from flask_cors import CORS
from flask_apscheduler import APScheduler
from database import *
from lobby import *

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SCHEDULER_API_ENABLED'] = True

cors = CORS(app)

scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

# Event handler for the home page
@app.route('/')
def home():
    return 'Hello, World!'

# Event handler for the home page
@app.route('/check-session', methods=['POST'])
def check_session():
    data = request.json

    result = db.query_session(data['session'])
    if result is None :
        data['session'] = str(random.randint(0, 999999999)).rjust(9, '0')
        # Create database entry
        db.new_session(data['session'])
        data['redirect'] = '/'
    else :
        db.refresh_session(data['session'])
        if not result[2] is None :
            data['name'] = result[2]
    return data

# Event handler for lobby creation
@app.route('/create-lobby', methods=['POST'])
def submit():
    data = request.json

    if data['session'] == '' :
        return data, 400

    lobby_code = 'alphanumeric'
    rooms[lobby_code] = lobby()
    db.update_lobby(data['session'], lobby_code)
    data['lobby_code'] = lobby_code
    return data

# Routinely clear sessions whose last_active is older than 30 minutes.
@scheduler.task('interval', id='clear_sessions', seconds=10)
def clear_sessions():
    removed_sessions = db.clear_sessions(1800)
    for session, lobby_code in removed_sessions :
        rooms[lobby_code].players.remove(session)
        if len(rooms[lobby_code].players) < 1 :
            del rooms[lobby_code]

if __name__ == '__main__':
    random.seed = time.time()
    db = khanfused_db()
    rooms = {}

    app.run(debug=True, use_reloader=False)
    