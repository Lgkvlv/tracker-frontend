const API_BASE_URL = "https://lgkvlv.pythonanywhere.com";

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initTelegramApp();
    initTabs();
    loadData();
    setupEventListeners();
});

// Работа с Telegram WebApp
function initTelegramApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand(); // Растягиваем на весь экран
        tg.enableClosingConfirmation(); // Подтверждение закрытия
    }
}

// Загрузка данных с сервера
async function loadData() {
    try {
        const [transactions, categories] = await Promise.all([
            fetch(`${API_BASE_URL}/api/transactions/`).then(res => res.json()),
            fetch(`${API_BASE_URL}/api/categories/`).then(res => res.json())
        ]);
        
        renderTransactions(transactions);
        renderCategories(categories);
        updateBalance(transactions);
        populateCategorySelect(categories);
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }
}

// Рендер списка транзакций
function renderTransactions(transactions) {
    const container = document.getElementById('transactions-tab');
    container.innerHTML = '<h2>Последние транзакции</h2>';
    
    if (transactions.length === 0) {
        container.innerHTML += '<p>Нет операций</p>';
        return;
    }

    const list = document.createElement('div');
    transactions.forEach(t => {
        list.innerHTML += `
            <div class="transaction">
                <span class="amount ${t.category.is_income ? 'income' : 'expense'}">
                    ${t.category.is_income ? '+' : '-'}${t.amount} ₽
                </span>
                <span>${t.category.name}</span>
                <small>${new Date(t.date).toLocaleDateString()}</small>
            </div>
        `;
    });
    container.appendChild(list);
}

// Добавление новой транзакции
async function addTransaction(amount, categoryId, date) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/transactions/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount,
                category_id: categoryId,
                date: date
            })
        });
        
        if (response.ok) {
            loadData(); // Перезагружаем данные
            document.querySelector('.tab[data-tab="transactions"]').click();
        }
    } catch (error) {
        console.error("Ошибка добавления:", error);
    }
}

// Назначаем обработчики событий
function setupEventListeners() {
    // Кнопка "Добавить"
    document.getElementById('add-transaction-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('amount').value);
        const categoryId = document.getElementById('category').value;
        const date = document.getElementById('date').value || new Date().toISOString().split('T')[0];
        
        if (amount && categoryId) {
            addTransaction(amount, categoryId, date);
            this.reset();
        }
    });
}
