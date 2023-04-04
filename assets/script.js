const weatherSearchBtn = $('#userSubmit');
const forecastHeader = $('#forecastHeader');
const userInput = $('#userInput');
const currentWeatherContainer = $('#currentWeatherContainer');
const fiveDayContainer = $('#forecastContainer');
const myKey = '51cba0081071469c9a577eac0eace90a';

$(function() {
  let retrievedArray = JSON.parse(localStorage.getItem('cities'));
  if (retrievedArray !== null) {
    saveArray = retrievedArray;
    let lastcity = saveArray[saveArray.length -1];
    getData(lastcity);
    saveArray.map((city => renderSearchHistory(city)));
  }
    return false;
});

const getData = (usercity) => {
  currentWeatherContainer.empty();
  forecastHeader.empty();
  fiveDayContainer.empty();
  getCurrentForecast(usercity);
  getFiveDayForecast(usercity);
}

const getCurrentForecast = (usercity) => {
  const queryUrl =
  `https://api.openweathermap.org/data/2.5/weather?q=${usercity}&units=imperial&appid=${myKey}`;
  $.ajax({
    url: queryUrl,
  })
  .then(handleWeatherData)
  .catch();
};

const handleWeatherData = (data) => {
  let icon = data.weather[0].icon;
  let date = data.dt;
  let formattedDate = new Date(date * 1000).toLocaleDateString();
  let iconUrl = `https://openweathermap.org/img/w/${icon}.png`;
  $("#currentWeatherContainer")
  .append(`<h2>${data.name}</h2>`)
  .append(`<h2>(${formattedDate})</h2>`)
  .append(`<img src=${iconUrl}>`)
  .append(`<p>Temperature: ${data.main.temp}&#176;F</p>`)
  .append(`<p>Humidity: ${data.main.humidity}%</p>`)
  .append(`<p>Windspeed: ${data.wind.speed}MPH</p>`);
  getUvIndex(data.coord.lat, data.coord.lon);
};

const getUvIndex = (latitude, longitude) => {
  let queryUVUrl =
  `https://api.openweathermap.org/data/2.5/uvi?lat=${latitude}&lon=${longitude}&appid=${myKey}`;    
  $.ajax({
    url: queryUVUrl,
  })
  .then(function (uv) {
    let uvIndex = uv.value;
    $('#currentWeatherContainer').append(
      `<p>UV Index:<span>${uvIndex}</span></p>`);
      if (uvIndex <= 2) {
        $('#currentWeatherContainer')
        .find('span')
        .addClass('bg-success text-white');
      } else if (uvIndex > 2 && uvIndex < 7) {
        $('#currentWeatherContainer')
        .find('span')
        .addClass('bg-warning text-dark');
      } else {
        $("#currentWeatherContainer")
        .find('span')
        .addClass('bg-danger text-white');
      }
    })
    .catch();
  };
  
  const getFiveDayForecast = (usercity) => {
    const query5DayUrl =
    `https://api.openweathermap.org/data/2.5/forecast?q=${usercity}&units=imperial&appid=${myKey}`;
    $.ajax({
      url: query5DayUrl,
    })
    .then(handle5DayWeatherData)
    .catch();
  };
  
  const handle5DayWeatherData = (data) => {
    $('#forecastHeader').append('<h4>5-Day Forecast:</h4>');
    data.list.forEach((forecast) => {
      let icon = forecast.weather[0].icon;
      let iconUrl = `https://openweathermap.org/img/w/${icon}.png`;
      let date = new Date(forecast.dt * 1000).toLocaleDateString();
      if (forecast.dt_txt.split(" ")[1] == "09:00:00") {
        $('#forecastContainer').append(
          `<div class="card bg-primary text-white"><div class="card-body">
          <p>${date}</p>
          <img src=${iconUrl}>
          <p>Temp: ${forecast.main.temp}&#176;F</p>
          <p>Humidity: ${forecast.main.humidity}%</p>
          </div></div>`
          );
        }
      });
    };
    
    $(weatherSearchBtn).on('click', (event) => {
      event.preventDefault();
      const usercity = userInput.val().toUpperCase();
      getData(usercity); 
      renderSearchHistory(usercity);
      saveToStorage(usercity); 
    });
    
    let saveArray = [];

    const saveToStorage = (usercity) => {
      saveArray.push(usercity);
      localStorage.setItem('cities', JSON.stringify(saveArray));
    };

    const renderSearchHistory = (usercity) => {
      $('#searchHistoryContainer').append(
        `<button class='btn btn-light btn-block' id='${usercity}'>${usercity}</button>`
        );
      };

      $('#searchHistoryContainer').on('click', (event) => {
        event.preventDefault();
        let btn = event.target.id;
        getData(btn);
      });