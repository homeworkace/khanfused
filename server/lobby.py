import random
import string

class lobby :
    def __init__(self, password='') :
        self.state = 'waiting'
        self.password = password
        self.players = []
        self.readies = []

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
    print(result)
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