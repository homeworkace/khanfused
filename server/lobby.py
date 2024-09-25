from datetime import datetime, timedelta
import math
import random
import string
from collections import Counter
from flask_socketio import emit
from flask_apscheduler import APScheduler

states = ['waiting', 'role_assignment', 'spring', 'summer', 'summer_result', 'autumn', 'banish_result', 'winter', 'pillage_result', 'food_end', 'no_lords_end', 'no_khans_end']

class lobby :
    def __init__(self, scheduler, socket, password='') :
        self.lobby_code = ''
        self.state = 'waiting'
        self.password = password
        self.players = []
        self.ready = []
        self.roles = [] # 0 if king, 1 if lord, 2 if khan
        self.perspectives = []
        self.result_packets = []
        self.status = [] # 0 if active, 1 if pillaged, 2 if banished, 3 if double harvest
        self.choices = [] # spring: the king's choice of lord to double harvest, summer: the lords choices, autumn: the king's choice of lord to banish, winter: the khans' choices of lord to pillage
        self.grain = 0
        self.socket = socket
        self.timer = scheduler
        self.next_job = None

    def minified(self, dump = False) :
        result = {}
        result['lobby_code'] = self.lobby_code
        result['state'] = self.state
        result['password'] = self.password
        result['players'] = self.players
        result['ready'] = self.ready
        result['roles'] = self.roles
        result['perspectives'] = self.perspectives
        result['result_packets'] = self.result_packets
        result['status'] = self.status
        result['choices'] = self.choices
        result['grain'] = self.grain
        if dump :
            if not self.next_job is None and not self.timer.get_job(self.next_job.id) is None :
                result['next_job_id'] = self.next_job.id[:-5]
                result['next_job_time'] = self.next_job.next_run_time.timestamp() - datetime.now().timestamp()
                self.next_job.remove()
        return result

    def unminified(lobby_to_copy, scheduler, socket) :
        result = lobby(scheduler, socket)
        result.lobby_code = lobby_to_copy['lobby_code']
        result.state = lobby_to_copy['state']
        result.password = lobby_to_copy['password']
        result.players = lobby_to_copy['players']
        result.ready = lobby_to_copy['ready']
        result.roles = lobby_to_copy['roles']
        result.perspectives = lobby_to_copy['perspectives']
        result.result_packets = lobby_to_copy['result_packets']
        result.status = lobby_to_copy['status']
        result.choices = lobby_to_copy['choices']
        result.grain = lobby_to_copy['grain']
        if 'next_job_id' in lobby_to_copy :
            next_job = None
            if lobby_to_copy['next_job_id'] == 'spring_start' :
                next_job = result.spring_start
            elif lobby_to_copy['next_job_id'] == 'summer_start' :
                next_job = result.summer_start
            elif lobby_to_copy['next_job_id'] == 'summer_result_start' :
                next_job = result.summer_result_start
            elif lobby_to_copy['next_job_id'] == 'autumn_start' :
                next_job = result.autumn_start
            elif lobby_to_copy['next_job_id'] == 'banish_result_start' :
                next_job = result.banish_result_start
            elif lobby_to_copy['next_job_id'] == 'winter_start' :
                next_job = result.winter_start
            elif lobby_to_copy['next_job_id'] == 'pillage_result_start' :
                next_job = result.pillage_result_start
            elif lobby_to_copy['next_job_id'] == 'food_end_start' :
                next_job = result.food_end_start
            elif lobby_to_copy['next_job_id'] == 'no_lords_end_start' :
                next_job = result.no_lords_end_start
            elif lobby_to_copy['next_job_id'] == 'no_khans_end_start' :
                next_job = result.no_khans_end_start
            elif lobby_to_copy['next_job_id'] == 'waiting_start' :
                next_job = result.waiting_start
            result.next_job = result.timer.add_job(func = next_job, trigger = 'interval', start_date = datetime.now() + timedelta(seconds = lobby_to_copy['next_job_time']), id = lobby_to_copy['next_job_id'] + result.lobby_code)
        return result

    def join_lobby(self, session, name = None) :
        if self.state != 'waiting' :
            return False

        self.players.append([session, name])
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
    
    def start(self, session) :
        if self.state != 'waiting' :
            return "Game is in progress!"
        if self.players[0][0] != session :
            return "Not the host!"
        if len(self.players) < 1 : # Change to 6 when needed
            return "Not enough players!"
        if False in self.ready :
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

        self.next_job = self.timer.add_job(func = self.spring_start, trigger = 'interval', seconds = 5, id = 'spring_start' + self.lobby_code)
    
    def spring_start(self):
        self.state = 'spring'
        
        # Ready everyone who is banished and unready everyone else.
        self.ready = [True if player == 2 else False for player in self.status]

        # Set placeholder choice of lord to perform a double harvest.
        for i in range(len(self.roles)) :
            if self.roles[i] != 0 :
                continue
            eligible_choices = [j for j in range(len(self.roles)) if j != i and self.status[j] == 0]
            self.choices = [self.players[random.choice(eligible_choices)][0]]

        # Emit change in state.
        self.socket.emit('change_state', { 'state' : 'spring' }, room = self.lobby_code, namespace = '/')
        
        # Finally, set a callback for the next state.
        self.next_job.remove()
        self.next_job = self.timer.add_job(func = self.summer_start, trigger = 'interval', seconds = 60, id = 'summer_start' + self.lobby_code)

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
        scouting_lords = len(eligible_lords) - math.floor(len(self.players) / 2) + 2 # Subtract the minimum number of lords who need to farm to break even on grain, assuming the chosen lord isn't a khan.
        while scouting_lords > 0 :
            eligible_lords[scouting_lords - 1] = -2
            scouting_lords -= 1
        random.shuffle(eligible_lords)
        self.choices = [(None if self.choices[i] is None else eligible_lords.pop()) for i in range(len(self.choices))] # Put the choices back in place.

        # Of the scouting lords, pick an eligible candidate.
        for i in range(len(self.choices)) :
            if self.choices[i] != -2 :
                continue
            
            eligible_choices = [j for j in range(len(self.perspectives[i])) if self.perspectives[i][j] == -1] # Find the acceptable indices to select based on the roles they don't already know.
            if len(eligible_choices) < 1 : # If they already know who everyone is, get them to farm instead.
                self.choices[i] = -1
            else :
                self.choices[i] = self.players[random.choice(eligible_choices)][0] # Otherwise, assign the corresponding session ID of the randomly chosen index to their choice.

        # Unready everyone who is active and ready everyone else.
        self.ready = [False if player == 0 or player == 3 else True for player in self.status]

        # Emit change in state.
        for player in range(len(self.players)) :
            if self.status[player] == 3 :
                self.socket.emit('change_state', { 'state' : 'summer', 'double_harvest' : True }, room = str(self.players[player][0]), namespace = '/')
            else :
                self.socket.emit('change_state', { 'state' : 'summer' }, room = str(self.players[player][0]), namespace = '/')

        # Finally, set a callback for the next state.
        self.next_job.remove()
        self.next_job = self.timer.add_job(func = self.summer_result_start, trigger = 'interval', seconds = 30, id = 'summer_result_start' + self.lobby_code)

    def summer_result_start(self) :
        self.state = 'summer_result'

        # Perform grain calculation.
        added_grain = 0
        if 3 in self.status :
            added_grain = 2
            self.status = [status if status < 3 else 0 for status in self.status] # Reset double harvest status
        added_grain += len([i for i in self.choices if i == -1])
        self.grain += added_grain - math.floor(len(self.players) / 2)

        # Update results of scouting.
        for i in range(len(self.players)) :
            if self.choices[i] is None :
                continue
            if self.choices[i] == -1 :
                continue
            
            chosen_player = [player[0] for player in self.players].index(self.choices[i])
            self.perspectives[i][chosen_player] = self.roles[chosen_player]
            self.choices[i] = [self.players[chosen_player][0], self.roles[chosen_player] == 2]

        # Emit change in state.
        for player in range(len(self.players)) :
            summer_result_packet = {}
            summer_result_packet['state'] = 'summer_result'
            summer_result_packet['grain'] = added_grain
            if not self.choices[player] is None and self.choices[player] != -1 :
                summer_result_packet['result'] = self.choices[player]
            self.result_packets.append(summer_result_packet)
            self.socket.emit('change_state', summer_result_packet, room = str(self.players[player][0]), namespace = '/')
        
        # Finally, set a callback for the next state.
        self.next_job.remove()
        if self.grain < 0 :
            self.next_job = self.timer.add_job(func = self.food_end_start, trigger = 'interval', seconds = 5, id = 'food_end_start' + self.lobby_code)
        else :
            self.next_job = self.timer.add_job(func = self.autumn_start, trigger = 'interval', seconds = 5, id = 'autumn_start' + self.lobby_code)

    def autumn_start(self) :
        self.state = 'autumn'

        # Having come from summer_result, the result packets should be cleared.
        self.result_packets = []
        
        # Ready everyone who is banished and unready everyone else.
        self.ready = [True if player == 2 else False for player in self.status]

        # The placeholder choice is not to banish anyone.
        self.choices = [-1]

        # Emit change in state.
        self.socket.emit('change_state', { 'state' : 'autumn' }, room = self.lobby_code, namespace = '/')
        
        # Finally, set a callback for the next state.
        self.next_job.remove()
        self.next_job = self.timer.add_job(func = self.banish_result_start, trigger = 'interval', seconds = 60, id = 'banish_result_start' + self.lobby_code)

    def banish_result_start(self) :
        self.state = 'banish_result'
        self.next_job.remove()
        
        # The king's choice is reflected in the status of the chosen player.
        if self.choices[0] != -1 :
            for player in range(len(self.players)) :
                if self.players[player][0] != self.choices[0] :
                    continue
                if self.status[player] == 0 :
                    self.status[player] = 2
                break

        # Set the next screen to show based on whether there are any active players of that role left.
        remaining_lords = [self.status[player] for player in range(len(self.roles)) if self.roles[player] == 1]
        remaining_khans = [self.status[player] for player in range(len(self.roles)) if self.roles[player] == 2]
        if not 0 in remaining_lords :
            self.next_job = self.timer.add_job(func = self.no_lords_end_start, trigger = 'interval', seconds = 5, id = 'no_lords_end_start' + self.lobby_code)
        elif not 0 in remaining_khans :
            self.next_job = self.timer.add_job(func = self.no_khans_end_start, trigger = 'interval', seconds = 5, id = 'no_khans_end_start' + self.lobby_code)
        else :
            self.next_job = self.timer.add_job(func = self.winter_start, trigger = 'interval', seconds = 5, id = 'winter_start' + self.lobby_code)

        # Finally, emit change in state.
        self.socket.emit('change_state', { 'state' : 'banish_result', 'banished' : self.choices[0] }, room = self.lobby_code, namespace = '/')

    def winter_start(self) :
        self.state = 'winter'
        
        # Reset the list of choices so that it represents the khans' decisions.
        self.choices = [(-2 if self.status[player] == 0 and self.roles[player] == 2 else None) for player in range(len(self.status))]

        # Unready everyone who is active and ready everyone else.
        self.ready = [False if player == 0 else True for player in self.status]

        # Emit change in state.
        self.socket.emit('change_state', { 'state' : 'winter' }, room = self.lobby_code, namespace = '/')
        
        # Finally, set a callback for the next state.
        self.next_job.remove()
        self.next_job = self.timer.add_job(func = self.pillage_result_start, trigger = 'interval', seconds = 30, id = 'pillage_result_start' + self.lobby_code)

    def pillage_result_start(self) :
        self.state = 'pillage_result'
        self.next_job.remove()

        # Determine the consensus based on votes.
        result = -1 # Set the result to the default option: not to pillage.
        unique_votes = Counter([vote for vote in self.choices if not vote is None and not vote == -2]) # Gather the unique values of the list of votes, and drop ineligible players and abstentions.
        if len(unique_votes) > 0 : # If there are still values left, gather the number of votes for each unique value.
            best_vote_count = unique_votes.most_common(1)[0][1]
            best_votes = [vote for vote, count in unique_votes.items() if count == best_vote_count] # Isolate the choice(s) with the most votes.
            result = random.choice(best_votes) # The result is a random tiebreaker between the choice(s).
            
        # The consensus is reflected in the status of the chosen player.
        if result != -1 :
            for player in range(len(self.players)) :
                if self.players[player][0] != result :
                    continue
                if self.status[player] == 0 :
                    self.status[player] = 1
                break

        # Emit change in state.
        self.socket.emit('change_state', { 'state' : 'pillage_result', 'pillaged' : result }, room = self.lobby_code, namespace = '/')
        
        # Set the next screen to show based on whether there are any active players of that role left.
        remaining_lords = [self.status[player] for player in range(len(self.roles)) if self.roles[player] == 1]
        if not 0 in remaining_lords :
            self.next_job = self.timer.add_job(func = self.no_lords_end_start, trigger = 'interval', seconds = 5, id = 'no_lords_end_start' + self.lobby_code)
        else :
            self.next_job = self.timer.add_job(func = self.spring_start, trigger = 'interval', seconds = 5, id = 'spring_start' + self.lobby_code)

    def food_end_start(self) :
        self.state = 'food_end'

        # Having come from summer_result, the result packets should be cleared.
        self.result_packets = []

        # Emit change in state.
        self.socket.emit('change_state', { 'state' : 'food_end' }, room = self.lobby_code, namespace = '/')
        
        # Finally, set a callback for the next state.
        self.next_job.remove()
        self.next_job = self.timer.add_job(func = self.waiting_start, trigger = 'interval', seconds = 5, id = 'waiting_start' + self.lobby_code)

    def no_lords_end_start(self) :
        self.state = 'no_lords_end'

        # Emit change in state.
        self.socket.emit('change_state', { 'state' : 'no_lords_end' }, room = self.lobby_code, namespace = '/')
        
        # Finally, set a callback for the next state.
        self.next_job.remove()
        self.next_job = self.timer.add_job(func = self.waiting_start, trigger = 'interval', seconds = 5, id = 'waiting_start' + self.lobby_code)

    def no_khans_end_start(self) :
        self.state = 'no_khans_end'

        # Emit change in state.
        self.socket.emit('change_state', { 'state' : 'no_khans_end' }, room = self.lobby_code, namespace = '/')
        
        # Finally, set a callback for the next state.
        self.next_job.remove()
        self.next_job = self.timer.add_job(func = self.waiting_start, trigger = 'interval', seconds = 5, id = 'waiting_start' + self.lobby_code)

    def waiting_start(self) :
        self.state = 'waiting'
        self.ready = [True] * len(self.players)
        self.roles = []
        self.perspectives = []
        self.status = []
        self.choices = []
        self.grain = 0

        # Emit change in state.
        self.socket.emit('change_state', { 'state' : 'waiting' }, room = self.lobby_code, namespace = '/')
        
        self.next_job.remove()
        
    def handle_ready(self, data) :
        if not 'state' in data :
            return
        if data['state'] != self.state :
            return
        if self.state == 'spring' :
            # Ready the player in question.
            player_index = [player[0] for player in self.players].index(int(data['session']))
            self.ready[player_index] = True
            
            # The king has a decision to make.
            if self.roles[player_index] == 0 :
                self.choices[0] = data['double_harvest']
                
            # Emit to everyone except the sender.
            for player in [i for i in range(len(self.players)) if i != player_index] :
                self.socket.emit('ready', { 'session' : self.players[player_index][0] }, room = str(self.players[player][0]), namespace = '/')
                
            # If all players are ready, skip the timer.
            if not False in self.ready :
                self.summer_start()
            
        elif self.state == 'summer' :
            # Ready the player in question.
            player_index = [player[0] for player in self.players].index(int(data['session']))
            self.ready[player_index] = True
            
            # The lord has a decision to make.
            if self.roles[player_index] == 1 and self.status[player_index] == 0 :
                self.choices[player_index] = data['choice'] # -1 if farming
            
            # If all players are ready, skip the timer.
            print(self.ready)
            if not False in self.ready :
                self.summer_result_start()

        elif self.state == 'autumn' :
            # Ready the player in question.
            player_index = [player[0] for player in self.players].index(int(data['session']))
            self.ready[player_index] = True
            
            # The king has a decision to make.
            if self.roles[player_index] == 0 :
                self.choices[0] = data['banish']
                
            # Emit to everyone except the sender.
            for player in [i for i in range(len(self.players)) if i != player_index] :
                self.socket.emit('ready', { 'session' : self.players[player_index][0] }, room = str(self.players[player][0]), namespace = '/')
                
            # If all players are ready, skip the timer.
            if not False in self.ready :
                self.banish_result_start()

        elif self.state == 'winter' :
            # Ready the player in question.
            player_index = [player[0] for player in self.players].index(int(data['session']))
            self.ready[player_index] = True

            # If this is a khan, emit to other khans.
            if self.roles[player_index] == 2 :
                for player in [i for i in range(len(self.roles)) if self.roles[i] == 2 and i != player_index] :
                    self.socket.emit('ready', { 'session' : self.players[player_index][0] }, room = str(self.players[player][0]), namespace = '/')
                
            # If all players are ready, skip the timer.
            if not False in self.ready :
                self.pillage_result_start()
        
    def handle_unready(self, data) :
        if not 'state' in data :
            return
        if data['state'] != self.state :
            return
        if self.state == 'spring' :
            # Unready the player in question.
            player_index = [player[0] for player in self.players].index(int(data['session']))
            self.ready[player_index] = False
                
            # Emit to everyone except the sender.
            for player in [i for i in range(len(self.players)) if i != player_index] :
                self.socket.emit('ready', { 'session' : self.players[player_index][0] }, room = str(self.players[player][0]), namespace = '/')
            
        elif self.state == 'summer' :
            # Unready the player in question.
            player_index = [player[0] for player in self.players].index(int(data['session']))
            self.ready[player_index] = False

        elif self.state == 'autumn' :
            # Unready the player in question.
            player_index = [player[0] for player in self.players].index(int(data['session']))
            self.ready[player_index] = False
                
            # Emit to everyone except the sender.
            for player in [i for i in range(len(self.players)) if i != player_index] :
                self.socket.emit('ready', { 'session' : self.players[player_index][0] }, room = str(self.players[player][0]), namespace = '/')
            
        elif self.state == 'winter' :
            # Unready the player in question.
            player_index = [player[0] for player in self.players].index(int(data['session']))
            self.ready[player_index] = False

            # If this is a khan, emit to other khans.
            if self.roles[player_index] == 2 :
                for player in [i for i in range(len(self.roles)) if self.roles[i] == 2 and i != player_index] :
                    self.socket.emit('unready', { 'session' : self.players[player_index][0] }, room = str(self.players[player][0]), namespace = '/')
        
    def handle_select(self, data) :
        if not 'state' in data :
            return
        if data['state'] != self.state :
            return
        if self.state == 'winter' :
            # The khan has a decision to make.
            player_index = [player[0] for player in self.players].index(int(data['session']))
            self.choices[player_index] = data['pillage'] # -1 if not pillaging

            # If this is a khan, emit to other khans.
            if self.roles[player_index] == 2 :
                for player in [i for i in range(len(self.roles)) if self.roles[i] == 2 and i != player_index] :
                    self.socket.emit('select', { 'session' : self.players[player_index][0], 'choice' : self.choices[player_index] }, room = str(self.players[player][0]), namespace = '/')
                
            # If all players are ready, skip the timer.
            if not False in self.ready :
                self.pillage_result_start()

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