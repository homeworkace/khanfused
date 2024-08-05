from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# Event handler for the home page
@app.route('/')
def home():
    return 'Hello, World!'

@app.route('/check-session', methods=['POST'])
def check_session():
    data = request.json
    print(data)
    return data, 200

# Event handler for a specific URL path
@app.route('/greet/<name>')
def greet(name):
    return f'Hello, {name}!'

# Event handler for form submission
@app.route('/submit', methods=['POST'])
def submit():
    data = request.form
    return f'Received data: {data}'

if __name__ == '__main__':
    app.run(debug=True)