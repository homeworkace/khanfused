import random
import string
import time

states = ['waiting', 'instructions', 'role_assignment','spring', 'double_harvest','summer', 'autumn', 'winter', 
            'insufficient_food', 'khans_pillaged', 'lords_killed', 'end_game']
game_seasons = ['spring', 'double_harvest','summer', 'autumn', 'winter']
class lobby :
    def __init__(self, password='') :
        self.state = 'waiting'
        self.password = password
        self.players = []
        self.ready = []
        self.roles = [] # 0 if king, 1 if lord, 2 if khan
        self.status = [] # 0 if active, 1 if pillaged, 2 if banished
        self.choices = [] # spring: the king's choice of lord to double harvest, summer: the lords choices, autumn: the king's choice of lord to banish, winter: the khans' choices of lord to pillage
        self.grain = 0
        self.timer = 0

    def minified(self) :
        result = {}
        result['state'] = self.state
        result['password'] = self.password
        result['players'] = self.players
        result['ready'] = self.ready
        result['roles'] = self.roles
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
        result.status = lobby_to_copy['status']
        result.grain = lobby_to_copy['grain']
        return result

    # Define states and transitions
    

    def start(self) :
        if len(self.players) < 1 : # Change to 6 when needed
            return "Not enough players!"
        for ready in self.ready :
            if ready is False :
                return "Not all players are ready!"

        self.state = 'role_assignment'
        self.randomize_roles()
        return None
    
    def randomize_roles(self, players):

        # Add predefined roles
        self.roles.append(0)
        self.roles.extend([2, 2])

        # Fill the rest of the roles with "Lord"
        while len(self.roles) < len(players):
            self.roles.append(1)

        # Shuffle the roles to randomize
        random.shuffle(self.roles)

        # Assign the roles to the players
        players_with_roles = [
            {"session": player['session'], "name": player['name'], "role": role}
            for player, role in zip(players, self.roles)
        ]

        return players_with_roles

    def transition_to_next_season(self):
        if self.current_season_index < len(game_seasons):
            self.state = game_seasons[self.current_season_index]
            self.current_season_index += 1
        else:
            self.current_season_index = 0
            self.state = game_seasons[self.current_season_index]

    def get_state(self):
        return self.state
    
    def update_timer(self, duration):
        if self.timer:
            self.timer.cancel()
        self.timer = threading.Timer(duration, self.transition_to_next_season)
        self.timer.start()

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