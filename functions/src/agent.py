import json
import re
import datetime
from memory import Memory
from website_api import get_blog_posts, get_projects
from generative_ai import get_intent, generate_text, generate_blog_title, generate_blog_content

from firebase_admin import firestore
from storage_api import list_images, get_image_url
from marketing_api import get_search_console_data

def find_best_image_for_title(title, image_list):
    """
    Finds the best image in a list based on keywords from a title.
    """
    if not title or not image_list:
        return None

    title_keywords = set(re.split(r'\s|[-_]', title.lower()))
    
    best_match = None
    max_score = 0

    for image_name in image_list:
        normalized_image_name = image_name.lower().replace('-', ' ').replace('_', ' ')
        image_keywords = set(re.split(r'\s', normalized_image_name))
        
        base_keywords = set()
        for keyword in image_keywords:
            base_keywords.add(keyword.split('.')[0])

        score = len(title_keywords.intersection(base_keywords))

        if score > max_score:
            max_score = score
            best_match = image_name
            
    return best_match

def _create_blog_post(title, content):
    """
    Internal function to create a blog post, find a relevant image, and save to Firestore.
    """
    print(f"Attempting to create blog post with title: '{title}'")
    # --- Image Integration Logic ---
    print("Searching for a relevant image in Firebase Storage...")
    available_images = list_images()
    if isinstance(available_images, dict) and 'error' in available_images:
        print(f"Warning: Could not list images - {available_images['error']}")
    else:
        best_image = find_best_image_for_title(title, available_images)
        if best_image:
            print(f"Found relevant image: {best_image}")
            image_url = get_image_url(best_image)
            if isinstance(image_url, str):
                content = f"![{title}]({image_url})\n\n{content}"
                print("Successfully added image to blog post.")
            else:
                print(f"Warning: Could not get image URL - {image_url['error']}")
        else:
            print("No relevant image found for this title.")
    # --- End of Image Integration ---

    new_blog_data = {
        "title": title,
        "content": content,
        "status": "pendiente",
        "createdAt": firestore.SERVER_TIMESTAMP
    }
    if add_document("blogPost", new_blog_data):
        print(f"Successfully created blog post draft: '{title}'")
        return True
    else:
        print(f"Failed to create blog post draft: '{title}'")
        return False

def run_health_check():
    """
    Checks the health of critical services (Firebase, Website).
    """
    print("--- Running Health Check ---")
    healthy = True

    # 1. Check Firebase Connection
    print("Checking Firebase connection...")
    db = get_db()
    if db is None:
        print("CRITICAL: Firebase connection failed.")
        healthy = False
    else:
        print("Firebase connection is OK.")

    # 2. Check Website Availability
    print("Checking website availability...")
    # We can use the existing get_blog_posts function for this.
    # If it returns a list (even empty), the API is reachable.
    posts = get_blog_posts()
    if posts is None:
        print("CRITICAL: Website API is not reachable.")
        healthy = False
    else:
        print("Website API is OK.")
        
    if healthy:
        print("--- Health Check Passed ---")
    else:
        print("--- Health Check Failed ---")
        
    return healthy

def run_strategy_cycle():
    """
    Runs one cycle of the marketing strategy.
    """
    print("--- Running Marketing Strategy Cycle ---")
    
    # 1. Fetch Data from Search Console
    print("Fetching data from Google Search Console for the last 30 days...")
    today = datetime.date.today()
    thirty_days_ago = today - datetime.timedelta(days=30)
    site_url = 'sc-domain:emmanuel-contreras.com'
    
    sc_data = get_search_console_data(site_url, thirty_days_ago.strftime('%Y-%m-%d'), today.strftime('%Y-%m-%d'))
    
    if isinstance(sc_data, dict) and 'error' in sc_data:
        print(f"CRITICAL: Could not get Search Console data. {sc_data['error']}")
        return

    if not sc_data:
        print("No Search Console data found for the period. Nothing to do.")
        return

    # 2. Analyze Data to Find Opportunity
    # Strategy: Find the query with the highest impressions.
    best_opportunity = max(sc_data, key=lambda row: row['impressions'])
    top_query = best_opportunity['keys'][0]
    print(f"Identified top opportunity: The query '{top_query}' has the most impressions.")

    # 3. Check if a blog for this topic already exists
    print("Checking if a blog post for this topic already exists...")
    existing_blogs = get_blog_posts()
    topic_exists = False
    for blog in existing_blogs:
        if top_query.lower() in blog.get('title', '').lower():
            print(f"A blog post related to '{top_query}' already exists: '{blog.get('title')}'. Strategy cycle complete.")
            topic_exists = True
            break
    
    if topic_exists:
        return

    # 4. Generate Content Idea & Draft
    print(f"No existing blog found. Generating a new blog post for the topic: '{top_query}'")
    
    # Generate a more engaging title
    blog_title = generate_blog_title(top_query)
    if not blog_title or "Failed to configure" in blog_title or "error occurred" in blog_title:
        print(f"CRITICAL: Could not generate blog title. Reason: {blog_title}")
        return
    blog_title = blog_title.strip().replace('""', '') # Clean up title

    # Generate the blog content
    blog_content = generate_blog_content(blog_title, top_query)
    if not blog_content or "Failed to configure" in blog_content or "error occurred" in blog_content:
        print(f"CRITICAL: Could not generate blog content. Reason: {blog_content}")
        return

    # 5. Create the Blog Post Draft
    _create_blog_post(blog_title, blog_content)
    
    print("--- Marketing Strategy Cycle Complete ---")

def _create_project(title, challenge, solution, result):
    """
    Internal function to create a project, find a relevant image, and save to Firestore.
    """
    print(f"Attempting to create project with title: '{title}'")
    
    # --- Image Integration Logic ---
    print("Searching for a relevant image in Firebase Storage...")
    available_images = list_images()
    image_url = None
    if isinstance(available_images, dict) and 'error' in available_images:
        print(f"Warning: Could not list images - {available_images['error']}")
    else:
        best_image = find_best_image_for_title(title, available_images)
        if best_image:
            print(f"Found relevant image: {best_image}")
            retrieved_url = get_image_url(best_image)
            if isinstance(retrieved_url, str):
                image_url = retrieved_url
                print("Successfully got image URL.")
            else:
                print(f"Warning: Could not get image URL - {retrieved_url['error']}")
        else:
            print("No relevant image found for this title.")
    # --- End of Image Integration ---

    new_project_data = {
        "title": title,
        "challenge": challenge,
        "solution": solution,
        "result": result,
        "imageUrl": image_url,
        "status": "pendiente",
        "createdAt": firestore.SERVER_TIMESTAMP
    }
    
    # Note the collection name is "proyectos" as requested
    if add_document("proyectos", new_project_data):
        print(f"Successfully created project draft: '{title}'")
        return True
    else:
        print(f"Failed to create project draft: '{title}'")
        return False

def publish_blog(title):
    """Finds a blog by title and updates its status to 'publicado'."""
    print(f"Attempting to publish blog post: '{title}'...")
    if update_document("blogPost", title, {"status": "publicado"}):
        return f"Successfully published blog post: '{title}'"
    else:
        return f"Could not find or publish blog post: '{title}'"

def handle_client_request(description):
    """
    Handles a new project request from a client.
    - Analyzes the description using AI.
    - Saves the structured data to Firestore.
    - Updates the client-facing assistant status.
    """
    print(f"Handling new client request: '{description[:50]}...'")
    update_assistant_status("procesando", "He recibido tu solicitud. Estoy analizándola para extraer los detalles clave...")

    # 1. Use Generative AI to structure the data
    prompt = f"""Un cliente ha descrito un proyecto. Analiza el siguiente texto y extráelo en un formato JSON con las siguientes claves: 'title', 'objective', 'key_features', 'platform' (e.g., Web, Mobile, etc.), 'timeline'.

    Descripción del cliente: "{description}"

    Responde únicamente con el objeto JSON."""
    
    structured_data_str = generate_text(prompt)
    
    try:
        # Clean up the string and parse JSON
        # The model might return the JSON string within ```json ... ``` block
        if '```json' in structured_data_str:
            structured_data_str = structured_data_str.split('```json')[1].split('```')[0]
        structured_data = json.loads(structured_data_str)
        
        print("Successfully structured client request.")
        update_assistant_status("guardando", "He estructurado la información. Guardando los detalles de tu proyecto...")

    except (json.JSONDecodeError, IndexError) as e:
        print(f"Error: Could not parse AI response into JSON. Response was: {structured_data_str}")
        update_assistant_status("error", "No pude entender completamente la descripción. ¿Podrías intentar describirlo de otra manera?")
        # Save the raw description as a fallback
        structured_data = {"raw_description": description, "error": "Failed to parse AI response"}

    # 2. Save to Firestore
    if add_document("solicitudes_clientes", structured_data):
        print("Successfully saved client request to Firestore.")
        update_assistant_status("finalizado", "¡Perfecto! He guardado la información de tu proyecto. Lo revisaré y me pondré en contacto contigo pronto.")
        return True
    else:
        print("Failed to save client request to Firestore.")
        update_assistant_status("error", "Lo siento, ocurrió un error al guardar tu solicitud. Por favor, inténtalo de nuevo.")
        return False

def handle_chat_message(history):
    """
    Handles a chat conversation history by generating a response with AI.
    """
    if not history:
        return "Lo siento, no he recibido ningún mensaje."

    # Get the last user message for logging and validation
    try:
        last_text = history[-1].get('parts', [{}])[0].get('text', '')
        if not isinstance(last_text, str):
             last_text = "" # Ensure it's a string
        print(f"Handling chat history. Last message: '{last_text[:50]}...'" )
    except (IndexError, AttributeError):
        print(f"Warning: Could not parse last message from history: {history}")
        # If we can't parse the last message, we probably can't continue.
        return "Lo siento, he recibido un mensaje en un formato inesperado."

    # This is a simple way to format the history for the prompt.
    formatted_history = ""
    for message in history:
        try:
            role = message.get('role', 'user')
            # Safely extract the text part of the message
            text = message.get('parts', [{}])[0].get('text', '')
            if not isinstance(text, str):
                text = "" # or skip this part of history
            formatted_history += f"{role}: {text}\n"
        except (IndexError, AttributeError):
            # Skip malformed history entries
            continue

    # Create a prompt for the generative AI that includes the history
    prompt = f"""You are a helpful assistant. Continue the following conversation. Respond directly and concisely.

    Conversation History:
    {formatted_history}
    model:"""
    
    # Generate a response
    ai_response = generate_text(prompt)
    
    if not ai_response or "error occurred" in ai_response:
        print(f"Error generating AI response. Raw response: {ai_response}")
        # Add info about API key
        if "API key not valid" in str(ai_response) or "GOOGLE_API_KEY" in str(ai_response):
             return "Lo siento, hay un problema con la configuración de la API de IA. Por favor, verifica la GOOGLE_API_KEY."
        return "Lo siento, no pude procesar tu mensaje en este momento."
        
    print("Successfully generated AI response.")
    return ai_response.strip()

tools_description = """
- `list_blogs`: Lists all blog posts.
- `list_projects`: Lists all successful projects.
- `list_images`: Lists all available images in storage.
- `delete_blog`: Deletes a blog post. Requires `title`.
- `publish_blog`: Publishes a blog post. Requires `title`.
- `run_strategy`: Runs the autonomous marketing strategy cycle.
- `create_project`: Creates a new success case project. Requires `title`, `challenge`, `solution`, `result`.
- `update_content`: Updates a text field in a document. Requires `collection`, `doc_title`, `field`, `new_text`.
- `update_image`: Updates the image of a document. Requires `collection`, `doc_title`, `new_image_name`.
"""

def update_content(collection, doc_title, field, new_text):
    """Updates a text field in a specified document."""
    print(f"Attempting to update field '{field}' in document '{doc_title}' in collection '{collection}'...")
    if update_document(collection, doc_title, {field: new_text}):
        return f"Successfully updated document."
    else:
        return f"Could not find or update document."

def update_image(collection, doc_title, new_image_name):
    """Updates the imageUrl field of a specified document."""
    print(f"Attempting to update image for document '{doc_title}' in collection '{collection}'...")
    
    # First, get the URL for the new image
    image_url = get_image_url(new_image_name)
    if isinstance(image_url, dict) and 'error' in image_url:
        return f"Error: Could not get URL for image '{new_image_name}'. Make sure it exists in storage. Details: {image_url['error']}"

    # Then, update the document
    if update_document(collection, doc_title, {"imageUrl": image_url}):
        return f"Successfully updated image."
    else:
        return f"Could not find or update document."

def list_images_func():
    """Lists all available images."""
    images = list_images()
    if isinstance(images, dict) and 'error' in images:
        return f"Error: {images['error']}"
    if not images:
        return "No images found in storage."
    
    response = "Available Images:\n"
    for img in images:
        response += f"- {img}\n"
    return response

def main():
    """
    Main entry point for the agent with Natural Language Understanding.
    """
    memory = Memory()
    if get_db() is None:
        print("CRITICAL: Failed to connect to Firebase. Exiting.")
        return

    print("Web Admin Agent (NLI): Hello! How can I help you today?")

    while True:
        user_input = input("> ")
        if user_input.lower() in ["exit", "quit"]:
            print("Web Admin Agent: Goodbye!")
            break

        memory.add_message("user", user_input)

        # Get intent from user input
        intent_json_str = get_intent(user_input, tools_description)
        
        try:
            # The model might return the JSON string within ```json ... ``` block
            if '```json' in intent_json_str:
                intent_json_str = intent_json_str.split('```json')[1].split('```')[0]
            intent = json.loads(intent_json_str)
        except (json.JSONDecodeError, IndexError) as e:
            print(f"Error parsing intent from AI response: {e}")
            print(f"Raw response was: {intent_json_str}")
            response = "I had trouble understanding that. Could you please rephrase?"
            print(response)
            memory.add_message("agent", response)
            continue

        tool = intent.get("tool", "unknown")
        params = intent.get("params", {})
        response = ""

        # --- Tool Dispatcher ---
        if tool == "list_blogs":
            posts = get_blog_posts()
            if posts:
                response = "Blog Posts:\n"
                for post in posts:
                    status = post.get("status", "N/A")
                    response += f"- {post.get('title', 'No Title')} (Status: {status})\n"
            else:
                response = "I couldn't find any blog posts."

        elif tool == "list_projects":
            projects = get_projects()
            if projects:
                response = "Projects:\n"
                for project in projects:
                    status = project.get("status", "N/A")
                    response += f"- {project.get('title', 'No Title')} (Status: {status})\n"
            else:
                response = "I couldn't find any projects."
        
        elif tool == "list_images":
            response = list_images_func()

        elif tool == "delete_blog":
            title = params.get("title")
            if not title:
                response = "I need a title to delete a blog post."
            else:
                if delete_document("blogPost", title):
                    response = f"Successfully deleted blog post: '{title}'"
                else:
                    response = f"Could not find or delete blog post: '{title}'"

        elif tool == "publish_blog":
            title = params.get("title")
            if not title:
                response = "I need a title to publish a blog post."
            else:
                response = publish_blog(title)

        elif tool == "run_strategy":
            run_strategy_cycle()
            response = "Strategy cycle finished."

        elif tool == "create_project":
            # This one is interactive, so we handle it differently
            print("--- Creating New Project (Success Case) ---")
            title = input("Project Title: ")
            challenge = input("Challenge: ")
            solution = input("Solution: ")
            result = input("Result: ")
            if _create_project(title, challenge, solution, result):
                response = "Project draft created successfully."
            else:
                response = "Failed to create project draft."

        elif tool == "update_content":
            collection = params.get("collection")
            doc_title = params.get("doc_title")
            field = params.get("field")
            new_text = params.get("new_text")
            if not all([collection, doc_title, field, new_text]):
                response = "To update content, I need a collection, a document title, a field, and the new text."
            else:
                response = update_content(collection, doc_title, field, new_text)

        elif tool == "update_image":
            collection = params.get("collection")
            doc_title = params.get("doc_title")
            new_image_name = params.get("new_image_name")
            if not all([collection, doc_title, new_image_name]):
                response = "To update an image, I need a collection, a document title, and a new image name."
            else:
                response = update_image(collection, doc_title, new_image_name)

        else: # tool == "unknown"
            response = "I'm not sure how to help with that. Please try rephrasing. You can ask me to do things like 'list all blogs', 'publish the blog named \"My Title\"', or 'update the description for the 'Visión' card in the filosofia collection'."

        print(response)
        memory.add_message("agent", response)


# if __name__ == "__main__":
#     main()
