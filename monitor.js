// Настройки
const CONFIG = {
  PUBLIC_IP: '78.36.107.173',  // Ваш публичный IP
  SERVER_PORT: 25565,               // Порт сервера
  REFRESH_INTERVAL: 30000,       // 30 секунд между автообновлениями
  API_URL: `https://api.mcsrvstat.us/2/78.36.107.173`
};

// Элементы DOM
const statusBox = document.getElementById('statusBox');
const publicIpElem = document.getElementById('publicIp');
const portElem = document.getElementById('port');
const playersElem = document.getElementById('players');
const versionElem = document.getElementById('version');
const motdElem = document.getElementById('motd');


// Установка начальных значений
publicIpElem.textContent = CONFIG.PUBLIC_IP;
portElem.textContent = CONFIG.SERVER_PORT;

// Функция: выполнить запрос с таймаутом (без AbortController)
function fetchWithTimeout(url, options, timeout = 5000) {
  return new Promise((resolve, reject) => {
    // Устанавливаем таймаут
    const timeoutId = setTimeout(() => {
      reject(new Error('Таймаут запроса'));
    }, timeout);

    // Выполняем fetch
    fetch(url, options)
      .then(response => {
        clearTimeout(timeoutId); // Отменяем таймаут при получении ответа
        resolve(response);
      })
      .catch(err => {
        clearTimeout(timeoutId); // Отменяем таймаут при ошибке
        reject(err);
      });
  });
}

// Функция: обновить статус сервера
async function updateStatus() {
  statusBox.textContent = 'Проверяю...';
  statusBox.className = 'status-box loading';

  try {
    // Выполняем запрос с таймаутом 5 секунд
    const response = await fetchWithTimeout(
      CONFIG.API_URL,
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors',
        cache: 'no-store'
      },
      5000
    );

    // Проверяем статус ответа
    if (!response.ok) {
      statusBox.textContent = 'Сервер офлайн';
      statusBox.className = 'status-box offline';
      return;
    }

    const data = await response.json();

    // Обработка ответа
    if (data.online) {
      statusBox.textContent = 'Сервер онлайн';
      statusBox.className = 'status-box online';
      playersElem.textContent = `${data.players?.online ?? 0}/${data.players?.max ?? '?'}`;
      versionElem.textContent = data.version ?? 'Неизвестно';
      motdElem.textContent = data.description ?? 'Нет данных';
    } else {
      statusBox.textContent = 'Сервер офлайн';
      statusBox.className = 'status-box offline';
    }
  } catch (error) {
    console.error('Ошибка при проверке статуса:', error.message);
    
    if (error.message === 'Таймаут запроса') {
      statusBox.textContent = 'Таймаут запроса';
      statusBox.className = 'status-box offline';
    } else {
      statusBox.textContent = 'Не удалось получить данные';
      statusBox.className = 'status-box offline';
    }
  }
}

// Функция: ручное обновление
function manualRefresh() {
  updateStatus();
}

// Автообновление
setInterval(updateStatus, CONFIG.REFRESH_INTERVAL);

// Первое обновление при загрузке
window.addEventListener('load', updateStatus);
