
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Esta función asume que Firebase ya ha sido inicializado en el punto de entrada principal de la app (app.py)

def get_db():
    """Obtiene la instancia de la base de datos de Firestore."""
    return firestore.client()

def propose_content_change(collection: str, document_id: str, field: str, new_value: str, reason: str) -> str:
    """
    Proposes a change to a specific document field in Firestore.

    Args:
        collection (str): The name of the collection.
        document_id (str): The ID of the document to change.
        field (str): The field within the document to change.
        new_value (str): The proposed new value for the field.
        reason (str): The agent's reasoning for this change.

    Returns:
        str: A confirmation message with the proposal ID.
    """
    try:
        db = get_db()
        
        proposal_data = {
            "target_collection": collection,
            "target_document_id": document_id,
            "target_field": field,
            "proposed_value": new_value,
            "reason": reason,
            "status": "pendiente", # pending
            "timestamp": datetime.utcnow()
        }
        
        # Añade la propuesta a la colección 'propuestas_de_cambio'
        update_time, proposal_ref = db.collection('propuestas_de_cambio').add(proposal_data)
        
        confirmation_message = f"Propuesta creada con éxito con el ID: {proposal_ref.id}. Razón: {reason}"
        print(confirmation_message)
        return confirmation_message

    except Exception as e:
        error_message = f"Error al crear la propuesta de cambio: {e}"
        print(error_message)
        return error_message

# Ejemplo de cómo se podría usar (esto no se ejecuta directamente):
# if __name__ == '__main__':
#     # Necesitarías inicializar Firebase aquí para una prueba independiente
#     # cred = credentials.Certificate("path/to/serviceAccountKey.json")
#     # firebase_admin.initialize_app(cred)
#     
#     propose_content_change(
#         collection="servicios",
#         document_id="desarrollo-web",
#         field="description",
#         new_value="Una nueva descripción optimizada para SEO.",
#         reason="El análisis de palabras clave indica que esta descripción atraerá más tráfico cualificado."
#     )
