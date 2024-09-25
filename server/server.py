from flask import Flask, request
from flask_cors import CORS
from flask_apscheduler import APScheduler
from database import *
from lobby import *
import json
from pathlib import Path
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__, static_folder='build', static_url_path='/')
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SCHEDULER_API_ENABLED'] = True

cors = CORS(app)    

socket_app = SocketIO(app, cors_allowed_origins='*', async_mode='threading')

scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

# When the browser queries any of the React router endpoints, the server provides the entire React app.
@app.route('/')
@app.route('/create-room')
@app.route('/join-room')
@app.route('/room/<code>')
def serve_app(code = ''):
    return app.send_static_file('index.html')

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
    rooms[lobby_code] = lobby(scheduler, socket_app, data['password'])
    rooms[lobby_code].lobby_code = lobby_code
    
    # Add the player into the lobby.
    the_lobby = rooms[lobby_code]
    the_lobby.join_lobby(int(data['session']), db.query_session(data['session'])[2])
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

    
    the_lobby = rooms[data['lobby_code']]

    # Check if the game has already started.
    if the_lobby.state != 'waiting' :
        return { 'message': 'Game is in progress' }, 400

    # Check if the provided password matches with the lobby's.
    if data['password'] != the_lobby.password :
        return { 'message': 'Wrong password' }, 400

    # If the player's name in the database matches someone else's, remove their name.
    new_player_name = db.query_session(data['session'])[2]
    if new_player_name in [player[1] for player in the_lobby.players] :
        new_player_name = None
        db.update_name(data['session'], None)

    # Add the new player.
    the_lobby.join_lobby(int(data['session']), new_player_name)
    db.update_lobby(data['session'], data['lobby_code'])

    # Send the client a redirect.
    result = {}
    if new_player_name is None :
        result['reset_name'] = True
    result['redirect'] = '/room/' + data['lobby_code']
    
    # Notify other players.
    emit('new_player', { 'session' : int(data['session']), 'name' : new_player_name }, room = data['lobby_code'], namespace = '/')

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

    # If the game has already started, reject this request.
    if the_lobby.state != 'waiting' :
        return { 'message': 'Game is in progress' }, 400

    if the_lobby.leave_lobby(int(data['session'])) :
        db.update_lobby(data['session'], None)
    
    # If this results in an empty lobby, remove the lobby too.
    if len(rooms[lobby_code].players) < 1 :
        del rooms[lobby_code]
    else: 
        # Otherwise, notify remaining players.
        emit('player_left', { 'session' : int(data['session']) }, room = lobby_code, namespace = '/')

    # Send the client a redirect.
    result = {}
    result['redirect'] = '/'

    return result

# Routinely clear sessions whose last_active is older than 30 minutes.
@scheduler.task('interval', id='clear_sessions', seconds=10)
def clear_sessions():
    removed_sessions = db.clear_sessions_1(1800)
    for session, lobby_code in removed_sessions :
        if lobby_code is None:
            continue
        if not lobby_code in rooms :
            continue
        the_lobby = rooms[lobby_code]
        if the_lobby.state != 'waiting' : # If a game is in progress, mark the session for deletion instead.
            for player in range(len(the_lobby.players)) :
                if the_lobby.players[player][0] != session :
                    continue
                the_lobby.players[player] += [True]
        else :
            the_lobby.leave_lobby(session)
            if len(the_lobby.players) < 1 :
                del rooms[lobby_code]
            else: 
                # Otherwise, notify remaining players.
                socket_app.emit('player_left', { 'session' : session }, room = lobby_code, namespace = '/')
    db.clear_sessions_2(tuple([session[0] for session in removed_sessions]))

    # Routinely remove players who could not be removed.
    for code in list(rooms.keys()) :
        the_lobby = rooms[code]
        for session in [player[0] for player in rooms[code].players if len(player) > 2] :
            socket_app.emit('player_left', { 'session' : session }, room = code, namespace = '/')
        the_lobby.players = [player for player in rooms[code].players if len(player) < 3]
        if len(rooms[code].players) < 1 :
            del rooms[code]

@socket_app.on('join')
def socket_on_join(data):
    session = db.query_session(data['session'])
    lobby_info = rooms[session[3]].minified()

    # Insert game-specific rules.
    lobby_info['game_rules'] = {
        'yearly_deduction' : math.floor(len(lobby_info['players']) / 2)
        }

    # Edit the information that is shown to the player.
    # Find the index of the player. This allows us to reference the same index across other lists.
    player_index = 0
    while session[0] != lobby_info['players'][player_index][0] :
        player_index += 1

    # Present a sanitised version of the roles that represents what the player should know.
    if lobby_info['state'] != 'waiting' :
        lobby_info['roles'] = lobby_info['perspectives'][player_index]
    del lobby_info['perspectives']
    choices = lobby_info['choices'][:] # The choices field broadly represents the choice(s) that the player or other players have made, depending on the season.
    del lobby_info['choices']
    del lobby_info['result_packets']

    # Except for waiting, spring and autumn, only present whether the player is ready.
    if lobby_info['state'] != 'waiting' and lobby_info['state'] != 'spring' and lobby_info['state'] != 'autumn' :
        lobby_info['ready'] = lobby_info['ready'][player_index]
    # spring: king chooses double harvest. only the king should know their choice
    if lobby_info['state'] == 'spring' :
        if lobby_info['roles'][player_index] == 0:
            lobby_info['choices'] = choices[0]
    # summer: lords choose what to do. session id for scout, -1 for farm, -2 for double
    elif lobby_info['state'] == 'summer' :
        if lobby_info['roles'][player_index] == 1 and lobby_info['status'][player_index] == 0:
            lobby_info['choices'] = choices[player_index]
            if lobby_info['status'][player_index] == 3 :
                lobby_info['choices'] = -2
        lobby_info['status'] = [(status if status < 3 else 0) for status in lobby_info['status']]
    # summer result: resend the data that wouldve been sent for state change
    elif lobby_info['state'] == 'summer_result' :
        lobby_info.update(lobby_info['result_packets'][player_index])
    # autumn: king chooses banish. only the king should know their choice. session id for banish, -1 for none
    elif lobby_info['state'] == 'autumn' :
        if lobby_info['roles'][player_index] == 0:
            lobby_info['choices'] = choices[0]
    # winter: khans choose pillage. the khans should know each others decisions. session id for pillage, -1 for none
    elif lobby_info['state'] == 'winter' :
        if lobby_info['roles'][player_index] == 0:
            lobby_info['choices'] = choices

    emit('join', lobby_info)
    join_room(session[3])
    join_room(data['session'])

@socket_app.on('leave')
def socket_on_leave(data):
    session = db.query_session(data['session'])
    leave_room(data['session'])
    leave_room(session[3])

@socket_app.on('confirm_name')
def socket_on_confirm_name(data):
    session = db.query_session(data['session'])
    the_lobby = rooms[session[3]]

    # Check if someone else has this name.
    if data['name'] in [player[1] for player in the_lobby.players if player[0] != int(data['session'])] :
        emit('confirm_name_name_exists')
        return
    
    name_is_different = False

    # Update the name and ready the player in the lobby instance.
    for player in range(len(the_lobby.players)) :
        if the_lobby.players[player][0] != int(data['session']) :
            continue

        if the_lobby.players[player][1] != data['name']:
            name_is_different = True
            the_lobby.players[player][1] = data['name']
            
        the_lobby.ready[player] = True
        break

    if name_is_different :
        # Update the name in the database.
        db.update_name(data['session'], data['name'])

        # Notify all players that this player is ready.
        emit('ready', { 'session' : int(data['session']), 'name' : data['name'] }, room = session[3])

    else :
        emit('ready', { 'session' : int(data['session']) }, room = session[3])

@socket_app.on('edit_name')
def socket_on_edit_name(data):
    session = db.query_session(data['session'])

    # Unready the player in the lobby instance.
    the_lobby = rooms[session[3]]
    for player in range(len(the_lobby.players)) :
        if the_lobby.players[player][0] != int(data['session']) :
            continue
        the_lobby.ready[player] = False
        break

    # Notify other players that this player is unready.
    emit('unready', { 'session' : int(data['session']) }, room = session[3], include_self = False)

@socket_app.on('start_game')
def socket_on_start_game(data):
    session = db.query_session(data['session'])

    # Attempt to start the game in the lobby.
    the_lobby = rooms[session[3]]
    result = the_lobby.start(int(data['session']))
    if result is None :
        # Notify other players that the game has started.
        for player in range(len(the_lobby.players)) :
            emit(
                'change_state', {
                    'state' : the_lobby.state,
                    'role' : the_lobby.perspectives[player],
                    'game_rules' : {
                        'yearly_deduction' : math.floor(len(the_lobby.players) / 2)
                        }
                    },
                room = str(the_lobby.players[player][0])
                )
    else :
        emit('start_game_failed', { 'message' : result })

@socket_app.on('ready')
def socket_on_ready(data) :
    # Pass the input into the appropriate lobby.
    session = db.query_session(data['session'])
    the_lobby = rooms[session[3]]
    the_lobby.handle_ready(data)
    
@socket_app.on('unready')
def socket_on_unready(data) :
    # Pass the input into the appropriate lobby.
    session = db.query_session(data['session'])
    the_lobby = rooms[session[3]]
    the_lobby.handle_unready(data)

@socket_app.on('select')
def socket_on_select(data) :
    # Pass the input into the appropriate lobby.
    session = db.query_session(data['session'])
    the_lobby = rooms[session[3]]
    the_lobby.handle_select(data)


if __name__ == '__main__':
    random.seed = time.time()
    db = khanfused_db()
    rooms = {}
    
    if Path('rooms.json').exists() :
        rooms_file = open('rooms.json', 'r')
        rooms = json.load(rooms_file)
        rooms_file.close()
        for code in rooms :
            rooms[code] = lobby.unminified(rooms[code], scheduler, socket_app)
    try :
        socket_app.run(app)
    except Exception as e :
        print(e)
    for code in rooms :
        rooms[code] = rooms[code].minified(True)
    rooms_file = open('rooms.json', 'w')
    json.dump(rooms, rooms_file)
    rooms_file.close()
    