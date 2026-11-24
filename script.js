
// ==========================================
// SKYCAST WEATHER APPLICATION
// API: Open-Meteo
// Technology: Vanilla JavaScript
// ==========================================

// API endpoints
const API = {
  geocoding: "https://geocoding-api.open-meteo.com/v1/search",
  forecast: "https://api.open-meteo.com/v1/forecast"
};



// 1. DOM ELEMENT SELECTION


const elements = {
  searchForm: document.querySelector("#searchForm"),
  cityInput: document.querySelector("#cityInput"),
  locationButton: document.querySelector("#locationButton"),
  unitToggle: document.querySelector("#unitToggle"),

  welcomeState: document.querySelector("#welcomeState"),
  loadingState: document.querySelector("#loadingState"),
  errorState: document.querySelector("#errorState"),
  errorMessage: document.querySelector("#errorMessage"),
  retryButton: document.querySelector("#retryButton"),

  weatherContent: document.querySelector("#weatherContent"),

  cityName: document.querySelector("#cityName"),
  locationMeta: document.querySelector("#locationMeta"),
  currentIcon: document.querySelector("#currentIcon"),
  currentTemp: document.querySelector("#currentTemp"),
  currentCondition: document.querySelector("#currentCondition"),
  feelsLike: document.querySelector("#feelsLike"),

  todayHigh: document.querySelector("#todayHigh"),
  todayLow: document.querySelector("#todayLow"),
  rainChance: document.querySelector("#rainChance"),

  humidity: document.querySelector("#humidity"),
  wind: document.querySelector("#wind"),
  detailFeels: document.querySelector("#detailFeels"),
  sunrise: document.querySelector("#sunrise"),
  sunset: document.querySelector("#sunset"),
  detailRain: document.querySelector("#detailRain"),

  forecastList: document.querySelector("#forecastList"),

  saveFavoriteButton: document.querySelector("#saveFavoriteButton"),
  favoritesList: document.querySelector("#favoritesList"),
  favoriteCount: document.querySelector("#favoriteCount"),

  todayLabel: document.querySelector("#todayLabel")
};



// 2. LOCAL STORAGE AND APPLICATION STATE


const STORAGE_KEYS = {
  favorites: "skycast-favorite-cities",
  unit: "skycast-temperature-unit"
};

let currentWeather = null;
let currentPlace = null;
let lastSearchTerm = "";

let temperatureUnit =
  localStorage.getItem(STORAGE_KEYS.unit) || "celsius";

let favorites = loadFavorites();



// 3. WEATHER CONDITION DATA

const weatherDescriptions = {
  0: ["Clear sky", "☀"],
  1: ["Mainly clear", "🌤"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁"],

  45: ["Fog", "🌫"],
  48: ["Rime fog", "🌫"],

  51: ["Light drizzle", "🌦"],
  53: ["Drizzle", "🌦"],
  55: ["Dense drizzle", "🌧"],

  56: ["Freezing drizzle", "🌧"],
  57: ["Heavy freezing drizzle", "🌧"],

  61: ["Light rain", "🌦"],
  63: ["Moderate rain", "🌧"],
  65: ["Heavy rain", "🌧"],

  66: ["Freezing rain", "🌧"],
  67: ["Heavy freezing rain", "🌧"],

  71: ["Light snow", "🌨"],
  73: ["Snow", "🌨"],
  75: ["Heavy snow", "❄"],
  77: ["Snow grains", "❄"],

  80: ["Rain showers", "🌦"],
  81: ["Rain showers", "🌧"],
  82: ["Heavy showers", "⛈"],

  85: ["Snow showers", "🌨"],
  86: ["Heavy snow showers", "❄"],

  95: ["Thunderstorm", "⛈"],
  96: ["Thunderstorm with hail", "⛈"],
  99: ["Severe thunderstorm", "⛈"]
};



// 4. EVENT HANDLING



// Search form event
elements.searchForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const city = elements.cityInput.value.trim();

  if (!city) {
    showError("Please enter a city name before searching.");
    return;
  }

  lastSearchTerm = city;

  await searchCity(city);

});


// Temperature unit toggle
elements.unitToggle.addEventListener("click", () => {

  temperatureUnit =
    temperatureUnit === "celsius"
      ? "fahrenheit"
      : "celsius";

  localStorage.setItem(
    STORAGE_KEYS.unit,
    temperatureUnit
  );

  updateUnitButton();

  if (currentWeather && currentPlace) {
    renderWeather(currentPlace, currentWeather);
  }

});


// Current location button
elements.locationButton.addEventListener(
  "click",
  useCurrentLocation
);


// Favorite button
elements.saveFavoriteButton.addEventListener(
  "click",
  toggleCurrentFavorite
);


// Retry button
elements.retryButton.addEventListener("click", () => {

  if (lastSearchTerm) {
    searchCity(lastSearchTerm);
  }

});


// Quick city buttons
document.querySelectorAll(".quick-city").forEach((button) => {

  button.addEventListener("click", () => {

    const city = button.dataset.city;

    elements.cityInput.value = city;

    lastSearchTerm = city;

    searchCity(city);

  });

});



// 5. CITY SEARCH API

async function searchCity(cityName) {

  showLoading();

  try {

    const url =
      `${API.geocoding}?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        "The location service is temporarily unavailable."
      );
    }

    const data = await response.json();

    // Check whether the city exists
    if (!data.results || data.results.length === 0) {

      throw new Error(
        `No matching city was found for "${cityName}". Try another spelling.`
      );

    }

    const place = data.results[0];

    // Retrieve weather for selected city
    await loadWeather(place);

  } catch (error) {

    showError(
      error.message || "Something went wrong. Please try again."
    );

  }

}



// 6. WEATHER DATA API


async function loadWeather(place) {

  showLoading();

  try {

    const params = new URLSearchParams({

      latitude: place.latitude,

      longitude: place.longitude,

      current:
        "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",

      daily:
        "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",

      timezone: "auto",

      forecast_days: "5"

    });

    const response = await fetch(
      `${API.forecast}?${params}`
    );

    if (!response.ok) {

      throw new Error(
        "Weather data could not be loaded. Please try again."
      );

    }

    const data = await response.json();

    if (!data.current || !data.daily) {

      throw new Error(
        "The weather service returned incomplete data."
      );

    }

    currentPlace = place;
    currentWeather = data;

    renderWeather(place, data);

    showWeather();

  } catch (error) {

    showError(
      error.message || "Unable to retrieve weather data."
    );

  }

}



// 7. CURRENT LOCATION


async function useCurrentLocation() {

  if (!navigator.geolocation) {

    showError(
      "Your browser does not support location access. Search for a city instead."
    );

    return;

  }

  showLoading();

  navigator.geolocation.getCurrentPosition(

    async (position) => {

      const { latitude, longitude } = position.coords;

      const place = {

        name: "Your location",

        admin1: "Current GPS position",

        country: "",

        latitude,

        longitude

      };

      await loadWeather(place);

    },

    () => {

      showError(
        "Location access was not allowed or could not be determined. You can search for a city instead."
      );

    },

    {
      enableHighAccuracy: false,
      timeout: 10000
    }

  );

}



// 8. DYNAMIC WEATHER RENDERING

function renderWeather(place, data) {

  const current = data.current;
  const daily = data.daily;

  const unit =
    temperatureUnit === "celsius" ? "°C" : "°F";

  const windUnit =
    data.current_units?.wind_speed_10m || "km/h";

  const [description, icon] =
    getWeatherInfo(current.weather_code);


  // City information
  elements.cityName.textContent = place.name;

  elements.locationMeta.textContent =
    [place.admin1, place.country]
      .filter(Boolean)
      .join(", ") || "Current location";


  // Current weather
  elements.currentIcon.textContent = icon;

  elements.currentTemp.textContent =
    `${Math.round(convertTemperature(current.temperature_2m))}°`;

  elements.currentCondition.textContent = description;

  elements.feelsLike.textContent =
    `Feels like ${Math.round(convertTemperature(current.apparent_temperature))}${unit}`;


  // High and low temperature
  elements.todayHigh.textContent =
    `${Math.round(convertTemperature(daily.temperature_2m_max[0]))}°`;

  elements.todayLow.textContent =
    `${Math.round(convertTemperature(daily.temperature_2m_min[0]))}°`;


  // Rain probability
  elements.rainChance.textContent =
    `${daily.precipitation_probability_max[0] ?? 0}%`;


  // Weather details
  elements.humidity.textContent =
    `${current.relative_humidity_2m}%`;

  elements.wind.textContent =
    `${Math.round(current.wind_speed_10m)} ${windUnit}`;

  elements.detailFeels.textContent =
    `${Math.round(convertTemperature(current.apparent_temperature))}${unit}`;

  elements.sunrise.textContent =
    formatTime(daily.sunrise[0]);

  elements.sunset.textContent =
    formatTime(daily.sunset[0]);

  elements.detailRain.textContent =
    `${daily.precipitation_probability_max[0] ?? 0}%`;


  
  // DYNAMIC 5-DAY FORECAST
  // Array method: map()
  

  const forecastCards = daily.time.map((date, index) => {

    const [dayDescription, dayIcon] =
      getWeatherInfo(daily.weather_code[index]);

    return `

      <article class="forecast-day">

        <div class="day-name">
          ${index === 0 ? "Today" : formatDay(date)}
        </div>

        <div class="forecast-icon">
          ${dayIcon}
        </div>

        <div class="forecast-condition">
          ${dayDescription}
        </div>

        <div class="forecast-temps">

          <span>
            ${Math.round(convertTemperature(daily.temperature_2m_max[index]))}°
          </span>

          <span>
            ${Math.round(convertTemperature(daily.temperature_2m_min[index]))}°
          </span>

        </div>

        <div class="forecast-rain">
          ☂ ${daily.precipitation_probability_max[index] ?? 0}%
        </div>

      </article>

    `;

  });


  // Insert forecast into HTML
  elements.forecastList.innerHTML =
    forecastCards.join("");


  updateFavoriteButton();

  updateUnitButton();

}



// 9. FAVORITE CITIES RENDERING


function renderFavorites() {

  elements.favoriteCount.textContent =
    `${favorites.length} SAVED`;


  // Empty state
  if (favorites.length === 0) {

    elements.favoritesList.innerHTML = `

      <p class="empty-favorites">

        Your saved cities will appear here.
        Search a city and tap ♡ to save it.

      </p>

    `;

    return;

  }


  // Array method: map()
  elements.favoritesList.innerHTML =
    favorites.map((place, index) => `

      <div class="favorite-city">

        <button
          class="favorite-open"
          type="button"
          data-index="${index}"
        >

          ${escapeHTML(place.name)}

          <span>→</span>

        </button>

        <button
          class="favorite-remove"
          type="button"
          data-remove="${index}"
          aria-label="Remove ${escapeHTML(place.name)} from favorites"
        >

          ×

        </button>

      </div>

    `).join("");


  // Array method: forEach()
  elements.favoritesList
    .querySelectorAll("[data-index]")
    .forEach((button) => {

      button.addEventListener("click", () => {

        loadWeather(
          favorites[Number(button.dataset.index)]
        );

      });

    });


  // Remove favorite city
  elements.favoritesList
    .querySelectorAll("[data-remove]")
    .forEach((button) => {

      button.addEventListener("click", () => {

        const index = Number(button.dataset.remove);

        // Array method: filter()
        favorites = favorites.filter(
          (_, itemIndex) => itemIndex !== index
        );

        saveFavorites();

        renderFavorites();

        updateFavoriteButton();

      });

    });

}



// 10. LOCAL STORAGE



// Retrieve saved favorite cities
function loadFavorites() {

  try {

    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.favorites) || "[]"
    );

    return Array.isArray(saved) ? saved : [];

  } catch {

    return [];

  }

}


// Save favorite cities
function saveFavorites() {

  localStorage.setItem(
    STORAGE_KEYS.favorites,
    JSON.stringify(favorites)
  );

}


// Add or remove current city from favorites
function toggleCurrentFavorite() {

  if (!currentPlace || !currentWeather) {
    return;
  }


  // Array method: some()
  const alreadySaved = favorites.some((place) =>

    place.latitude === currentPlace.latitude &&
    place.longitude === currentPlace.longitude

  );


  if (alreadySaved) {

    // Remove favorite
    favorites = favorites.filter((place) =>

      !(
        place.latitude === currentPlace.latitude &&
        place.longitude === currentPlace.longitude
      )

    );

  } else {

    // Add favorite
    favorites.push({

      name: currentPlace.name,

      admin1: currentPlace.admin1 || "",

      country: currentPlace.country || "",

      latitude: currentPlace.latitude,

      longitude: currentPlace.longitude

    });

  }


  saveFavorites();

  renderFavorites();

  updateFavoriteButton();

}


// Update favorite button appearance
function updateFavoriteButton() {

  if (!currentPlace) {
    return;
  }

  const saved = favorites.some((place) =>

    place.latitude === currentPlace.latitude &&
    place.longitude === currentPlace.longitude

  );


  elements.saveFavoriteButton.classList.toggle(
    "saved",
    saved
  );

  elements.saveFavoriteButton.textContent =
    saved ? "♥" : "♡";

  elements.saveFavoriteButton.setAttribute(
    "aria-label",
    saved
      ? "Remove this city from favorites"
      : "Save this city to favorites"
  );

}



// 11. HELPER FUNCTIONS



// Celsius to Fahrenheit conversion
function convertTemperature(value) {

  return temperatureUnit === "fahrenheit"
    ? (value * 9 / 5) + 32
    : value;

}


// Get weather description and icon
function getWeatherInfo(code) {

  return weatherDescriptions[code] ||
    ["Weather unavailable", "🌡"];

}


// Format weekday
function formatDay(dateString) {

  return new Intl.DateTimeFormat("en", {
    weekday: "short"
  }).format(
    new Date(`${dateString}T12:00:00`)
  );

}


// Format sunrise and sunset
function formatTime(dateTime) {

  if (!dateTime) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit"
  }).format(
    new Date(dateTime)
  );

}


// Escape HTML special characters
function escapeHTML(value) {

  return String(value).replace(/[&<>"']/g, (character) => ({

    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"

  })[character]);

}


// 12. APPLICATION UI STATES



// Show loading state
function showLoading() {

  elements.welcomeState.classList.add("hidden");

  elements.errorState.classList.add("hidden");

  elements.weatherContent.classList.add("hidden");

  elements.loadingState.classList.remove("hidden");

}


// Show error state
function showError(message) {

  elements.loadingState.classList.add("hidden");

  elements.welcomeState.classList.add("hidden");

  elements.weatherContent.classList.add("hidden");

  elements.errorMessage.textContent = message;

  elements.errorState.classList.remove("hidden");

}


// Show weather data
function showWeather() {

  elements.loadingState.classList.add("hidden");

  elements.welcomeState.classList.add("hidden");

  elements.errorState.classList.add("hidden");

  elements.weatherContent.classList.remove("hidden");

}


// Update temperature unit button
function updateUnitButton() {

  elements.unitToggle.innerHTML =
    temperatureUnit === "celsius"
      ? '°C <span>/</span> °F'
      : '°F <span>/</span> °C';

  elements.unitToggle.setAttribute(
    "aria-label",
    temperatureUnit === "celsius"
      ? "Switch to Fahrenheit"
      : "Switch to Celsius"
  );

}


// Display current date
function setDateLabel() {

  elements.todayLabel.textContent =

    new Intl.DateTimeFormat("en", {

      weekday: "long",
      day: "numeric",
      month: "long"

    }).format(new Date()).toUpperCase();

}


// 13. APPLICATION INITIALIZATION


setDateLabel();

updateUnitButton();

renderFavorites();
