import math
import random
import string
from flask_socketio import emit
from flask_apscheduler import APScheduler

states = ['waiting', 'role_assignment', 'spring', 'summer', 'summer_result', 'autumn', 'banish_result', 'winter', 'pillage_result', 'food_end', 'no_lords_end', 'no_khans_end']

class lobby :
    def __init__(self, scheduler, socket, password='') :
        self.state = 'waiting'
        self.password = password
        self.players = []
        self.ready = []
        self.roles = [] # 0 if king, 1 if lord, 2 if khan
        self.perspectives = []
        self.status = [] # 0 if active, 1 if pillaged, 2 if banished, 3 if double harvest
        self.choices = [] # spring: the king's choice of lord to double harvest, summer: the lords choices, autumn: the king's choice of lord to banish, winter: the khans' choices of lord to pillage
        self.grain = 0
        self.socket = socket
        self.timer = scheduler
        self.next_job = None

    def minified(self) :
        result = {}
        result['state'] = self.state
        result['password'] = self.password
        result['players'] = self.players
        result['ready'] = self.ready
        result['roles'] = self.roles
        result['perspectives'] = self.perspectives
        result['status'] = self.status
        result['choices'] = self.choices
        result['grain'] = self.grain
        return result

    def unminified(lobby_to_copy, scheduler, socket) :
        result = lobby(scheduler, socket)
        result.state = lobby_to_copy['state']
        result.password = lobby_to_copy['password']
        result.players = lobby_to_copy['players']
        result.ready = lobby_to_copy['ready']
        result.roles = lobby_to_copy['roles']
        result.perspectives = lobby_to_copy['perspectives']
        result.status = lobby_to_copy['status']
        result.grain = lobby_to_copy['grain']
        return result

    def join_lobby(self, session, name = None) :
        if self.state != 'waiting' :
            return False

        self.players.append([session, name])
        self.ready.append(not name is None) # If the player already has a non-conflicting name in the database, they are immediately ready.

        # Testing 10-man lobby
        self.players += [
            [0, 'Jules'],
            [1, 'Sofia'],
            [2, 'Wilford'],
            [3, 'Vivienne'],
            [4, 'Clemens'],
            [5, 'Oliver'],
            [6, 'Qasym'],
            [7, 'Zhuldyz'],
            [8, 'Aytac'],
        ]
        self.ready += [True] * 9

        return True

    def leave_lobby(self, session) :
        if self.state != 'waiting' :
            return False

        for player in range(len(self.players)) :
            if self.players[player][0] != session :
                continue
            self.players.pop(player)
            self.ready.pop(player)
            return True
        
        return False

    
    def start(self) :
        if len(self.players) < 1 : # Change to 6 when needed
            return "Not enough players!"
        for ready in self.ready :
            if ready is False :
                return "Not all players are ready!"

        self.ready = [False] * len(self.players)
        self.role_assignment_start()
        return None
    
    def role_assignment_start(self):
        self.state = 'role_assignment'
        # temp lol
        self.roles = []
        self.perspectives = []

        # Populate the roles array in sequence, then shuffle.
        self.roles += [0] # There is always 1 king
        self.roles += [2] * math.floor(len(self.players) / 4) # For every 4 players, there is 1 khan
        self.roles += [1] * (len(self.players) - len(self.roles)) # The rest are lords
        random.shuffle(self.roles)

        # Populate the roles from the perspectives of each player.
        for i in range(len(self.roles)) :
            if self.roles[i] == 0 :
                self.perspectives.append([(-1 if role > 0 else 0) for role in self.roles]) # The king only knows who they are
            elif self.roles[i] == 1 :
                self.perspectives.append([(self.roles[role] if (role == i or self.roles[role] < 1) else -1) for role in range(len(self.roles))]) # A lord knows who they are, as well as who the king is
            else :
                self.perspectives.append(self.roles[:]) # A khan knows who everyone is

        # Initialise all other game variables.
        self.status += [0] * len(self.players)
        #self.grain = 0 # Uncomment if we have a starting grain rule

        #self.next_job = self.timer.add_job(func = self.spring_start, trigger = 'interval', seconds = 5, id = 'spring_start')
        self.next_job = self.timer.add_job(func = self.spring_start, trigger = 'interval', seconds = 2, id = 'spring_start')
    
    def spring_start(self):
        self.state = 'spring'
        
        # Ready everyone who is banished and unready everyone else.
        self.ready = [True if player > 1 else False for player in self.status]

        # Set placeholder choice of lord to perform a double harvest.
        for i in range(len(self.roles)) :
            if self.roles[i] != 0 :
                continue
            eligible_choices = [j for j in range(len(self.roles)) if j != i]
            self.choices.append(self.players[random.choice(eligible_choices)][0])

        # Emit change in state.
        self.socket.emit('change_state', { 'state' : 'spring' })
        
        # Finally, set a callback for the next state.
        self.next_job.remove()
        #self.next_job = self.timer.add_job(func = self.summer_start, trigger = 'interval', seconds = 60, id = 'summer_start')
        self.next_job = self.timer.add_job(func = self.summer_start, trigger = 'interval', seconds = 5, id = 'summer_start')

    def summer_start(self) :
        self.state = 'summer'
        
        # If the chosen player is a lord, the king's choice is reflected in their status.
        for player in range(len(self.players)) :
            if self.players[player][0] != self.choices[0] :
                continue
            if self.roles[player] == 1 and self.status[player] == 0 :
                self.status[player] = 3
            break
        
        # Reset the list of choices so that it represents the lords' decisions.
        self.choices = [(-1 if self.status[player] == 0 and self.roles[player] == 1 else None) for player in range(len(self.status))]

        # Determine which of them will have the placeholder decision of scouting. The rest of the lords shall farm.
        eligible_lords = [choice for choice in self.choices if choice == -1]
        scouting_lords = len(eligible_lords) - math.floor(len(self.players)) / 2 + 2 # Subtract the minimum number of lords who need to farm to break even on grain, assuming the chosen lord isn't a khan.
        while scouting_lords > 0 :
            eligible_lords[scouting_lords - 1] = -2
            scouting_lords -= 1
        random.shuffle(eligible_lords)
        self.choices = [(None if self.choices[i] is None else eligible_lords.pop()) for i in self.choices] # Put the choices back in place.

        # Of the scouting lords, pick an eligible candidate.
        for i in range(len(self.choices)) :
            if self.choices[i] != -2 :
                continue
            
            eligible_choices = [j for j in range(len(self.perspectives[i])) if self.perspectives[i][j] == -1] # Find the acceptable indices to select based on the roles they don't already know.
            if len(eligible_choices) < 1 : # If they already know who everyone is, get them to farm instead.
                self.choices[i] = -1
            else :
                self.choices[i] = self.players[random.choice[eligible_choices]][0] # Otherwise, assign the corresponding session ID of the randomly chosen index to their choice.

        # Unready everyone who is active and ready everyone else.
        self.ready = [False if player == 0 else True for player in self.status]

        # Emit change in state.
        for player in range(len(self.players)) :
            if self.status[player] == 3 :
                self.socket.emit('change_state', { 'state' : 'summer', 'double_harvest' : True })
            else :
                self.socket.emit('change_state', { 'state' : 'summer' })

        # Finally, set a callback for the next state.
        self.next_job.remove()
        #self.next_job = self.timer.add_job(func = self.summer_start, trigger = 'interval', seconds = 30, id = 'summer_result_start')
        self.next_job = self.timer.add_job(func = self.summer_start, trigger = 'interval', seconds = 5, id = 'summer_result_start')

    def summer_result_start() :
        pass

    def waiting_start(self) :
        self.ready = [True] * len(self.players)
        self.roles = []
        self.perspectives = []
        self.status = []
        self.choices = []
        self.grain = 0

def generate_lobby_code(existing_lobby_codes) :
    base_system = list(string.digits + string.ascii_uppercase)

    result_as_a_list = list('00000')
    numeric_code = random.randint(0, 60466175)
    numeric_tally = numeric_code
    
    for i in range(5) :
        digit_tally = 0
        while numeric_tally >= 36 ** (4 - i) :
            numeric_tally -= 36 ** (4 - i)
            digit_tally += 1
        result_as_a_list[i] = base_system[digit_tally]

    
    result = ''.join(result_as_a_list)
    while result in existing_lobby_codes :
        numeric_code += 1
        if numeric_code > 60466175 :
            numeric_code = 0
        numeric_tally = numeric_code
    
        for i in range(5) :
            digit_tally = 0
            while numeric_tally >= 36 ** (4 - i) :
                numeric_tally -= 36 ** (4 - i)
                digit_tally += 1
            result_as_a_list[i] = base_system[digit_tally]
        result = ''.join(result_as_a_list)

    return result