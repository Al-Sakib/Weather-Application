
# SkyCast - Weather Application

## Course Information

- Course: Software Development I (CSE-2340)
- Assessment: Mini Project 3-4 (MP3-MP4)
- Project: Interactive API-Driven Weather Application
- Technology: HTML, CSS and JavaScript

## Project Description

SkyCast is a responsive weather application that allows users to search for cities and view real-time weather information.

The application retrieves weather data from the Open-Meteo API and dynamically displays current weather conditions and a five-day forecast.

Users can save favorite cities and change temperature units. Their preferences remain saved using browser Local Storage.

## Features

1. Search for any supported city.
2. Display current weather information.
3. Show a five-day weather forecast.
4. Display humidity and wind speed.
5. Display sunrise and sunset times.
6. Switch between Celsius and Fahrenheit.
7. Save favorite cities.
8. Remove favorite cities.
9. Save preferences using Local Storage.
10. Responsive design for mobile and desktop.
11. Loading and error handling.
12. Current location weather using GPS.

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla JavaScript)
- Open-Meteo Geocoding API
- Open-Meteo Weather Forecast API
- Browser Local Storage

## Project Structure

MP3-MP4-Weather-Application/
│
├── index.html
├── style.css
├── script.js
└── README.md

## API Information

Geocoding API:
https://geocoding-api.open-meteo.com/v1/search

Weather API:
https://api.open-meteo.com/v1/forecast

API Provider:
https://open-meteo.com/

No API key is required.

## How to Run

1. Download or clone the project.
2. Open the project folder in Visual Studio Code.
3. Install the Live Server extension.
4. Open index.html using Live Server.
5. Search for a city.
6. Explore the weather information.

An internet connection is required for API requests.

## MP3 Requirements

### 1. DOM Manipulation and Dynamic Rendering

The application uses JavaScript DOM methods and selectors to display weather information dynamically.

Examples:
- document.querySelector()
- textContent
- innerHTML
- classList

### 2. Event Handling and JavaScript Logic

The application uses addEventListener() to handle user interactions.

JavaScript array methods:
- map()
- filter()
- forEach()
- some()

## MP4 Requirements

### 3. API Integration and Asynchronous Operations

The application uses:
- fetch()
- async/await
- response.json()
- try/catch

It also implements loading, error and empty states.

### 4. Local Storage

The application uses localStorage to save:
- Favorite cities
- Temperature unit preference

Saved preferences remain available after refreshing the browser.

## Assignment Submission

1. GitHub repository URL.
2. ZIP file of the project.

## Developed For

International Islamic University Chittagong
Department of Computer Science and Engineering
CSE-2340 Software Development I
