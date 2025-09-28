import google.generativeai as genai
import json
import os

def get_ai_model():
    """
    Configures and returns the generative AI model.
    """
    try:
        config_path = os.path.join(os.path.dirname(__file__), 'config.json')
        with open(config_path, "r") as f:
            config = json.load(f)
            api_key = config.get("google_api_key")
            if not api_key or api_key == "TU_API_KEY_AQUI":
                print("Error: Google API key not found or not replaced in config.json")
                return None
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash-latest')
            return model
    except FileNotFoundError:
        print("Error: config.json not found.")
        return None
    except Exception as e:
        print(f"An error occurred during AI configuration: {e}")
        return None

def ask_question(context, history, question):
    """
    Asks a question to the AI model with the given context and history.

    Args:
        context (str): The code or text context for the question.
        history (list): A list of previous user/assistant messages.
        question (str): The user's current question.

    Returns:
        The AI's response as a string.
    """
    model = get_ai_model()
    if not model:
        return "Failed to configure the AI model. Please check your API key and configuration."

    try:
        # Format the history for the prompt
        formatted_history = ""
        for message in history:
            role = "Usuario" if message["role"] == "user" else "Asistente"
            formatted_history += f'{role}: {message["content"]}\n'

        prompt = f"""Eres un asistente experto en programación. Analiza el contexto de código y el historial de la conversación para responder la pregunta actual del usuario.

### Contexto del Código ###
{context}
### Fin del Contexto ###

### Historial de la Conversación ###
{formatted_history}
### Fin del Historial ###

Pregunta actual del usuario: {question}

Respuesta:"""
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"An error occurred while generating text: {e}"

def generate_code_modification(file_content, modification_request):
    """
    Asks the AI model to rewrite a file based on a modification request.

    Args:
        file_content (str): The original content of the file.
        modification_request (str): The user's instruction for the change.

    Returns:
        The rewritten file content as a single string.
    """
    model = get_ai_model()
    if not model:
        return "Failed to configure the AI model. Please check your API key and configuration."

    try:
        prompt = f"""Eres un asistente de programación experto. Tu tarea es reescribir el siguiente archivo de código para aplicar la modificación solicitada por el usuario.
Responde ÚNICAMENTE con el contenido completo y actualizado del archivo. No incluyas explicaciones, comentarios adicionales, ni uses bloques de código markdown.

### Archivo Original ###
{file_content}
### Fin del Archivo Original ###

Solicitud del usuario: \"{modification_request}\" 

### Archivo Modificado ###
"""
        
        response = model.generate_content(prompt)
        # Clean up potential markdown code blocks if the model adds them anyway
        new_code = response.text.strip()
        if new_code.startswith("```") and new_code.endswith("```"):
            new_code = '\n'.join(new_code.split('\n')[1:-1])
        
        return new_code
    except Exception as e:
        return f"An error occurred while generating the modified code: {e}"
