from flask import Flask, request
from flask_cors import CORS
from flask_apscheduler import APScheduler
from database import *
from lobby import *

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SCHEDULER_API_ENABLED'] = True

cors = CORS(app)

scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

# Event handler for the home page
@app.route('/')
def home():
    return 'Hello, World!'

@app.route('/check-session', methods=['POST'])
def check_session():
    data = request.json
    new_session = False

    if data['session'] == '' :
        new_session = True

    if new_session :
        data['session'] = str(random.randint(0, 999999999)).rjust(9, '0')
        # Create database entry
        db.update_session(data['session'])
    return data

# Event handler for form submission
@app.route('/create_lobby', methods=['POST'])
def submit():
    data = request.json
    new_session = False

    if data['session'] == '' :
        new_session = True

    if new_session :
        data['session'] = str(random.randint(0, 999999999)).rjust(9, '0')
        # Create database entry
        db.update_session(data['session'])
    return data

# Routinely clear sessions whose last_active is older than 30 minutes.
@scheduler.task('interval', id='clear_sessions', seconds=10)
def clear_sessions():
    db.clear_sessions(10)

if __name__ == '__main__':
    random.seed = time.time()
    db = khanfused_db()

    app.run(debug=True)