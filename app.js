document.addEventListener('DOMContentLoaded', function() {
  // Инициализация Telegram WebApp
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    const user = Telegram.WebApp.initDataUnsafe.user;
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    console.log('User ID:', user.id); // Для отладки

    // Загрузка баланса
    fetch(`https://lgkvlv.pythonanywhere.com/api/balance?user_id=${user.id}`)
      .then(response => response.json())
      .then(data => {
        document.getElementById('balance').textContent = data.balance || 0;
      });

   function setupQrCode(userId) {
  const qrEl = document.getElementById('qr-code');
  if (!qrEl) return;

  try {
    // 1. Инициализация генератора QR-кода
    const qr = qrcode(0, 'L');  // L - уровень коррекции ошибок (Low)
    qr.addData(userId.toString());
    qr.make();

    // 2. Создаем изображение с увеличенными модулями
    const qrImgTag = qr.createImgTag(4, 0);  // 4 - размер модуля, 0 - отступы
    
    // 3. Вставляем в контейнер
    qrEl.innerHTML = qrImgTag;
    
    // 4. Принудительно растягиваем
    const img = qrEl.querySelector('img');
    if (img) {
      img.style.width = '100%';
      img.style.height = '100%';
    }

    debugLog("QR-код сгенерирован");
  } catch (error) {
    debugLog("Ошибка генерации QR: " + error);
    qrEl.innerHTML = `<div class="qr-fallback">ID: ${userId}</div>`;
  }
}

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
