const startBtn = document.getElementById('startBtn');
const minutesInput = document.getElementById('minutes');
const message = document.getElementById('message');
const setter = document.getElementById('setter');
const alarmSound = document.getElementById('alarmSound');

let timerCheckInterval = null;
let endTime = null;

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

// Ask for notification permission
if ('Notification' in window && Notification.permission !== 'granted') {
  Notification.requestPermission();
}

startBtn.addEventListener('click', () => {
  const minutes = parseInt(minutesInput.value, 10);

  if (isNaN(minutes) || minutes < 1 || minutes > 240) {
    alert('Please enter a valid number between 1 and 240.');
    return;
  }

  //one minute should be between 55 and 65 seconds
  const oneMinute = 1000 * Math.floor(Math.random() * (65 - 55 + 1)) + 55;

  endTime = Date.now() + minutes * oneMinute * 1000;
  localStorage.setItem('timerEnd', endTime);
  localStorage.setItem('oneMinute', oneMinute);


  updateMessage();
  if (timerCheckInterval) clearInterval(timerCheckInterval);
  timerCheckInterval = setInterval(checkTimer, 1000);
});

function checkTimer() {
  const savedEndTime = parseInt(localStorage.getItem('timerEnd'), 10);
  if (!savedEndTime) return;
  const oneMinute = parseInt(localStorage.getItem('oneMinute'), 10);

  const remaining = savedEndTime - Date.now();
  if (remaining <= 0) {
    clearInterval(timerCheckInterval);
    timerCheckInterval = null;
    timerFinished();
  } else {
    const minutesLeft = Math.ceil(remaining / oneMinute);
    message.textContent = `About ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''} left`;
  }
}

function updateMessage() {
  const savedEndTime = parseInt(localStorage.getItem('timerEnd'), 10);
  if (savedEndTime) {
    const remaining = savedEndTime - Date.now();
     if (remaining <= 0) {
      // Timer expired — cancel it
      localStorage.removeItem('timerEnd');
      message.innerHTML = 'Counts down the minutes until <em>about</em> the right amount of time has passed';
      setter.style.display = 'block';
    } else {
      const oneMinute = parseInt(localStorage.getItem('oneMinute'), 10);
      const remaining = savedEndTime - Date.now();
      const minutesLeft = Math.ceil(remaining / oneMinute);
      message.textContent = `About ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''} left`;
      setter.style.display = 'none';
    }
  } else {
    message.innerHTML = 'Counts down the minutes until <em>about</em> the right amount of time has passed';
  }
}

function timerFinished() {
  message.textContent = 'Time is up!';
  alarmSound.play();
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'TIMER_DONE' });
  }
}

// Restore timer on page load
window.addEventListener('load', () => {
  updateMessage();

  const savedEndTime = parseInt(localStorage.getItem('timerEnd'), 10);
  if (savedEndTime && savedEndTime > Date.now()) {
    timerCheckInterval = setInterval(checkTimer, 1000);
  }
});

