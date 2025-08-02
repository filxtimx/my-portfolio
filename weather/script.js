console.log("Script loaded");

const loader = document.getElementById("loader");
const weatherResult = document.getElementById("weather-result");
const iconEl = document.getElementById("icon");
const cityNameEl = document.getElementById("city-name");
const descEl = document.getElementById("description");
const tempEl = document.getElementById("temperature");
const windEl = document.getElementById("wind");
const humidityEl = document.getElementById("humidity");
const errorBox = document.getElementById("error");
const cityInput = document.getElementById("city-input");
const suggestionsEl = document.getElementById("suggestions");
const modeBtn = document.getElementById("mode-btn");

const API_KEY = "10939b00040060da7cf6f234ee15cd69";

/* Helpers */
const debounce = (fn, delay=300)=>{ let t; return (...a)=>{clearTimeout(t); t=setTimeout(()=>fn(...a),delay);} };
function showLoader(on){ loader.classList.toggle("show", on); }
function showError(m){ errorBox.textContent=m; errorBox.classList.remove("hidden"); }
function clearError(){ errorBox.textContent=""; errorBox.classList.add("hidden"); }
function getWeatherIcon(w){
  w=w.toLowerCase();
  if(w.includes("clear")) return "☀️";
  if(w.includes("cloud")) return "☁️";
  if(w.includes("rain")) return "🌧️";
  if(w.includes("snow")) return "❄️";
  if(w.includes("storm")||w.includes("thunder")) return "⛈️";
  return "🌤️";
}

/* Weather */
async function getWeather(cityParam){
  const city=(cityParam ?? cityInput.value).trim();
  if(!city) return;

  clearError(); showLoader(true); weatherResult.classList.add("hidden");

  try{
    const url=`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const res=await fetch(url);
    if(!res.ok){ const err=await res.json().catch(()=>({})); throw new Error(err.message||`HTTP ${res.status}`); }
    const data=await res.json();
    const weather=data.weather[0].main;

    iconEl.textContent=getWeatherIcon(weather);
    cityNameEl.textContent=data.name;
    descEl.textContent=data.weather[0].description;
    tempEl.textContent=`${Math.round(data.main.temp)}°C`;
    windEl.textContent=`${data.wind.speed} m/s`;
    humidityEl.textContent=`${data.main.humidity}%`;

    weatherResult.classList.remove("hidden");
    cityInput.value=data.name;
  }catch(e){
    console.error(e);
    showError("Не успях да взема времето: "+e.message);
  }finally{
    showLoader(false);
  }
}

/* Autocomplete */
async function fetchSuggestions(q){
  if(!q){ suggestionsEl.classList.add("hidden"); return; }
  try{
    const url=`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${API_KEY}`;
    const res=await fetch(url);
    if(!res.ok) throw new Error(`Geo HTTP ${res.status}`);
    const arr=await res.json();
    renderSuggestions(arr);
  }catch(err){ console.error(err); }
}
function renderSuggestions(list){
  if(!list.length){ suggestionsEl.classList.add("hidden"); return; }
  suggestionsEl.innerHTML=list.map(c=>`
    <li data-name="${c.name}">
      ${c.name}${c.state?`, ${c.state}`:''}, ${c.country}
    </li>`).join("");
  suggestionsEl.classList.remove("hidden");
}
suggestionsEl.addEventListener("click",e=>{
  const li=e.target.closest("li"); if(!li) return;
  cityInput.value=li.dataset.name;
  suggestionsEl.classList.add("hidden");
  getWeather(li.dataset.name);
});
const debouncedSuggest=debounce(fetchSuggestions,350);
cityInput.addEventListener("input",e=>debouncedSuggest(e.target.value));
cityInput.addEventListener("keydown",e=>{
  if(e.key==="Tab"){
    const first=suggestionsEl.querySelector("li");
    if(first){ e.preventDefault(); cityInput.value=first.dataset.name; suggestionsEl.classList.add("hidden"); }
  }else if(e.key==="Enter"){
    e.preventDefault(); getWeather();
  }
});
document.addEventListener("click",e=>{
  if(!e.target.closest(".search-bar")) suggestionsEl.classList.add("hidden");
});

/* Theme toggle */
modeBtn.addEventListener("click",()=>{
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("dark")?"dark":"light");
});

/* Restore */
const savedTheme=localStorage.getItem("theme");
if(savedTheme==="dark"){ document.body.classList.remove("light"); document.body.classList.add("dark"); }

/* Splash loader */
window.addEventListener('load',()=>{
  showLoader(true);
  setTimeout(()=>showLoader(false),1000);
});
