
from firebase_admin import storage
import datetime

def list_images():
    """
    Lists all image files in the Firebase Storage bucket.

    Returns:
        A list of filenames of the images in the bucket or an error message.
    """
    try:
        bucket = storage.bucket()
        # List all blobs (files) in the bucket
        blobs = bucket.list_blobs()
        
        # Filter for common image file types
        image_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.webp')
        image_files = [blob.name for blob in blobs if blob.name.lower().endswith(image_extensions)]
        
        return image_files
    except Exception as e:
        return {"error": f"Failed to list images from Firebase Storage: {e}"}


def get_image_url(file_name):
    """
    Generates a long-lived public URL for a given file in Firebase Storage.

    Args:
        file_name (str): The name of the file in the bucket.

    Returns:
        A public URL for the image or an error message.
    """
    try:
        bucket = storage.bucket()
        blob = bucket.blob(file_name)
        
        if not blob.exists():
            return {"error": f"Image '{file_name}' not found in Firebase Storage."}

        # Generate a signed URL that is valid for a very long time (e.g., until 2099)
        # This is a common approach for content that is meant to be public.
        expiration_date = datetime.datetime(2099, 1, 1)
        url = blob.generate_signed_url(expiration=expiration_date)
        
        return url
    except Exception as e:
        return {"error": f"Failed to get image URL for '{file_name}': {e}"}

if __name__ == '__main__':
    # Example usage:
    # This will initialize firebase from firebase_client and then list images.
    # Note: firebase_client.py must be in the same directory.
    import firebase_client
    
    # Ensure Firebase is initialized
    db = firebase_client.get_db()
    if not db:
        print("Firebase initialization failed. Exiting.")
    else:
        print("--- Listing all available images in Storage ---")
        images = list_images()
        
        if isinstance(images, dict) and "error" in images:
            print(f"ERROR: {images['error']}")
        elif not images:
            print("No images found in the storage bucket.")
        else:
            print(f"Found {len(images)} images:")
            for img in images:
                print(f"- {img}")
            
            # Example of getting a URL for the first image found
            if images:
                print("\n--- Getting URL for the first image ---")
                first_image_name = images[0]
                image_url = get_image_url(first_image_name)
                if isinstance(image_url, dict) and "error" in image_url:
                    print(f"ERROR: {image_url['error']}")
                else:
                    print(f"Public URL for '{first_image_name}':\n{image_url}")
        print("---------------------------------------------")
