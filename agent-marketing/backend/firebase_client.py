
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

_db = None

def get_db():
    global _db
    if _db is None:
        try:
            # Check if the app is already initialized to avoid errors
            if not firebase_admin._apps:
                cred_path = os.getenv("FIREBASE_CREDENTIALS")
                if not cred_path:
                    print("Failed to connect to Firebase: FIREBASE_CREDENTIALS environment variable not set.")
                    return None
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {
                    'storageBucket': 'expanded-system-469904-v9.firebasestorage.app'
                })
                print("Successfully connected to Firebase and Storage.")
            _db = firestore.client()
        except Exception as e:
            print(f"Failed to connect to Firebase: {e}")
            return None
    return _db

def get_collection(collection_name):
    """
    Fetches all documents from a Firestore collection.
    """
    db = get_db()
    if not db:
        return []
    
    docs = db.collection(collection_name).stream()
    return [doc.to_dict() for doc in docs]

def add_document(collection_name, data):
    """
    Adds a new document to a Firestore collection.
    """
    db = get_db()
    if not db:
        return False
    try:
        db.collection(collection_name).add(data)
        return True
    except Exception as e:
        print(f"Failed to add document: {e}")
        return False

def update_assistant_status(status, message):
    """
    Updates the assistant's status in a specific Firestore document.
    """
    db = get_db()
    if not db:
        print("Error: Cannot update assistant status, database not available.")
        return False
    try:
        doc_ref = db.collection('assistant_status').document('live_status')
        doc_ref.set({
            'status': status,
            'message': message,
            'timestamp': firestore.SERVER_TIMESTAMP
        })
        print(f"Updated assistant status to: {status}")
        return True
    except Exception as e:
        print(f"Failed to update assistant status: {e}")
        return False

def update_assistant_status(status, message):
    """
    Updates the assistant's status in a specific Firestore document.
    """
    db = get_db()
    if not db:
        print("Error: Cannot update assistant status, database not available.")
        return False
    try:
        doc_ref = db.collection('assistant_status').document('live_status')
        doc_ref.set({
            'status': status,
            'message': message,
            'timestamp': firestore.SERVER_TIMESTAMP
        })
        print(f"Updated assistant status to: {status}")
        return True
    except Exception as e:
        print(f"Failed to update assistant status: {e}")
        return False

def update_document(collection_name, title, data_to_update):
    """
    Updates a document in a Firestore collection found by its title.
    """
    db = get_db()
    if not db:
        return False
    try:
        # Find the document by title
        docs = db.collection(collection_name).where('title', '==', title).limit(1).stream()
        
        doc_to_update = None
        for doc in docs:
            doc_to_update = doc
            break

        if doc_to_update:
            doc_to_update.reference.update(data_to_update)
            print(f"Successfully updated document: '{title}'")
            return True
        else:
            print(f"Error: Document with title '{title}' not found.")
            return False # Document not found
    except Exception as e:
        print(f"Failed to update document: {e}")
        return False

def delete_document(collection_name, title):
    """
    Deletes a document from a Firestore collection by its title.
    """
    db = get_db()
    if not db:
        return False
    try:
        # Find the document by title
        docs = db.collection(collection_name).where('title', '==', title).limit(1).stream()
        
        doc_to_delete = None
        for doc in docs:
            doc_to_delete = doc
            break

        if doc_to_delete:
            doc_to_delete.reference.delete()
            return True
        else:
            return False # Document not found
    except Exception as e:
        print(f"Failed to delete document: {e}")
        return False
