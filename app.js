// Инициализация Telegram WebApp
if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
  const user = Telegram.WebApp.initDataUnsafe.user;
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();

  // Загрузка баланса
  fetch(`https://lgkvlv.pythonanywhere.com/api/balance?user_id=${user.id}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('balance').textContent = data.balance;
    });

  // Генерация QR-кода с user_id
  new QRCode(document.getElementById('qr-code'), {
    text: user.id.toString(),
    width: 150,
    height: 150
  });

  // Кнопка истории
  document.getElementById('history-btn').addEventListener('click', () => {
    Telegram.WebApp.showAlert('История начислений появится здесь!');
  });
}
