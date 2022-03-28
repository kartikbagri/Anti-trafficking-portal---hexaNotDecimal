# api for face matching algomrithm
from flask import Flask

app = Flask(__name__)

@app.route('/')
def index():
    
    return "hello"

if __name__ == "__main__":
    app.run(debug=1)