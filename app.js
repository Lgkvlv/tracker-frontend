const API_BASE_URL = "https://lgkvlv.pythonanywhere.com";

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    initTelegramApp();
    initTabs();
    await loadCategories();
    await loadTransactions();
    setupForm();
});

// Инициализация Telegram WebApp
function initTelegramApp() {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand();
        tg.enableClosingConfirmation();
    }
}

// Переключение вкладок
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Убираем активный класс у всех кнопок
            tabs.forEach(t => t.classList.remove('active'));
            // Добавляем активный класс текущей кнопке
            tab.classList.add('active');
            
            // Скрываем все вкладки
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            // Показываем нужную вкладку
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.remove('hidden');
        });
    });
}

// Загрузка категорий
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/categories/`);
        if (!response.ok) throw new Error("Ошибка загрузки категорий");
        const categories = await response.json();
        renderCategories(categories);
        populateCategorySelect(categories);
    } catch (error) {
        console.error("Ошибка:", error);
        document.getElementById('categories-list').innerHTML = 
            '<p class="error">Не удалось загрузить категории</p>';
    }
}

// Загрузка транзакций
async function loadTransactions() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/transactions/`);
        if (!response.ok) throw new Error("Ошибка загрузки транзакций");
        const transactions = await response.json();
        renderTransactions(transactions);
        updateBalance(transactions);
    } catch (error) {
        console.error("Ошибка:", error);
        document.getElementById('transactions-list').innerHTML = 
            '<p class="error">Не удалось загрузить транзакции</p>';
    }
}

// Отображение категорий
function renderCategories(categories) {
    const container = document.getElementById('categories-list');
    container.innerHTML = '';
    
    if (categories.length === 0) {
        container.innerHTML = '<p>Нет категорий</p>';
        return;
    }
    
    categories.forEach(category => {
        const div = document.createElement('div');
        div.className = 'category-item';
        div.innerHTML = `
            <span>${category.name}</span>
            <span class="category-type">${category.is_income ? 'Доход' : 'Расход'}</span>
        `;
        container.appendChild(div);
    });
}

// Отображение транзакций
function renderTransactions(transactions) {
    const container = document.getElementById('transactions-list');
    container.innerHTML = '';
    
    if (transactions.length === 0) {
        container.innerHTML = '<p>Нет транзакций</p>';
        return;
    }
    
    transactions.forEach(transaction => {
        const div = document.createElement('div');
        div.className = 'transaction-item';
        div.innerHTML = `
            <div class="amount ${transaction.category.is_income ? 'income' : 'expense'}">
                ${transaction.category.is_income ? '+' : '-'}${transaction.amount} ₽
            </div>
            <div class="info">
                <span>${transaction.category.name}</span>
                <small>${new Date(transaction.date).toLocaleDateString()}</small>
            </div>
        `;
        container.appendChild(div);
    });
}

// Заполнение выпадающего списка категорий
function populateCategorySelect(categories) {
    const select = document.getElementById('category-select');
    select.innerHTML = '<option value="">Выберите категорию</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

// Обновление баланса
function updateBalance(transactions) {
    let balance = 0;
    transactions.forEach(t => {
        balance += t.category.is_income ? +t.amount : -t.amount;
    });
    document.getElementById('balance').textContent = `${balance.toFixed(2)} ₽`;
}

// Настройка формы добавления
function setupForm() {
    const form = document.getElementById('transaction-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('amount').value);
        const categoryId = document.getElementById('category-select').value;
        const date = document.getElementById('date').value || new Date().toISOString().split('T')[0];
        
        if (!amount || !categoryId) {
            alert("Заполните все поля!");
            return;
        }
        
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
                form.reset();
                await loadTransactions();
                document.querySelector('.tab[data-tab="transactions"]').click();
            } else {
                throw new Error("Ошибка сохранения");
            }
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Не удалось сохранить транзакцию");
        }
    });
}
