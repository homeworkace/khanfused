import random
import string

class lobby :
    def __init__(self, password='') :
        self.state = 'waiting'
        self.password = password
        self.players = []
        self.ready = []

    def minified(self) :
        result = {}
        result['state'] = self.state
        result['password'] = self.password
        result['players'] = self.players
        result['ready'] = self.ready
        return result

    def unminified(lobby_to_copy) :
        result = lobby()
        result.state = lobby_to_copy['state']
        result.password = lobby_to_copy['password']
        result.players = lobby_to_copy['players']
        result.ready = lobby_to_copy['ready']
        return result

    def start(self) :
        if len(self.players) < 6 :
            return
        for player in self.players :
            if player[1] is None :
                return

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