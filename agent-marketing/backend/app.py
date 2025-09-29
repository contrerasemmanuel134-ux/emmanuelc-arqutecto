
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify, request
from flask_cors import CORS
import agent
import website_api
from firebase_client import get_db, delete_document

# Initialize Flask App and CORS
app = Flask(__name__)
CORS(app)

# Initialize Firebase
get_db()

@app.route("/", methods=["GET"])
def index():
    """A simple endpoint to confirm the API is running."""
    return jsonify({"message": "Web Admin Agent API is running."}), 200

@app.route("/blogs", methods=["GET"])
def get_blogs():
    """Endpoint to get the list of blog posts."""
    posts = website_api.get_blog_posts()
    if posts is not None:
        return jsonify(posts), 200
    return jsonify({"error": "Could not retrieve blog posts."}), 500

@app.route("/projects", methods=["GET"])
def get_projects_route():
    """Endpoint to get the list of projects."""
    projects = website_api.get_projects()
    if projects is not None:
        return jsonify(projects), 200
    return jsonify({"error": "Could not retrieve projects."}), 500

@app.route("/projects", methods=["POST"])
def create_project_route():
    """Endpoint to create a new project."""
    data = request.get_json()
    if not data or not all(k in data for k in ["title", "challenge", "solution", "result"]):
        return jsonify({"error": "Missing required fields: title, challenge, solution, result"}), 400
    
    if agent._create_project(data["title"], data["challenge"], data["solution"], data["result"]):
        return jsonify({"message": "Project draft created successfully."}), 201
    else:
        return jsonify({"error": "Failed to create project draft."}), 500

@app.route("/blogs/<string:title>", methods=["DELETE"])
def delete_blog_route(title):
    """Endpoint to delete a blog post by its title."""
    if not title:
        return jsonify({"error": "Please provide a title to delete."}), 400
    
    if delete_document("blogPost", title):
        return jsonify({"message": f"Successfully deleted blog post: '{title}'"}), 200
    else:
        return jsonify({"error": f"Could not find or delete blog post: '{title}'"}), 404

@app.route("/strategy/run", methods=["POST"])
def run_strategy_route():
    """Endpoint to trigger the marketing strategy cycle."""
    try:
        # This can be a long-running task. 
        # For a real-world scenario, this should be handled by a background worker (e.g., Celery).
        agent.run_strategy_cycle()
        return jsonify({"message": "Strategy cycle finished successfully."}), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred during the strategy cycle: {e}"}), 500

@app.route("/client-request", methods=["POST"])
def handle_client_request_route():
    """Endpoint to handle new project requests from the client assistant."""
    data = request.get_json()
    if not data or "description" not in data:
        return jsonify({"error": "Missing required field: description"}), 400
    
    if agent.handle_client_request(data["description"]):
        return jsonify({"message": "Client request handled successfully."}), 200
    else:
        return jsonify({"error": "Failed to handle client request."}), 500

@app.route("/api/chatConAgente", methods=["POST", "OPTIONS"])
def handle_chat_agent_route():
    """Endpoint to handle a chat message from the chatbot UI."""
    try:
        if request.method == "OPTIONS":
            return jsonify(success=True), 200

        data = request.get_json()
        if not data or "history" not in data:
            return jsonify({"error": "Missing required field: history"}), 400
        
        history = data["history"]
        
        # Call the agent function to get a response based on the history
        ai_response = agent.handle_chat_message(history)
        
        if "Lo siento, no pude procesar tu mensaje" in ai_response:
            return jsonify({"error": "AI agent failed to process the message.", "details": ai_response}), 500

        return jsonify({"response": ai_response}), 200
    except Exception as e:
        # Log the exception for debugging
        print(f"An exception occurred in handle_chat_agent_route: {e}")
        # Return a generic but structured error
        return jsonify({"error": "An internal server error occurred.", "details": str(e)}), 500

if __name__ == "__main__":
    # Runs the Flask app on port 8081, accessible from any network interface.
    app.run(host="0.0.0.0", port=8081, debug=True)
