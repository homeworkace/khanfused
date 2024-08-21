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
    else :
        db.refresh_session(data['session'])
        if not result[2] is None :
            data['name'] = result[2]
        
        # If this session is also in a lobby, send a redirect key to the client.
        if not result[3] is None :
            if result[3] in rooms :
                data['redirect'] = '/room/' + result[3]
    return data

# Event handler for lobby creation
@app.route('/create-lobby', methods=['POST'])
def create_lobby():
    data = request.json

    if data['session'] == '' :
        return { 'message': 'No session ID provided' }, 400

    # Create a new lobby in the backend.
    lobby_code = generate_lobby_code([code for code in rooms])
    rooms[lobby_code] = lobby()
    rooms[lobby_code].players.append((int(data['session']), db.query_session(data['session'])[2]))
    db.update_lobby(data['session'], lobby_code)

    # Send relevant data back
    result = {}
    result['redirect'] = '/room/' + lobby_code

    return result

# Event handler to join a lobby
@app.route('/join-lobby', methods=['POST'])
def join_lobby():
    data = request.json

    if data['session'] == '' :
        return { 'message': 'No session ID provided' }, 400

    # Check if the specified lobby exists.
    if not data['lobby_code'] in rooms :
        return { 'message': 'No lobby with this code' }, 400

    # Check if the provided password matches with the lobby's.
    if data['password'] != rooms[data['lobby_code']].password :
        return { 'message': 'Wrong password' }, 400

    # Add the new player.
    rooms[data['lobby_code']].players.append((int(data['session']), db.query_session(data['session'])[2]))
    db.update_lobby(data['session'], data['lobby_code'])

    # Send relevant data back
    result = {}
    result['redirect'] = '/room/' + data['lobby_code']

    return result

# Event handler to leave a lobby
@app.route('/leave-lobby', methods=['POST'])
def leave_lobby():
    data = request.json

    if data['session'] == '' :
        return { 'message': 'No session ID provided' }, 400

    # Add the new player.
    lobby_code = db.query_session(data['session'])[3]
    rooms[lobby_code].players = [player for player in rooms[lobby_code].players if player[0] != int(data['session'])]
    if len(rooms[lobby_code].players) < 1 :
        del rooms[lobby_code]
    db.update_lobby(data['session'], None)

    # Send relevant data back
    result = {}
    result['redirect'] = '/'

    return result

# Routinely clear sessions whose last_active is older than 30 minutes.
@scheduler.task('interval', id='clear_sessions', seconds=10)
def clear_sessions():
    removed_sessions = db.clear_sessions(1800)
    for session, lobby_code in removed_sessions :
        rooms[lobby_code].players = [player for player in rooms[lobby_code].players if player[0] != session]
        if len(rooms[lobby_code].players) < 1 :
            del rooms[lobby_code]

@socket_app.on('join')
def socket_on_join(data):
    session = db.query_session(data['session'])
    
    emit('join', jsonpickle.encode(rooms[session[3]]))

@socket_app.on('start_instructions')
def socket_start_instructions(data):
    session = db.query_session(data['session'])
    lobby_code = session[3]
    if lobby_code in rooms:
        rooms[lobby_code].start_instructions()
        emit('state_changed', {'state': 'instructions'}, broadcast=True)

@socket_app.on('transition_season')
def socket_transition_season(data):
    session = db.query_session(data['session'])
    lobby_code = session[3]
    
    if lobby_code in rooms:
        lobby = rooms[lobby_code]
        lobby.transition_season()  # Trigger the season transition
        emit('state_changed', {'state': lobby.get_state()}, room=request.sid)  # Broadcast the new state
    else:
        print("Lobby not found.")

# Route to handle season transitions
@app.route('/transition-season', methods=['POST'])
def transition_season():
    data = request.json
    session = data.get('session')
    if not session:
        return {'message': 'Session ID not provided'}, 400

    lobby = get_lobby_from_session(session)
    if lobby is None:
        return {'message': 'Lobby not found'}, 400

    # Use the transition_season method to handle the transition
    lobby.transition_season()

    # Retrieve the current state after transition
    current_season = lobby.get_state()

    return {'message': f'Transitioned to {current_season}', 'currentSeason': current_season}


def get_lobby_from_session(session):
    lobby_code = db.query_session(session)[3]
    return rooms.get(lobby_code)




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
    