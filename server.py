from flask import Flask, jsonify, render_template, request
from weather import get_current_weather
from waitress import serve
from datetime import datetime, timezone, timedelta
import json
import os

app = Flask(__name__)


@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/weather_search')
def weather_search():
    return render_template('get_weather.html')

@app.route('/predict')
def weather_predict():
    return render_template('floodpredict.html')

@app.route('/about-us')
def about_us():
    return render_template('about_us.html')

@app.route('/api/floodscale', methods=['GET'])
def floodscale_data():
    # Define the path to the JSON file
    json_path = os.path.join('data', 'floodscale.json')
    try:
        with open(json_path) as json_file:
            flood_data = json.load(json_file)  # Load the JSON data
            return jsonify(flood_data)  # Return the data as a JSON response
    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Return error if something goes wrong

@app.route('/map')
def map():
    return render_template('map.html')

@app.route('/predict-info/<name>')
def municipality_info(name):
    # Here, you can add logic to load more detailed information about the municipality
    # For now, it just displays the name
    return render_template('predict-info.html', title=name, name=name)

@app.route('/weather')
def get_weather():
    city = request.args.get('city')

    # Check for empty strings or string with only spaces
    if not bool(city.strip()):
        # You could render "City Not Found" instead like we do below
        city = "Leuven"

    weather_data = get_current_weather(city)

    # City is not found by API
    if not weather_data['cod'] == 200:
        return render_template('city-not-found.html')

    # Calculate local time based on timezone and dt (time of data calculation)
    timezone_offset = timedelta(seconds=weather_data['timezone'])  # Shift in seconds from UTC
    utc_time = datetime.fromtimestamp(weather_data['dt'], tz=timezone.utc)
    local_time = utc_time + timezone_offset

    return render_template(
        "weather.html",
        title=weather_data["name"],
        status=weather_data["weather"][0]["description"].capitalize(),
        temp=f"{weather_data['main']['temp']:.1f}",
        feels_like=f"{weather_data['main']['feels_like']:.1f}",
        local_time=local_time.strftime('%d-%m-%Y %H:%M'),
        weather_icon_url = f"http://openweathermap.org/img/wn/{weather_data['weather'][0]['icon']}@2x.png"
    )

@app.route('/about')
def about():
    return render_template('about.html')  # New route for the About page


# 404 Error Handler
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404
# Route for City Not Found Page
@app.route('/city-not-found')
def city_not_found():
    return render_template('city-not-found.html')

if __name__ == "__main__":
    serve(app, host="0.0.0.0", port=8000)