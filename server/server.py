from flask import Flask, request
from flask_cors import CORS
from flask_apscheduler import APScheduler
from database import *
from lobby import *
import json
import jsonpickle
from pathlib import Path
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SCHEDULER_API_ENABLED'] = True

cors = CORS(app)

socket_app = SocketIO(app,debug=True,cors_allowed_origins='*',async_mode='threading')

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
        # Create a random session ID
        data['session'] = str(random.randint(0, 999999999)).rjust(9, '0')
        # Increment this ID until it doesn't collide with an existing ID
        while not db.query_session(data['session']) is None :
            session_id = int(data['session']) + 1
            if session_id > 999999999 :
                session_id = 0
            data['session'] = str(session_id).rjust(9, '0')
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

    # Create a new lobby in the backend.
    lobby_code = generate_lobby_code([code for code in rooms])
    rooms[lobby_code] = lobby()
    rooms[lobby_code].players.append(int(data['session']))
    db.update_lobby(data['session'], lobby_code)

    # Send relevant data back
    data['lobby_code'] = lobby_code
    data['redirect'] = '/room/' + lobby_code

    return data

# Routinely clear sessions whose last_active is older than 30 minutes.
@scheduler.task('interval', id='clear_sessions', seconds=10)
def clear_sessions():
    removed_sessions = db.clear_sessions(1800)
    for session, lobby_code in removed_sessions :
        rooms[lobby_code].players.remove(session)
        if len(rooms[lobby_code].players) < 1 :
            del rooms[lobby_code]

#@socket_app.on('connect')
#def socket_on_join():
#    pass

@socket_app.on('join')
def socket_on_join():
    emit('join', {'marco': 'polo'})
    pass

if __name__ == '__main__':
    random.seed = time.time()
    db = khanfused_db()
    rooms = {}
    
    if Path('rooms.json').exists() :
        rooms_file = open('rooms.json', 'r')
        rooms = jsonpickle.decode(rooms_file.read())
        rooms_file.close()
    try :
        # app.run(debug=True, use_reloader=False)
        socket_app.run(app)
    except Exception as e :
        print(e)
    rooms_file = open('rooms.json', 'w')
    rooms_file.write(jsonpickle.encode(rooms))
    rooms_file.close()
    