from flask import Flask, render_template_string, request

app = Flask(__name__)

users = ["HonoreAde", "Ada"]

@app.route("/")
def index():
    return render_template_string("""
        <h1>Users (Full Page Reload)</h1>
        <ul>
        {% for user in users %}
            <li>{{ user }}</li>
        {% endfor %}
        </ul>
        <form method="POST" action="/add">
            <input name="name">
            <button>Add User</button>
        </form>
    """, users=users)

@app.route("/add", methods=["POST"])
def add_user():
    name = request.form["name"]
    users.append(name)
    return index()

if __name__ == "__main__":
    app.run(debug=True)
