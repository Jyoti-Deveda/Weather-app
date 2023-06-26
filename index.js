const userTab = document.querySelector("[data-userWeather]")
const searchTab = document.querySelector("[data-searchWeather]")

const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loadingContainer");
const userInfoContainer = document.querySelector(".userInfoContainer");
const errorContainer = document.querySelector('.error')

//initial variables
let currentTab = userTab;
const API_KEY = "e6fb5b281db934327105efdef84218fb";
currentTab.classList.add("current-tab");
getFromSessionsStorage();

function switchTab(clickedTab){
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");
        
        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            errorContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            //yha search tab visible h to use invisible karke, your weather wali tab ko visible karna h
            searchForm.classList.remove("active");
            // console.log("Searchform-invisible");
            userInfoContainer.classList.remove("active");
            // console.log('Userinfo -invisible');
            errorContainer.classList.remove("active");
            //ab your weather tab visible h to yha data bhi display karna pdega,
            //so let's check local storage first for coordinates, if we have saved them there
            getFromSessionsStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    //pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    //pass clicked tab as input parameter
    switchTab(searchTab);
});

//check if coordinates are already present in session storage
function getFromSessionsStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates")
    if(!localCoordinates){
        //if localCoordinates not visible we need access
        grantAccessContainer.classList.add("active");
    }else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

const errMsg = document.querySelector("[data-errorMsg]")

async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;

    //make grant container invisible
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    //api call
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        let data = await response.json();
        console.log(data);
        if(!data.sys){
            throw data;
        }

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
        // if(!data){
        //     setTimeout(() => {
        //         throw new Error('')
        //     }, 5000);
        // }

    }catch(err){
        loadingScreen.classList.remove('active')
        errorContainer.classList.add('active');
        errMsg.innerText     = "Couldn't get the weather for you!!"
    }
}


function renderWeatherInfo(weatherInfo){
    //fetching the elements

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    // console.log(desc);
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windSpeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch values from weather info and fill in UI
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
}

function getLocation(){
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition, errorCallback, {timeout: 5000});
        console.log("Fetched coordinates");
    }
    else{
        //hw alert for no geolocation
        prompt("No support for geo location")
    }
}

function showPosition(position){
    console.log("show position")
    console.log(position)

    const userCoordinates = {
        lat : position.coords.latitude,
        lon: position.coords.longitude,
    }
    // console.log("lat ", lat);
    // console.log("lon ", lon);
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates)
}

function errorCallback(){
    loadingScreen.classList.remove("active");
    errorContainer.classList.add('active');
    errMsg.innerText = `Couldn't fetch the coordinates!!`;
    throw Error;
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);


const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    errorContainer.classList.remove('active');

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        if(!data.sys){
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove('active')
        // searchForm.classList.remove("active")
        errorContainer.classList.add('active');
        errMsg.innerText = "Couldn't get the weather for you!!"
    }
}