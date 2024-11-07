from datetime import datetime, timedelta
from flask import flash

# List of valid cities and postal codes
VALID_CITIES = ['leuven', 'lummen', 'meise', 'houston', 'brussel']
VALID_POSTAL_CODES = ['10001', '90001', '60601', '77001', '85001']

# Function to get the last five days
def get_last_five_days():
    today = datetime.today()
    days = [(today - timedelta(days=i)).strftime('%A') for i in range(1, 6)]
    return days[::-1]

# Function to process form data
def process_form_data(city, day_values):
    # Validate city or postal code
    if city.lower() not in VALID_CITIES and city not in VALID_POSTAL_CODES:
        flash("Please enter a valid city or postcode.")
        return None, False

    # Ensure all dropdowns are selected
    if not all(day_values):
        flash("Please select a level for each day.")
        return None, False
    
    # Simulate calculations
    results = {"city": city.title(), "levels": day_values, "summary": "Sample Calculation Result"}
    return results, True
