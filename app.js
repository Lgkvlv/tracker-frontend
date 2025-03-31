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

    // Генерация QR-кода (простая версия)
    const qrContainer = document.getElementById('qr-code');
    if (qrContainer) {
      qrContainer.innerHTML = `<svg width="150" height="150" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="#fff"/>
        <text x="50" y="50" font-size="10" text-anchor="middle">${user.id}</text>
      </svg>`;
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
