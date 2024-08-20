import random
import string
from transitions import Machine

class lobby :
    def __init__(self, password='') :
        self.state = 'waiting'
        self.password = password
        self.players = []

        # Define states and transitions
        self.states = ['waiting', 'selectingrole', 'spring', 'summer', 'autumn', 'winter', 
                       'insufficient_food', 'khans_pillaged', 'lords_killed', 'end_game']

        self.transitions = [
            {'trigger': 'start_role_selection', 'source': 'waiting', 'dest': 'selectingrole'},
            {'trigger': 'transition_to_season', 'source': 'selectingrole', 'dest': 'spring'},
            {'trigger': 'transition_to_summer', 'source': 'spring', 'dest': 'summer'},
            {'trigger': 'transition_to_autumn', 'source': 'summer', 'dest': 'autumn'},
            {'trigger': 'transition_to_winter', 'source': 'autumn', 'dest': 'winter'},
            {'trigger': 'transition_back_to_spring', 'source': 'winter', 'dest': 'spring'},
            {'trigger': 'transition_to_insufficient_food', 'source': 'autumn', 'dest': 'insufficient_food'},
            {'trigger': 'transition_to_khans_pillaged', 'source': 'autumn', 'dest': 'khans_pillaged'},
            {'trigger': 'transition_to_lords_killed', 'source': 'winter', 'dest': 'lords_killed'},
            {'trigger': 'end_game', 'source': '*', 'dest': 'end_game'}
        ]

        self.machine = Machine(model=self, states=self.states, transitions=self.transitions, initial='waiting')

    def start(self) :
        if len(self.players) < 6 :
            return
        for player in self.players :
            if player[1] is None :
                return

        self.state = 'instructions'

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