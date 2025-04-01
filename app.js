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
    const qr = qrcode(0, 'L');
    qr.addData(userId.toString());
    qr.make();
    qrEl.innerHTML = qr.createImgTag(4, 10);
    debugLog("QR-код сгенерирован");
  } catch (error) {
    debugLog("Ошибка генерации QR: " + error);
    qrEl.innerHTML = `<div style="
      width:100%; height:100%;
      display:flex; align-items:center; justify-content:center;
      font-family:monospace; word-break:break-all;
    ">ID: ${userId}</div>`;
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
