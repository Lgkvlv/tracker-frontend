document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram WebApp
    const tg = window.Telegram.WebApp;
    tg.expand();
    
    // Получаем данные пользователя
    const initData = tg.initData || '';
    const user = tg.initDataUnsafe.user;
    
    // Устанавливаем заголовок
    if (user) {
        document.querySelector('h1').textContent = `Привет, ${user.first_name}!`;
    }
    
    // Инициализация табов
    initTabs();
    
    // Загружаем данные
    loadTransactions();
    loadCategories();
    
    // Инициализация форм
    initForms();
});

function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Удаляем активный класс у всех табов
            tabs.forEach(t => t.classList.remove('active'));
            
            // Добавляем активный класс текущему табу
            tab.classList.add('active');
            
            // Скрываем все табы контента
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            // Показываем соответствующий контент
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.remove('hidden');
        });
    });
}

async function loadTransactions() {
    try {
        const response = await fetch('/api/transactions/');
        const transactions = await response.json();
        renderTransactions(transactions);
        updateBalance(transactions);
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

async function loadCategories() {
    try {
        const response = await fetch('/api/categories/');
        const categories = await response.json();
        renderCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function renderTransactions(transactions) {
    const container = document.getElementById('transactions-tab');
    container.innerHTML = '<h2>Последние операции</h2>';
    
    if (transactions.length === 0) {
        container.innerHTML += '<p>Нет операций</p>';
        return;
    }
    
    const list = document.createElement('div');
    list.className = 'transactions-list';
    
    transactions.forEach(transaction => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        item.innerHTML = `
            <div class="transaction-amount ${transaction.category.is_income ? 'income' : 'expense'}">
                ${transaction.category.is_income ? '+' : '-'}${transaction.amount} ₽
            </div>
            <div class="transaction-info">
                <div class="transaction-category">${transaction.category.name}</div>
                <div class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</div>
            </div>
        `;
        list.appendChild(item);
    });
    
    container.appendChild(list);
}

function renderCategories(categories) {
    const container = document.getElementById('categories-tab');
    container.innerHTML = '<h2>Категории</h2>';
    
    if (categories.length === 0) {
        container.innerHTML += '<p>Нет категорий</p>';
        return;
    }
    
    const list = document.createElement('div');
    list.className = 'categories-list';
    
    categories.forEach(category => {
        const item = document.createElement('div');
        item.className = 'category-item';
        item.innerHTML = `
            <div class="category-name">${category.name}</div>
            <div class="category-type">${category.is_income ? 'Доход' : 'Расход'}</div>
        `;
        list.appendChild(item);
    });
    
    container.appendChild(list);
}

function updateBalance(transactions) {
    let balance = 0;
    
    transactions.forEach(transaction => {
        if (transaction.category.is_income) {
            balance += parseFloat(transaction.amount);
        } else {
            balance -= parseFloat(transaction.amount);
        }
    });
    
    document.getElementById('balance').textContent = `${balance.toFixed(2)} ₽`;
}

function initForms() {
    // Инициализация формы добавления транзакции
    const addForm = document.createElement('div');
    addForm.innerHTML = `
        <h2>Добавить операцию</h2>
        <form id="add-transaction-form">
            <div class="form-group">
                <label for="amount">Сумма</label>
                <input type="number" id="amount" step="0.01" required>
            </div>
            
            <div class="form-group">
                <label for="category">Категория</label>
                <select id="category" required>
                    <!-- Категории будут загружены динамически -->
                </select>
            </div>
            
            <div class="form-group">
                <label for="description">Описание (необязательно)</label>
                <textarea id="description"></textarea>
            </div>
            
            <div class="form-group">
                <label for="date">Дата</label>
                <input type="date" id="date" required>
            </div>
            
            <button type="submit" class="btn">Добавить</button>
        </form>
    `;
    
    document.getElementById('add-tab').appendChild(addForm);
    
    // Заполняем категории в форме
    fetch('/api/categories/')
        .then(response => response.json())
        .then(categories => {
            const select = document.getElementById('category');
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        });
    
    // Обработка отправки формы
    document.getElementById('add-transaction-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            amount: document.getElementById('amount').value,
            category_id: document.getElementById('category').value,
            description: document.getElementById('description').value,
            date: document.getElementById('date').value
        };
        
        try {
            const response = await fetch('/api/transactions/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                // Обновляем список транзакций
                loadTransactions();
                // Переключаемся на вкладку транзакций
                document.querySelector('.tab[data-tab="transactions"]').click();
                // Очищаем форму
                this.reset();
            }
        } catch (error) {
            console.error('Error adding transaction:', error);
        }
    });
}

// Вспомогательная функция для получения CSRF токена
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}