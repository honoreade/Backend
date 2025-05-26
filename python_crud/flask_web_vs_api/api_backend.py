from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend access

users = ["HonoreAde", "Ada"]

@app.route("/api/users", methods=["GET"])
def get_users():
    return jsonify(users)

@app.route("/api/users", methods=["POST"])
def add_user():
    data = request.get_json()
    users.append(data["name"])
    return jsonify({"status": "success"})

if __name__ == "__main__":
    app.run(port=5001, debug=True)
