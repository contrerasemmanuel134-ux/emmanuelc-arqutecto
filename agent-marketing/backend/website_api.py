
from firebase_client import get_collection

def get_blog_posts():
    """
    Fetches blog posts from Firestore.
    """
    return get_collection("blogPost")

def get_projects():
    """
    Fetches projects from Firestore.
    """
    return get_collection("proyectos")
