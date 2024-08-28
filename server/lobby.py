import random
import string
from transitions import Machine
from flask_socketio import emit

fsm_states = ['waiting', 'instructions', 'role_assignment','spring', 'double_harvest','summer', 'autumn', 'winter', 
            'insufficient_food', 'khans_pillaged', 'lords_killed', 'end_game']

fsm_transitions = [
    {'trigger': 'start_instructions', 'source': '*', 'dest': 'instructions'},
    {'trigger': 'start_role_assignment', 'source': '*', 'dest': 'role_assignment'},
    {'trigger': 'start_spring', 'source': '*', 'dest': 'spring'},
    {'trigger': 'start_double_harvest', 'source': '*', 'dest': 'double_harvest'},
    {'trigger': 'start_summer', 'source': '*', 'dest': 'summer'},
    {'trigger': 'start_autumn', 'source': '*', 'dest': 'autumn'},
    {'trigger': 'start_winter', 'source': '*', 'dest': 'winter'},
    {'trigger': 'transition_to_insufficient_food', 'source': '*', 'dest': 'insufficient_food'},
    {'trigger': 'transition_to_khans_pillaged', 'source': '*', 'dest': 'khans_pillaged'},
    {'trigger': 'transition_to_lords_killed', 'source': '*', 'dest': 'lords_killed'},
    {'trigger': 'end_game', 'source': '*', 'dest': 'end_game'}
]

class lobby :
    def __init__(self, password='') :
        self.state = 'waiting'
        self.password = password
        self.players = []
        self.ready = []
        self.roles = [] # 0 if king, 1 if lord, 2 if khan
        self.perspectives = []
        self.status = [] # 0 if active, 1 if pillaged, 2 if banished
        self.choices = [] # spring: the king's choice of lord to double harvest, summer: the lords choices, autumn: the king's choice of lord to banish, winter: the khans' choices of lord to pillage
        self.grain = 0
        self.timer = 0

        self.machine = Machine(model=self, states=fsm_states, transitions=fsm_transitions, initial='waiting')

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

    def unminified(lobby_to_copy) :
        result = lobby()
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

        self.players.append((session, name))
        self.ready.append(not name is None) # If the player already has a non-conflicting name in the database, they are immediately ready.
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

    # Define states and transitions
    

    def start(self) :
        if len(self.players) < 1 : # Change to 6 when needed
            return "Not enough players!"
        for ready in self.ready :
            if ready is False :
                return "Not all players are ready!"

        # state = 'instructions'
        self.start_role_assignment()
        return None
    
    def randomize_roles(self, players):

        # Add predefined roles
        self.roles.append("King")
        self.roles.extend(["Khan", "Khan"])

        # Fill the rest of the roles with "Lord"
        while len(self.roles) < len(players):
            self.roles.append("Lord")

        # Shuffle the roles to randomize
        random.shuffle(self.roles)

        # Assign the roles to the players
        players_with_roles = [
            {"session": player['session'], "name": player['name'], "role": role}
            for player, role in zip(players, self.roles)
        ]

        return players_with_roles

    def role_assignment_transition(self, players):
        if self._can_start_role_assignment():
            self.start_role_assignment()
            #player_with_roles = self.randomize_roles(players)
            print("Transitioned to Role Assignment.")
            #return player_with_roles
        else:
            print("Role Assignment transition failed.")

    
    def spring_transition(self):
        if self._can_start_spring():
            self.start_spring()
            print("Transitioned to Spring.")
        else:
            print("Spring transition failed.")

    def double_harvest_transition(self):
        if self._can_start_double_harvest():
            self.start_double_harvest()
            print("Transitioned to Double Harvest.")
        else:
            print("Double Harvest transition failed.")

    def summer_transition(self):
        if self._can_start_summer():
            self.start_summer()
            print("Transitioned to Summer.")
        else:
            print("Summer transition failed.")
    
    def autumn_transition(self):
        if self._can_start_autumn():
            self.start_autumn()
            print("Transitioned to Autumn.")
        else:
            print("Autumn transition failed.")

    def winter_transition(self):
        if self._can_start_winter():
            self.start_winter()
            print("Transitioned to Winter.")
        else:
            print("Winter transition failed.")

    def waiting_transition(self) :
        self.ready = [True] * len(self.players)
        self.roles = []
        self.perspectives = []
        self.status = []
        self.choices = []
        self.grain = 0

    def _can_start_instructions(self):
        # Example condition to start instructions; modify based on your game logic
        return True
    
    def _can_start_role_assignment(self):
        # Example condition to start instructions; modify based on your game logic
        return True

    def _can_start_spring(self):
        # Example condition to start spring; modify based on your game logic
        return True
    
    def _can_start_double_harvest(self):
        # Example condition to start instructions; modify based on your game logic
        return True

    def _can_start_summer(self):
        # Example condition to start summer; modify based on your game logic
        return True

    def _can_start_autumn(self):
        # Example condition to start autumn; modify based on your game logic
        return True

    def _can_start_winter(self):
        # Example condition to start winter; modify based on your game logic
        return True

    def get_state(self):
        return self.state

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