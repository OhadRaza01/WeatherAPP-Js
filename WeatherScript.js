
let searchbtn = document.querySelector(".searchbtn")
let searchInput = document.querySelector(".searchInput")
const history = JSON.parse(localStorage.getItem("history")) || [];

// returning date object
function createDate() {
    return new Date()
}

// update clock every second
function updateClock() {
    const clock = document.querySelector(".clock")

    function renderTime() {
        let date = createDate()
        clock.textContent = date.toLocaleTimeString()
    }

    renderTime()
    setInterval(renderTime, 1000)
}
updateClock()

// render Day
function renderDay() {
    const day = document.querySelector(".day")
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    let date = createDate()

    day.textContent = days[date.getDay()]
}
renderDay()

// Displaying error msg on invalid search 
function showErrorMessage(message) {
    const error = document.querySelector(".error-msg")
    error.style.display = "inline-block"
    error.textContent = message
    searchInput.style.borderColor = "rgb(225, 65, 65)"

    searchInput.classList.add("animate-custom")
}

// validating city search
function validateSearch() {
    if (!searchInput.value.trim()) {
        return 'Please enter a city name.'
    }

    else if (searchInput.value.trim().length < 2) {
        return "City name is too short."
    }

    else {
        return null
    }
}

//dissmiss Error
function dismissError() {
    const error = document.querySelector(".error-msg")
    error.style.display = "none"
    searchInput.style.borderColor = "rgba(255, 255, 255, 0.08)"
    searchInput.value = ""

    searchInput.classList.remove("animate-custom")

}


async function geocodeCity(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Geocoding request failed.');
    const data = await res.json();
    if (!data.results || data.results.length === 0) throw new Error(`No results found for "${city}".`);
    return data.results[0];
}

async function handleSearch() {
    try {

        let cityData = await geocodeCity(searchInput.value.trim())
        console.log(cityData)
        let { name: cityName, country: countryName, latitude, longitude } = cityData
        // console.log(cityName, countryName, latitude, longitude)

        let cityWeather = await fetchWeather(latitude, longitude)
        // console.log(cityWeather)
        // console.log(cityWeather.current.temperature_2m);
        // console.log(cityWeather.current.wind_speed_10m);
        // console.log(cityWeather.daily.temperature_2m_max);



        showWeather(cityName, countryName, cityWeather.current.temperature_2m)
        dismissError()

    }
    catch (error) {
        // console.log(error)
        showWeatherError("City not found. Please check the spelling and try again.")
    }
}

function showWeather(cityName, countryName, temperature) {

    if (!history.includes(cityName)) {
        history.push(cityName);
        localStorage.setItem("history", JSON.stringify(history));
    }

    const weather = document.querySelector(".weather")

    weather.innerHTML = `
        <div class="weather-card">
            <div class="location">
                <h1 class="city">${cityName}</h1>
                <p class="country">${countryName}</p>
            </div>
            <div class="weather-details">
                <div class="temp">${temperature}°C</div>
                <p class="description">Weather Information</p>
            </div>
        </div>
    `;
    weather.style.opacity = 1
    showSearchHistory()

}

function showWeatherError(message) {
    const weather = document.querySelector(".weather")

    weather.innerHTML = `
        <div class="error-card">
            <div class="error-icon">⚠️</div>
            <h2 class="error-title">Oops!</h2>
            <p class="error-message">${message}</p>
        </div>
    `;
    weather.style.opacity = 0.8
}

// show previous searches
function showSearchHistory() {
    if (localStorage.getItem("history")) {
        const showHistory = document.querySelector(".show-history")
        const data = JSON.parse(localStorage.getItem("history"));
        showHistory.innerHTML = ""
        data.forEach((cityname) => {
            let span = document.createElement("span")
            span.innerHTML = `<span class="search-history">${cityname}</span> `
            showHistory.appendChild(span)
        })
    }
}


//fetch weather method
async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index,surface_pressure,visibility` +
        `&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max` +
        `&timezone=auto&forecast_days=7`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API request failed.');
    return res.json();
}

// search button functionality
searchbtn.addEventListener("click", function () {

    let validation = validateSearch()
    if (validation) {
        showErrorMessage(validation)
    }
    else {
        handleSearch()
    }

})

searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        searchbtn.click()
    }
})





