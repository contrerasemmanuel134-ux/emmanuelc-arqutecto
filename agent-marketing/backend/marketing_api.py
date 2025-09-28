
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# The service account key file is expected to be in the same directory
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')

# Scopes for the Search Console API
SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']

def get_search_console_data(site_url, start_date, end_date, dimensions=['query'], limit=10):
    """
    Fetches data from Google Search Console API using a service account.

    Args:
        site_url (str): The full URL of the site in Search Console (e.g., 'sc-domain:your-domain.com').
        start_date (str): Start date in 'YYYY-MM-DD' format.
        end_date (str): End date in 'YYYY-MM-DD' format.
        dimensions (list): The dimensions to group by (e.g., ['query', 'page']).
        limit (int): The maximum number of rows to return.

    Returns:
        A dictionary with the search analytics data or an error message.
    """
    try:
        creds = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    except FileNotFoundError:
        return {"error": "Service account key file not found. Make sure 'serviceAccountKey.json' is in the project directory."}
    except Exception as e:
        return {"error": f"Error loading service account credentials: {e}"}

    try:
        search_console = build('webmasters', 'v3', credentials=creds)

        request = {
            'startDate': start_date,
            'endDate': end_date,
            'dimensions': dimensions,
            'rowLimit': limit
        }

        response = search_console.searchanalytics().query(
            siteUrl=site_url, body=request).execute()
        
        return response.get('rows', [])

    except HttpError as e:
        if e.resp.status == 403:
            error_message = (
                "Permission denied. The service account does not have access to the Search Console property. "
                "Please add the service account email as a 'Viewer' or 'Restricted Viewer' in your Search Console settings."
            )
            return {"error": error_message, "service_account_email": creds.service_account_email}
        else:
            return {"error": f"An HTTP error occurred: {e}"}
    except Exception as e:
        return {"error": f"An unexpected error occurred: {e}"}

if __name__ == '__main__':
    # Example usage:
    # You need to replace 'sc-domain:your-domain.com' with your actual site property in Search Console.
    # You can find your service account email by running this file once and triggering the permission error.
    
    # IMPORTANT: To run this test, you must first add the service account email to your Search Console property.
    # 1. Run `python marketing_api.py` once. It will likely fail with a permission error but will print the email.
    # 2. Copy the service account email address.
    # 3. Go to your Search Console property -> Settings -> Users and permissions.
    # 4. Click "Add user", paste the email, and grant "Viewer" permission.
    # 5. Wait a minute and run this script again.
    
    site_to_check = 'sc-domain:emmanuel-contreras.com' # Replace with your property
    start = '2025-08-21'
    end = '2025-09-20'
    
    print(f"Fetching top {10} queries for {site_to_check} from {start} to {end}...")
    data = get_search_console_data(site_to_check, start, end)
    
    if "error" in data:
        print(f"\n--- ERROR ---")
        print(data["error"])
        if "service_account_email" in data:
            print(f"\nService Account Email: {data['service_account_email']}")
            print("\nPlease grant this email 'Viewer' access in Google Search Console and try again.")
        print("---------------")
    elif data:
        print("\n--- Top 10 Search Queries ---")
        for row in data:
            query = row['keys'][0]
            clicks = row['clicks']
            impressions = row['impressions']
            print(f"- Query: \"{query}\" | Clicks: {clicks} | Impressions: {impressions}")
        print("-----------------------------")
    else:
        print("No data found for the specified period.")
