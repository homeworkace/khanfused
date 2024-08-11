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

@app.route('/check-session', methods=['POST'])
def check_session():
    data = request.json

    result = db.query_session(data['session'])
    if result is None :
        data['session'] = str(random.randint(0, 999999999)).rjust(9, '0')
        # Create database entry
        db.new_session(data['session'])
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
    data['lobby_code'] = lobby_code
    return data

# Routinely clear sessions whose last_active is older than 30 minutes.
@scheduler.task('interval', id='clear_sessions', seconds=10)
def clear_sessions():
    db.clear_sessions(1800)

if __name__ == '__main__':
    random.seed = time.time()
    db = khanfused_db()
    rooms = {}

    app.run(debug=True)