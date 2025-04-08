// Debug-логирование
function debugLog(message) {
  console.log(message);
  const debugEl = document.getElementById('debug');
  if (debugEl) {
    debugEl.innerHTML += `<div>${new Date().toLocaleTimeString()}: ${message}</div>`;
  }
}

function showError(msg) {
  const el = document.createElement('div');
  el.style.color = 'red';
  el.style.padding = '10px';
  el.textContent = msg;
  document.body.prepend(el);
}

function updateBalance(userId) {
  const balanceElement = document.getElementById('balance');
  const apiUrl = `https://lgkvlv.pythonanywhere.com/api/balance/?user_id=${userId}&_=${Date.now()}`;

  balanceElement.textContent = "...";
  balanceElement.style.color = "#666";

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      balanceElement.textContent = data.balance;
      balanceElement.style.color = "#000";
      debugLog(`Получен баланс: ${JSON.stringify(data)}`);
    })
    .catch(err => {
      balanceElement.textContent = "—";
      balanceElement.style.color = "#FF5722";
      debugLog("Ошибка: " + err.message);
    });
}

function setupQrCode(userId) {
  const qrEl = document.getElementById('qr-code');
  if (!qrEl) return;

  const overlay = document.createElement('div');
  overlay.className = 'qr-overlay';
  document.body.appendChild(overlay);

  try {
    const qr = qrcode(0, 'L');
    qr.addData(userId.toString());
    qr.make();
    qrEl.innerHTML = qr.createImgTag(4, 0);
    
    const qrImg = qrEl.querySelector('img');
    if (qrImg) {
      qrImg.style.cursor = 'pointer';
      qrImg.addEventListener('click', function() {
        qrEl.classList.toggle('enlarged');
        overlay.classList.toggle('active');
        
      
        if (qrEl.classList.contains('enlarged')) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      });
    }
    

    overlay.addEventListener('click', function() {
      qrEl.classList.remove('enlarged');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });

    debugLog("QR-код сгенерирован");
  } catch (error) {
    qrEl.innerHTML = `<div style="text-align:center;">ID: ${userId}</div>`;
    debugLog("Ошибка генерации QR: " + error);
  }
}

function setupButtons(userId) {
  document.getElementById('history-btn').addEventListener('click', () => {
    Telegram.WebApp.showAlert(`История бонусов для пользователя ${userId}:\nНачисление бонусов за регистрацию: +100`);
  });

  document.getElementById('help-btn').addEventListener('click', () => {
    Telegram.WebApp.showAlert("Покупайте изделия в нашем магазине, сканируйте QR-код и получайте бонусы");
  });
}

function initApp() {
  debugLog("Инициализация приложения...");

  if (!window.Telegram?.WebApp) {
    debugLog("Telegram WebApp не обнаружен");
    showError("Это приложение работает только в Telegram");
    return;
  }

  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
  debugLog("Telegram WebApp инициализирован");

  const userId = Telegram.WebApp.initDataUnsafe?.user?.id;
  if (!userId) {
    debugLog("Не удалось получить user_id");
    showError("Ошибка авторизации");
    return;
  }

  debugLog(`User ID: ${userId}`);
  updateBalance(userId);
  setupQrCode(userId);
  setupButtons(userId);
}

document.addEventListener('DOMContentLoaded', initApp);
