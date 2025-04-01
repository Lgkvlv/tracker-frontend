document.addEventListener('DOMContentLoaded', function() {
 function initApp() {
    // Проверка Telegram WebApp API
    if (!window.Telegram?.WebApp) {
      showError("Это приложение работает только в Telegram");
      return;
    }

    Telegram.WebApp.ready();
    Telegram.WebApp.expand();

    // Получаем ID пользователя
    const userId = Telegram.WebApp.initDataUnsafe?.user?.id;
    if (!userId) {
      showError("Ошибка авторизации");
      return;
    }

    updateBalance(userId);
    setupQrCode(userId);
    setupButtons(userId);
  }
    // Загрузка баланса
    function updateBalance(userId) {
    fetch(`https://lgkvlv.pythonanywhere.com/api/balance?user_id=${userId}`)
      .then(response => response.json())
      .then(data => {
        document.getElementById('balance').textContent = data.balance || 0;
      })
      .catch(error => {
        document.getElementById('balance').textContent = '0';
      });
  }

    const setupQrCode = (userId) => {
    const qrEl = document.getElementById('qr-code');
    if (!qrEl) return;

    try {
      const qr = qrcode(0, 'H'); // 'H' - высокий уровень коррекции ошибок
      qr.addData(userId.toString());
      qr.make();
      
      // Увеличиваем размер и убираем отступы
      qrEl.innerHTML = qr.createImgTag(8, 0);
      
      // Растягиваем на весь контейнер
      const qrImg = qrEl.querySelector('img');
      if (qrImg) {
        qrImg.style.width = '100%';
        qrImg.style.height = '100%';
        qrImg.style.borderRadius = '10px';
      }
      
      debugLog("QR-код сгенерирован");
    } catch (error) {
      debugLog("Ошибка генерации QR: " + error);
      qrEl.innerHTML = `<div style="
        width:100%; height:100%;
        display:flex; align-items:center; justify-content:center;
        font-family:monospace; word-break:break-all;
      ">ID: ${userId}</div>`;
    }
  };

    // Обработчик кнопки истории
    const historyBtn = document.getElementById('history-btn');
    if (historyBtn) {
      historyBtn.addEventListener('click', () => {
        Telegram.WebApp.showAlert(`История операций для пользователя ${user.id}`);
      });
    }
  } else {
    console.error('Telegram WebApp not initialized');
    // Режим тестирования без Telegram
    document.getElementById('balance').textContent = '100';
  }
});
