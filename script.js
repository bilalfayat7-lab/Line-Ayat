const size = 6;

let isDragging = false;
let startStopped = false;

let grid=document.getElementById("grid");
let cells=[];
let path=[];
let solarStarted = false;

let lastWind = 0;

function playWindShort(){
  if(!windSound) return;

  let now = Date.now();
  if(now - lastWind < 120) return; // kasih delay lebih aman

  lastWind = now;

  windSound.pause(); // stop dulu biar tidak bentrok
  windSound.currentTime = 0.01;

  let playPromise = windSound.play();

  if(playPromise !== undefined){
    playPromise.catch(err => {
      console.log("Audio blocked:", err);
    });
  }

  setTimeout(() => {
    
  }, 80);
}

function playStickerSound(){

  if(!stickerSound) return;

  stickerSound.pause();
  stickerSound.currentTime = 0;

  stickerSound.play().catch(()=>{});

}

const windSound = document.getElementById("windSound");
const stickerSound = document.getElementById("stickerSound");
const solarSound = document.getElementById("solarSound");


/* ✔ START = قُلْ */
const correctPath = [
  "0,0", // قُلْ (kanan paling awal)
  "0,1", // أَعُوذُ
  "0,2", // بِرَبِّ
  "0,3", // النَّاسِ

  "1,3",
"2,3",

  "2,4",
 "3,4",

  "3,5",
"4,5",


   "4,4",
   "5,4",
   "5,3",
   "4,3",
   "3,3",
   "3,2",
   "3,1",
   "2,1",

  
  
];

/* 🟩 AN-NAS PATH (قُلْ = START) */
const nas = {
  "0,0":"قُلْ",        // START
  "0,1":"أَعُوذُ",
  "0,2":"بِرَبِّ",
  "0,3":"النَّاسِ",

  "1,3":"مَلِكِ",
  "2,3":"النَّاسِ",

  "2,4":"إِلَٰهِ",
  "3,4":"النَّاسِ",

  "3,5": "مِن شَرِّ",
   "4,5":"الْوَسْوَاسِ",

   "4,4": "الْخَنَّاسِ",
   "5,4":"الَّذِي",
   "5,3":"يُوَسْوِسُ",
   "4,3":"فِي",
   "3,3":"صُدُورِ",
   "3,2":"النَّاسِ",
   "3,1":"مِنَالْجِنَّةِ",
   "2,1":"وَالنَّاسِ"
   
  
};

/* 🟨 DISTRACTOR FULL BOARD */
const pool = [
  "الْفَلَقِ","مَا خَلَقَ","حَاسِدٍ",
  "تَبَّتْ","يَدَا","أَبِي","لَهَبٍ",
  "ظُلُمَاتٍ","فَجْرٍ","الشَّمْسِ",
  "الْقَمَر","اللَّيْل","النَّهَار",
  "الْكَوْثَر","الْعَصْر","الدِّين",
  "الرَّحْمٰن","الرَّحِيم","قُلْ","أَعُوذُ"
];

function randomText(r,c){
  let key=r+","+c;

  
  if(nas[key]) return nas[key];
  return pool[(r*11+c*7)%pool.length];
}



const orbitList = [
  ".orbit1",
  ".orbit2",
  ".orbit3",
  ".orbit4",
  ".orbit5",
  ".orbit6"
];





function createGrid(){
  grid.innerHTML="";
  cells=[];

  let delay = 0;

  for(let r=0;r<size;r++){
    for(let c=0;c<size;c++){

      let cell=document.createElement("div");
      cell.className="cell";
      cell.dataset.r=r;
      cell.dataset.c=c;

      let key = r + "," + c;

        cell.innerText = randomText(r,c);


        if (nas[key] === "قُلْ") {

        cell.classList.add("start");

        cell.addEventListener("click", function () {

        if (isDragging) return; // 🔥 penting: biar tidak aktif saat drag

        cell.classList.remove("start");
        cell.classList.add("clicked");

        cell.style.animation = "none";
        });
        }

     

      // 🔥 ANIMASI ACAK TERKONTROL
      cell.style.opacity = "0";
      cell.style.transform = "scale(0.3)";

      let randomDelay = Math.random() * 300; // acak tapi stabil

      setTimeout(()=>{
        cell.style.transition = "0.3s ease";
        cell.style.opacity = "1";
        cell.style.transform = "scale(1)";
      }, delay + randomDelay);

      delay += 30; // tetap berurutan tapi terasa acak

      cell.addEventListener("pointerdown", startDraw);
      cell.addEventListener("pointerenter", moveDraw);

      grid.appendChild(cell);
      cells.push(cell);
    }
  }

  document.addEventListener("pointerup", endDraw);
}

function startDraw(e){

  let cell = e.target.closest(".cell");
  if(!cell) return;

  playWindShort();

  if(path.length === 0 && nas[cell.dataset.r + "," + cell.dataset.c] !== "قُلْ"){
    return;
  }

  isDrawing = true;
  isDragging = true;

  windSound.currentTime = 0;
windSound.play();

  stopStartAnimation();

  add(cell);
}


function moveDraw(e){
  if(!isDrawing) return;

  let cell = e.target.closest(".cell");
  if(!cell) return;

  // ❗ ini penting untuk mencegah trigger saat tidak drag
  if(!isDragging) return;

  let last = path[path.length - 1];
  if(!last) return;

  let lr = +last.dataset.r;
  let lc = +last.dataset.c;

  let r = +cell.dataset.r;
  let c = +cell.dataset.c;

  let adj = Math.abs(lr - r) + Math.abs(lc - c) === 1;

  if(!adj) return;

  add(cell);
}

function add(cell){

    console.log("ADD OK:", cell.innerText);

  if(!isDrawing) return;

  let key = cell.dataset.r + "," + cell.dataset.c;

  // 1. kalau sudah pernah dikunjungi → boleh mundur (backtrack)
  let existingIndex = path.findIndex(c =>
    c.dataset.r + "," + c.dataset.c === key
  );

  if(existingIndex !== -1){

    // hapus langkah setelah itu (BACKTRACK)
    path.slice(existingIndex + 1).forEach(c=>{
      c.classList.remove("path");
    });

    path = path.slice(0, existingIndex + 1);
    return;
  }

  // 2. kalau ini langkah pertama → harus dari قُلْ
  if(path.length === 0 && nas[key] !== "قُلْ"){
    return;
  }

  // 3. kalau bukan langkah pertama → harus bertetangga (opsional tapi disarankan)
  if(path.length > 0){
    let last = path[path.length - 1];

    let lr = +last.dataset.r;
    let lc = +last.dataset.c;

    let r = +cell.dataset.r;
    let c = +cell.dataset.c;

    let adj = Math.abs(lr - r) + Math.abs(lc - c) === 1;

    if(!adj) return;
  }

 cell.classList.add("path");
path.push(cell);

// cek apakah langkah terbaru benar
let currentIndex = path.length - 1;

let currentKey =
  cell.dataset.r + "," + cell.dataset.c;

if(correctPath[currentIndex] === currentKey){

  correctStepCount++;

  // ❌ skip sticker di kelipatan 3
  if(correctStepCount % 3 !== 0){
    showSticker(cell);
  }

  // planet tiap 3 langkah benar
  if(correctStepCount - lastPlanetMilestone === 3){

    lastPlanetMilestone = correctStepCount;

    unlockedPlanets++;

    if(unlockedPlanets > planetColors.length){
      unlockedPlanets = planetColors.length;
    }

    showPlanetEffect();
  }

}

  

  checkWin();
}


function endDraw(){
  isDrawing=false;
  isDragging = false;
}

function checkWin(){

  let keys = path.map(c => c.dataset.r + "," + c.dataset.c);

  let ok = correctPath.slice(0, keys.length)
    .every((v,i) => v === keys[i]);



  if(!ok || keys.length !== correctPath.length) return;

  isDrawing = false;

  showWin();

  path.forEach(c => c.classList.add("path"));
  path[path.length - 1].classList.add("end");

  cells.forEach(c => c.style.pointerEvents = "none");

  windSound.pause();
windSound.currentTime = 0;
}


function reset(){
  path=[];

  correctStepCount = 0;
  lastPlanetMilestone = 0;
  unlockedPlanets = 0;
  

  cells.forEach(c=>c.classList.remove("path"));

  document.getElementById("info").innerText =
  "Mulai dari قُلْ dan ikuti urutan baca";
}

createGrid();


function showWin(){
  document.getElementById("winPopup").classList.remove("hidden");
}

function closeWin(){
  document.getElementById("winPopup").classList.add("hidden");
  reset();

  // unlock game lagi
  cells.forEach(c => c.style.pointerEvents = "auto");
}


function stopStartAnimation(){
  if(startStopped) return;
  startStopped = true;

  let startCell = [...cells].find(c =>
    nas[c.dataset.r + "," + c.dataset.c] === "قُلْ"
  );

  if(startCell){
    startCell.classList.remove("start");
    startCell.classList.add("clicked");
    startCell.style.animation = "none";
  }
}


function showSticker(cell){ 

  playStickerSound();

  console.log("STICKER OK");

  let rect = cell.getBoundingClientRect();

  let sticker = document.createElement("div");
  sticker.className = "sticker";

  sticker.style.left = (rect.left + rect.width/2) + "px";
  sticker.style.top = (rect.top + rect.height/2) + "px";

  sticker.style.position = "fixed";
  sticker.style.zIndex = "999999";
  sticker.style.pointerEvents = "none";

  document.body.appendChild(sticker);

  setTimeout(()=>sticker.remove(), 600);
}



const planetColors = [
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune"
];

let planetIndex = 0;

let solarComplete = false;



let correctStepCount = 0;
let lastPlanetMilestone = 0;
let unlockedPlanets = 0;


function showPlanetEffect(){

  solarSound.pause();
  solarSound.currentTime = 0;
  solarSound.play();

  let wrap = document.getElementById("planetEffects");
  if(!wrap) return;

  // reset isi lama
  wrap.innerHTML = "";

  // matahari
  let sun = document.createElement("div");
  sun.className = "sunFX";
  wrap.appendChild(sun);

  // tampilkan SEMUA planet yang sudah unlock
  for(let i = 0; i < unlockedPlanets; i++){

    let orbit = document.createElement("div");
    orbit.className = "planetEffect";

    // ukuran orbit beda-beda
    let size = 140 + (i * 50);

    orbit.style.width = size + "px";
    orbit.style.height = size + "px";

    // speed beda
    orbit.style.animationDuration = (6 + i * 2) + "s";

    let planet = document.createElement("div");

    let type = planetColors[i];
    planet.className = "planetFX " + type;

    orbit.appendChild(planet);
    wrap.appendChild(orbit);
  }

  // hilang setelah 3 detik
  clearTimeout(window.solarTimeout);

  window.solarTimeout = setTimeout(()=>{
    wrap.innerHTML = "";
  }, 3000);
}

function triggerSolarComplete(){

  solarComplete = true;

  let wrap = document.getElementById("planetEffects");

  let burst = document.createElement("div");
  burst.className = "solarBurst";

  burst.innerHTML = "🌌 SOLAR SYSTEM COMPLETE! 🌌";

  wrap.appendChild(burst);

  setTimeout(()=>{
    burst.remove();
  }, 3000);
}

