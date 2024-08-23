from flask import Flask, request
from flask_cors import CORS
from flask_apscheduler import APScheduler
from database import *
from lobby import *
import json
from pathlib import Path
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SCHEDULER_API_ENABLED'] = True

cors = CORS(app)

socket_app = SocketIO(app,debug=True,cors_allowed_origins='*',async_mode='threading')

scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

# Dummy event
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

    # Generate a lobby code and create a new lobby in the backend.
    lobby_code = generate_lobby_code([code for code in rooms])
    rooms[lobby_code] = lobby(data['password'])
    
    # Add the player into the lobby.
    the_lobby = rooms[lobby_code]
    the_lobby.players.append((int(data['session']), db.query_session(data['session'])[2]))
    the_lobby.ready.append(not the_lobby.players[-1][1] is None) # If the player already has a name in the database, they are ready.

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

    the_lobby = rooms[data['lobby_code']]
    # If the player's name in the database matches someone else's, remove their name.
    new_player_name = db.query_session(data['session'])[2]
    if new_player_name in [player[1] for player in the_lobby.players] :
        new_player_name = None
        db.update_name(data['session'], None)

    # Add the new player. 
    the_lobby.players.append((int(data['session']), new_player_name))
    the_lobby.ready.append(not new_player_name is None) # If the player already has a non-conflicting name in the database, they are ready.
    db.update_lobby(data['session'], data['lobby_code'])

    # Send the client a redirect.
    result = {}
    result['redirect'] = '/room/' + data['lobby_code']
    
    # Notify other players.
    emit('new_player', { 'session' : rooms[data['lobby_code']].players[-1][0], 'name' : rooms[data['lobby_code']].players[-1][1] }, room = data['lobby_code'], namespace = '/')

    return result

# Event handler to leave a lobby
@app.route('/leave-lobby', methods=['POST'])
def leave_lobby():
    data = request.json

    if data['session'] == '' :
        return { 'message': 'No session ID provided' }, 400

    # Retrieve the lobby code and remove the player from said lobby.
    lobby_code = db.query_session(data['session'])[3]
    the_lobby = rooms[lobby_code]
    for player in range(len(the_lobby.players)) :
        if the_lobby.players[player][0] != int(data['session']) :
            continue
        the_lobby.players.pop(player)
        the_lobby.ready.pop(player)
        break
    
    # If this results in an empty lobby, remove the lobby too.
    if len(rooms[lobby_code].players) < 1 :
        del rooms[lobby_code]
    else: 
        # Otherwise, notify remaining players.
        emit('player_left', { 'session' : int(data['session']) }, room = lobby_code, namespace = '/')
        
    db.update_lobby(data['session'], None)

    # Send the client a redirect.
    result = {}
    result['redirect'] = '/'

    return result

# Routinely clear sessions whose last_active is older than 30 minutes.
@scheduler.task('interval', id='clear_sessions', seconds=10)
def clear_sessions():
    removed_sessions = db.clear_sessions(1800)
    for session, lobby_code in removed_sessions :
        the_lobby = rooms[lobby_code]
        for player in range(len(the_lobby.players)) :
            if the_lobby.players[player][0] != session :
                continue
            the_lobby.players.pop(player)
            the_lobby.ready.pop(player)
            break
        if len(rooms[lobby_code].players) < 1 :
            del rooms[lobby_code]

@socket_app.on('join')
def socket_on_join(data):
    session = db.query_session(data['session'])
    emit('join', rooms[session[3]].minified())
    join_room(session[3])

@socket_app.on('leave')
def socket_on_leave(data):
    session = db.query_session(data['session'])
    leave_room(session[3])

@socket_app.on('confirm_name')
def socket_on_confirm_name(data):
    session = db.query_session(data['session'])
    the_lobby = room[session[3]]

    # Check if someone else has this name.
    if data['name'] in [player[1] for player in the_lobby.players if player[0] != int(data['session'])] :
        emit('confirm_name_name_exists')
        return
    
    name_is_different = False

    # Update the name and ready the player in the lobby instance.
    for player in range(len(the_lobby.players)) :
        if the_lobby.players[player][0] != int(data['session']) :
            continue

        if the_lobby.players[player][1] == data['name']:
            name_is_different = True
        else: 
            the_lobby.players[player][1] = data['name']
        the_lobby.ready[player] = True
        break

    if name_is_different :
        # Update the name in the database.
        db.update_name(data['name'])

        # Notify all players that this player is ready.
        emit('ready', { 'session' : int(data['session']), 'name' : data['name'] }, room = session[3])
    else :
        emit('ready', { 'session' : int(data['session']) }, room = session[3])


@socket_app.on('edit_name')
def socket_on_edit_name(data):
    session = db.query_session(data['session'])

    # Unready the player in the lobby instance.
    the_lobby = room[session[3]]
    for player in range(len(the_lobby.players)) :
        if the_lobby.players[player][0] != int(data['session']) :
            continue
        the_lobby.ready[player] = False
        break

    # Notify other players that this player is unready.
    emit('unready', { 'session' : int(data['session']) }, room = session[3], include_self = False)

@socket_app.on('start_instructions')
def socket_start_instructions(data):
    session = db.query_session(data['session'])
    lobby_code = session[3]
    if lobby_code in rooms:
        lobby = rooms[lobby_code]
        lobby.start_instructions()
        emit('instructions_changed', {'state': lobby.get_state()}, room=request.sid)  # Broadcast the new state
    else:
        print("Lobby not found.")

@socket_app.on('role_assignment_transition')
def socket_start_role_assignment(data):
    session = db.query_session(data['session'])
    lobby_code = session[3]
    if lobby_code in rooms:
        lobby = rooms[lobby_code]
        lobby.role_assignment_transition()
        emit('role_assignment_changed', {'state': lobby.get_state()}, room=request.sid)  # Broadcast the new state
    else:
        print("Lobby not found.")

@socket_app.on('spring_transition')
def socket_spring_transition(data):
    session = db.query_session(data['session'])
    lobby_code = session[3]
    
    if lobby_code in rooms:
        lobby = rooms[lobby_code]
        lobby.spring_transition()  # Trigger the season transition
        emit('spring_changed', {'state': lobby.get_state()}, room=request.sid)  # Broadcast the new state
    else:
        print("Lobby not found.")

@socket_app.on('double_harvest_transition')
def socket_double_harvest_transition(data):
    session = db.query_session(data['session'])
    lobby_code = session[3]
    if lobby_code in rooms:
        lobby = rooms[lobby_code]
        lobby.double_harvest_transition()
        emit('double_harvest_changed', {'state': lobby.get_state()}, room=request.sid)  # Broadcast the new state
    else:
        print("Lobby not found.")

@socket_app.on('summer_transition')
def socket_summer_transition(data):
    session = db.query_session(data['session'])
    lobby_code = session[3]
    
    if lobby_code in rooms:
        lobby = rooms[lobby_code]
        lobby.summer_transition()  # Trigger the season transition
        emit('summer_changed', {'state': lobby.get_state()}, room=request.sid)  # Broadcast the new state
    else:
        print("Lobby not found.")

@socket_app.on('autumn_transition')
def socket_autumn_transition(data):
    session = db.query_session(data['session'])
    lobby_code = session[3]
    
    if lobby_code in rooms:
        lobby = rooms[lobby_code]
        lobby.autumn_transition()  # Trigger the season transition
        emit('autumn_changed', {'state': lobby.get_state()}, room=request.sid)  # Broadcast the new state
    else:
        print("Lobby not found.")

@socket_app.on('winter_transition')
def socket_winter_transition(data):
    session = db.query_session(data['session'])
    lobby_code = session[3]
    
    if lobby_code in rooms:
        lobby = rooms[lobby_code]
        lobby.winter_transition()  # Trigger the season transition
        emit('winter_changed', {'state': lobby.get_state()}, room=request.sid)  # Broadcast the new state
    else:
        print("Lobby not found.")

if __name__ == '__main__':
    random.seed = time.time()
    db = khanfused_db()
    rooms = {}
    
    if Path('rooms.json').exists() :
        rooms_file = open('rooms.json', 'r')
        rooms = json.load(rooms_file)
        rooms_file.close()
        for code in rooms :
            rooms[code] = lobby.unminified(rooms[code])
    try :
        # app.run(debug=True, use_reloader=False)
        socket_app.run(app)
    except Exception as e :
        print(e)
    for code in rooms :
        rooms[code] = rooms[code].minified()
    rooms_file = open('rooms.json', 'w')
    #rooms_file.write(json.dump(rooms))
    json.dump(rooms, rooms_file)
    rooms_file.close()
    