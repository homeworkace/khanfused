import random
import string
from transitions import Machine

class lobby :
    def __init__(self, password='') :
        self.state = 'waiting'
        self.password = password
        self.players = []

        # Define states and transitions
        self.states = ['waiting', 'instructions', 'spring', 'summer', 'autumn', 'winter', 
                       'insufficient_food', 'khans_pillaged', 'lords_killed', 'end_game']

        self.transitions = [
            {'trigger': 'start_instructions', 'source': 'waiting', 'dest': 'instructions'},
            {'trigger': 'start_spring', 'source': 'instructions', 'dest': 'spring'},
            {'trigger': 'start_summer', 'source': 'spring', 'dest': 'summer'},
            {'trigger': 'start_autumn', 'source': 'summer', 'dest': 'autumn'},
            {'trigger': 'start_winter', 'source': 'autumn', 'dest': 'winter'},
            {'trigger': 'restart_spring', 'source': 'winter', 'dest': 'spring'},
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

        self.start_instructions()


    def transition_season(self):
        """Handle all season transitions with specific conditions for each season."""
        if self.state == 'waiting' and self._can_start_instructions():
            self.start_instructions()
            print("Transitioned to Instructions.")

        elif self.state == 'instructions' and self._can_start_spring():
            self.start_spring()
            print("Transitioned to Spring.")

        elif self.state == 'spring' and self._can_start_summer():
            self.start_summer()
            print("Transitioned to Summer.")

        elif self.state == 'summer' and self._can_start_autumn():
            self.start_autumn()
            print("Transitioned to Autumn.")

        elif self.state == 'autumn' and self._can_start_winter():
            self.start_winter()
            print("Transitioned to Winter.")
        
        elif self.state == 'winter' and self._can_start_spring():
            self.restart_spring()
            print("Transitioned to Spring.")

        else:
            print("Cannot transition season from current state.")

    def _can_start_instructions(self):
        # Example condition to start instructions; modify based on your game logic
        return True

    def _can_start_spring(self):
        # Example condition to start spring; modify based on your game logic
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