
import google.generativeai as genai
import json
import os

def configure_ai():
    """
    Configures the generative AI model with the API key from config.json.
    """
    try:
        # Build an absolute path to the config file
        config_path = os.path.join(os.path.dirname(__file__), 'config.json')
        with open(config_path, "r") as f:
            config = json.load(f)
            api_key = config.get("google_api_key")
            if not api_key:
                print("Error: Google API key not found in config.json")
                return False
            genai.configure(api_key=api_key)
            return True
    except FileNotFoundError:
        print("Error: config.json not found.")
        return False
    except Exception as e:
        print(f"An error occurred during AI configuration: {e}")
        return False

def get_intent(user_input, tools_description):
    """
    Uses the generative AI to understand user intent and extract parameters.
    """
    if not configure_ai():
        return {"error": "Failed to configure the AI."}

    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        prompt = f"""You are an expert intent detection agent. Your task is to analyze the user's request and identify the appropriate tool to call, along with its parameters.

        Here are the available tools:
        {tools_description}

        User Request: "{user_input}"

        Analyze the user request and respond ONLY with a single, valid JSON object that follows this format: {{"tool": "tool_name", "params": {{"param1": "value1", "param2": "value2"}}}}. Do not include any other text, explanations, or markdown formatting.
        If the user's request does not match any available tool, respond with: {{"tool": "unknown", "params": {{}}}}
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return {{"error": f"An error occurred while detecting intent: {e}"}}

def generate_text(prompt):
    """
    Generic function to generate text using a given prompt.
    """
    if not configure_ai():
        return "Failed to configure the AI. Please check your API key and configuration."

    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"!!!!!!!!!! DETAILED AI ERROR: {e} !!!!!!!!!!!")
        return f"An error occurred while generating text: {e}"

def generate_blog_title(topic):
    """
    Uses the generative AI to create an attractive, SEO-optimized blog title.
    """
    if not configure_ai():
        return "Failed to configure the AI. Please check your API key and configuration."

    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        prompt = f"""Eres un experto en marketing de contenidos. Tu tarea es generar un título de blog atractivo y optimizado para SEO sobre el siguiente tema. El título debe ser conciso, potente y diseñado para atraer clics.

Tema: {topic}

Responde únicamente con el título del blog y nada más."""
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"An error occurred while generating text: {e}"

def generate_blog_content(title, query):
    """
    Uses the generative AI to write a detailed, well-formatted blog post.
    """
    if not configure_ai():
        return "Failed to configure the AI. Please check your API key and configuration."

    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        prompt = f"""Eres un experto en redacción de contenidos y SEO. Tu tarea es escribir un artículo de blog completo y bien estructurado para el siguiente título. El objetivo es que sea útil para alguien que busca en Google sobre '{query}'.

        Título del Blog: {title}

        Instrucciones de formato:
        - Utiliza formato Markdown.
        - Incluye un encabezado principal (H1) para el título.
        - Estructura el contenido con subtítulos (H2, H3).
        - Usa listas (con viñetas o numeradas) cuando sea apropiado para facilitar la lectura.
        - Usa negritas para resaltar términos clave.
        - Escribe de forma clara, informativa y atractiva.

        Responde únicamente con el contenido del artículo en formato Markdown."""
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"An error occurred while generating text: {e}"

