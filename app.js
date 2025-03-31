// Инициализация Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
}

// Состояние приложения
let currentUser = null;

// Получаем данные пользователя из Telegram
function initUser() {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    currentUser = window.Telegram.WebApp.initDataUnsafe.user;
    console.log('User ID:', currentUser.id);
  } else {
    console.warn('Telegram user not found. Using test mode.');
    currentUser = { id: 1 }; // Для теста без Telegram
  }
}

// Переключение вкладок
document.querySelectorAll('[data-tab]').forEach(button => {
  button.addEventListener('click', () => {
    const tabId = button.getAttribute('data-tab');
    
    // Убираем активный класс у всех кнопок и вкладок
    document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    
    // Добавляем активный класс выбранной кнопке и вкладке
    button.classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
  });
});

// Загрузка транзакций
async function loadTransactions() {
  if (!currentUser) return;
  
  try {
    const response = await fetch(`https://ваш-бэкенд.ру/api/transactions?user_id=${currentUser.id}`);
    const transactions = await response.json();
    
    const list = document.getElementById('transactions-list');
    list.innerHTML = transactions.map(t => `
      <li>
        <strong>${t.category}</strong>: ${t.amount} ₽
        <small>${new Date(t.date).toLocaleDateString()}</small>
      </li>
    `).join('');
    
    // Обновляем баланс
    const total = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    document.getElementById('balance').textContent = total.toFixed(2);
  } catch (error) {
    console.error('Error loading transactions:', error);
  }
}

// Загрузка категорий
async function loadCategories() {
  if (!currentUser) return;
  
  try {
    const response = await fetch(`https://ваш-бэкенд.ру/api/categories?user_id=${currentUser.id}`);
    const categories = await response.json();
    
    const list = document.getElementById('categories-list');
    list.innerHTML = categories.map(c => `<li>${c.name}</li>`).join('');
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

// Добавление транзакции
document.getElementById('transaction-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const amount = document.getElementById('amount').value;
  const category = document.getElementById('category').value;
  
  if (!currentUser || !amount || !category) return;
  
  try {
    const response = await fetch('https://ваш-бэкенд.ру/api/add_transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser.id,
        amount,
        category
      }),
    });
    
    if (response.ok) {
      document.getElementById('transaction-form').reset();
      loadTransactions(); // Обновляем список
    }
  } catch (error) {
    console.error('Error adding transaction:', error);
  }
});

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  initUser();
  loadTransactions();
  loadCategories();
});
