const apiKey = 'f764028726fa7a725ed685f4c21da1c7';
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('search-Btn');
const locationBtn = document.getElementById('location-Btn');
const cityDropdown = document.getElementById('cityDropdown');
const header = document.querySelector('header');


// HTML elements for current weather
const cityName = document.getElementById('cityName');
const currentDate = document.getElementById('currentDate');
const tempElement = document.querySelector('.details h2');
const weatherDescription = document.querySelector('.details p:nth-of-type(2)');
const weatherIcon = document.querySelector('.weather-icon img');
const humidityVal = document.getElementById('humidityVal');
const pressureVal = document.getElementById('pressureVal');
const visibilityVal = document.getElementById('visibilityVal');
const windSpeedVal = document.getElementById('windSpeedVal');
const feelsVal = document.getElementById('feelsVal');
const sunriseTimeElem = document.getElementById('sunriseTime');
const sunsetTimeElem = document.getElementById('sunsetTime');

// Add dropdown to the header but initially hide it
cityDropdown.style.display = 'none';
cityDropdown.classList.add('bg-white', 'text-gray-800', 'px-4', 'py-2', 'rounded', 'w-full', 'sm:w-auto');


// Function to save city to localStorage
function saveCity(city) {
    let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!cities.includes(city)) {
        cities.push(city);
        localStorage.setItem('recentCities', JSON.stringify(cities));
    }
}

function loadCities() {
    let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    cityDropdown.innerHTML = ''; // Clear previous options

    if (cities.length > 0) {
        cityDropdown.style.display = 'block'; // Show dropdown when cities exist

        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Select a city';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        cityDropdown.appendChild(defaultOption);

        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            cityDropdown.appendChild(option);
        });
    } else {
        cityDropdown.style.display = 'none'; // Hide dropdown if no cities
    }
}


// Function to update weather when a city is selected from the dropdown
cityDropdown.addEventListener('change', (event) => {
    const selectedCity = event.target.value;
    fetchWeather(selectedCity);
});




// HTML elements for forecast
const forecastContainer = document.getElementById('forecastContainer');

// HTML element for hourly forecast
const hourlyForecastContainer = document.querySelector('.hourly-forecast');

// Helper function to format date and time
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toDateString();
}

function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Function to update the current weather section
function updateCurrentWeather(data) {
    cityName.textContent = data.name;
    currentDate.textContent = formatDate(data.dt);
    tempElement.textContent = `${Math.round(data.main.temp)}°C`;
    weatherDescription.textContent = data.weather[0].description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    humidityVal.textContent = `${data.main.humidity}%`;
    pressureVal.textContent = `${data.main.pressure} hPa`;
    visibilityVal.textContent = `${data.visibility / 1000} km`;
    windSpeedVal.textContent = `${data.wind.speed} m/s`;
    feelsVal.textContent = `${Math.round(data.main.feels_like)}°C`;

    saveCity(data.name); // Save city to localStorage
    loadCities(); // Refresh the dropdown

}
// Function to update sunrise and sunset times
function updateSunriseSunset(data) {
    const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    sunriseTimeElem.textContent = sunriseTime;
    sunsetTimeElem.textContent = sunsetTime;
}

// Function to update the forecast section
function updateForecast(data) {
    forecastContainer.innerHTML = ''; // Clear previous forecast data
    data.list.forEach((item, index) => {
        if (index % 8 === 0) {
            // Show forecast for every 8th data point (roughly one per day)
            const forecastItem = document.createElement('div');
            forecastItem.classList.add('forecast-item', 'flex', 'flex-col', 'mx-2');
            forecastItem.innerHTML = `
        <p class="text-sm">${formatDate(item.dt)}<p>
        <img class="size-16" src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}" />
        <p class="text-sm">Temp : ${Math.round(item.main.temp)}°C</p>
        <p class="text-sm">Humidity : ${item.main.humidity}%</p>
              <p class="text-sm">Wind : ${item.wind.speed} m/s</p>`;
             
            forecastContainer.appendChild(forecastItem);
        }
    });
}



// Function to update hourly forecast
function updateHourlyForecast(data) {
    hourlyForecastContainer.innerHTML = ''; // Clear previous hourly forecast data
    const hoursToShow = 8; // Show forecast for the next 8 hours
    data.list.slice(0, hoursToShow).forEach((item) => {
        const hourlyItem = document.createElement('div');
        hourlyItem.classList.add('card', 'text-center', 'sm:p-4', 'rounded-lg');
        hourlyItem.innerHTML = `
      <p class="text-sm sm:text-base">${formatTime(item.dt)}</p>
      <img
        src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png"
        alt="${item.weather[0].description}"
        class="mx-auto"
      />
      <p class="text-sm sm:text-base">${Math.round(item.main.temp)}°C</p>
      <hr class="border-gray-600 my-2" />
    `;
        hourlyForecastContainer.appendChild(hourlyItem);
    });
}

// Function to fetch current weather and forecast data
function fetchWeather(city) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(weatherUrl)
        .then((response) => response.json())
        .then((data) => {
            updateCurrentWeather(data);
            updateSunriseSunset(data);


            return fetch(forecastUrl);
        })
        .then((response) => response.json())
        .then((forecastData) => {
            updateForecast(forecastData);
            updateHourlyForecast(forecastData);
        })
        .catch((error) => {
            console.error('Error fetching weather data:', error);
            alert('Could not retrieve weather data. Please try again.');
        });
}

// Event listener for search button
searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        fetchWeather(city);
    } else {
        alert('Please enter a city name.');
    }
});
// Event listener for the "Enter" key on the input field
cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value;
        if (city) {
            fetchWeather(city);
        } else {
            alert('Please enter a city name.');
        }
    }
});

// Initial load of cities when the page loads
window.addEventListener('load', () => {
    loadCities();
});

// Event listener for current location button
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

            fetch(weatherUrl)
                .then((response) => response.json())
                .then((data) => {
                    updateCurrentWeather(data);
                    updateSunriseSunset(data);
                    return fetch(forecastUrl);
                })
                .then((response) => response.json())
                .then((forecastData) => {
                    updateForecast(forecastData);
                    updateHourlyForecast(forecastData);
                })
                .catch((error) => {
                    console.error('Error fetching weather data:', error);
                    alert('Could not retrieve weather data. Please try again.');
                });
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});
