import os
import json
import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException

# The service account key file is expected to be in the same directory
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')

# Scopes for the Search Console API
SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly', 'https://www.googleapis.com/auth/analytics.readonly']

def get_search_console_data(site_url, start_date, end_date, dimensions=['query'], limit=10):
    """
    Fetches data from Google Search Console API using a service account.
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

def get_pagespeed_insights(url, strategy='DESKTOP'):
    """
    Fetches PageSpeed Insights data for a given URL.
    """
    try:
        with open(os.path.join(os.path.dirname(__file__), 'config.json')) as f:
            config = json.load(f)
        api_key = config.get('google_api_key')
        if not api_key:
            return {"error": "Google API key not found in config.json."}
    except FileNotFoundError:
        return {"error": "config.json not found."}
    except json.JSONDecodeError:
        return {"error": "Could not parse config.json."}

    api_url = f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={url}&strategy={strategy}&key={api_key}" 
    
    try:
        response = requests.get(api_url)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        result = response.json()
        
        lighthouse = result.get('lighthouseResult', {})
        categories = lighthouse.get('categories', {})
        
        scores = {
            'performance': round(categories.get('performance', {}).get('score', 0) * 100),
            'accessibility': round(categories.get('accessibility', {}).get('score', 0) * 100),
            'best-practices': round(categories.get('best-practices', {}).get('score', 0) * 100),
            'seo': round(categories.get('seo', {}).get('score', 0) * 100),
        }
        
        return scores

    except requests.exceptions.RequestException as e:
        return {"error": f"An error occurred making the request: {e}"}
    except Exception as e:
        return {"error": f"An unexpected error occurred: {e}"}




def get_analytics_data(property_id, start_date, end_date):
    """
    Fetches data from the Google Analytics Data API (GA4) using a service account.
    """
    try:
        creds = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    except FileNotFoundError:
        return {"error": "Service account key file not found."}
    except Exception as e:
        return {"error": f"Error loading credentials: {e}"}

    try:
        analytics = build('analyticsdata', 'v1beta', credentials=creds)

        request = {
            'dateRanges': [{'startDate': start_date, 'endDate': end_date}],
            'metrics': [{'name': 'activeUsers'}, {'name': 'sessions'}, {'name': 'screenPageViews'}]
        }

        response = analytics.properties().runReport(
            property=f"properties/{property_id}", body=request).execute()
        
        return response

    except HttpError as e:
        if e.resp.status == 403:
            error_message = (
                "Permission denied. The service account does not have access to the Google Analytics property. "
                "Please add the service account email as a 'Viewer' in your Google Analytics property settings."
            )
            return {"error": error_message, "service_account_email": creds.service_account_email}
        else:
            return {"error": f"An HTTP error occurred: {e}"}
    except Exception as e:
        return {"error": f"An unexpected error occurred: {e}"}

    # --- Test Search Console ---
    site_to_check = 'sc-domain:emmanuel-contreras.com'
    start = '2025-08-21'
    end = '2025-09-20'
    
    print(f"Fetching top {10} queries for {site_to_check} from {start} to {end}...")
    sc_data = get_search_console_data(site_to_check, start, end)
    
    if isinstance(sc_data, dict) and "error" in sc_data:
        print(f"\n--- SEARCH CONSOLE ERROR ---")
        print(sc_data["error"])
        if "service_account_email" in sc_data:
            print(f"\nService Account Email: {sc_data['service_account_email']}")
            print("\nPlease grant this email 'Viewer' access in Google Search Console and try again.")
        print("---------------------------")
    elif sc_data:
        print("\n--- Top 10 Search Queries ---")
        for row in sc_data:
            query = row['keys'][0]
            clicks = row['clicks']
            impressions = row['impressions']
            print(f"- Query: \"{query}\" | Clicks: {clicks} | Impressions: {impressions}")
        print("-----------------------------")
    else:
        print("No Search Console data found for the specified period.")

    print("\n" + "="*50 + "\n")

    # --- Test PageSpeed Insights ---
    url_to_test = "https://emmanuel-contreras.com/"
    print(f"Fetching PageSpeed Insights for {url_to_test}...")
    psi_scores = get_pagespeed_insights(url_to_test)

    if "error" in psi_scores:
        print(f"\n--- PAGESPEED ERROR ---")
        print(psi_scores["error"])
        print("-----------------------")
    else:
        print("\n--- PageSpeed Scores (Desktop) ---")
        for category, score in psi_scores.items():
            print(f"- {category.capitalize()}: {score}")


from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException

# ... (al final del archivo, antes del bloque if __name__)

def get_google_ads_data(customer_id):
    """
    Fetches performance data from the Google Ads API.
    """
    try:
        # Initialize the Google Ads client.
        # The library will automatically look for a `google-ads.yaml` file in the same directory.
        googleads_client = GoogleAdsClient.load_from_storage(os.path.join(os.path.dirname(__file__), 'google-ads.yaml'))

        ga_service = googleads_client.get_service("GoogleAdsService")

        query = """
            SELECT
                campaign.name,
                metrics.clicks,
                metrics.impressions,
                metrics.cost_micros
            FROM campaign
            WHERE campaign.status = 'ENABLED'
            ORDER BY metrics.impressions DESC
            LIMIT 10
        """

        stream = ga_service.search_stream(customer_id=customer_id, query=query)
        
        campaigns_data = []
        for batch in stream:
            for row in batch.results:
                campaigns_data.append({
                    'name': row.campaign.name,
                    'clicks': row.metrics.clicks,
                    'impressions': row.metrics.impressions,
                    'cost_micros': row.metrics.cost_micros
                })
        return campaigns_data

    except GoogleAdsException as ex:
        error_message = f"Request with ID '{ex.request_id}' failed with status " \
                        f"'{ex.error.code().name}' and includes the following errors:"
        for error in ex.failure.errors:
            error_message += f"\tError with message '{error.message}'."
            if error.location:
                for field_path_element in error.location.field_path_elements:
                    error_message += f"\t\tOn field: {field_path_element.field_name}"
        return {"error": error_message}
    except Exception as e:
        return {"error": f"An unexpected error occurred: {e}"}