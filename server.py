from flask import Flask, render_template, request
from weather import get_current_weather
from waitress import serve
from datetime import datetime, timezone, timedelta

app = Flask(__name__)


@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')


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


if __name__ == "__main__":
    serve(app, host="0.0.0.0", port=8000)