// Загружает основную информацию о пользователе
async function loadUserInfo() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.warn('Нет userId в localStorage');
        return;
    }

    try {
        const response = await fetch(`/api/user_info/${userId}/`);
        if (!response.ok) throw new Error('Ошибка загрузки данных пользователя');

        const data = await response.json();

        // Заполнение блоков
        document.querySelector('.us_img').innerHTML = `
            <img src="${data.user_image}" alt="User Image" style="width: 100px; height: 100px; border-radius: 50%;">
        `;
        document.querySelector('.us_name').textContent = data.usernickname || 'Без ника';
        document.querySelector('.us_phone').textContent = data.phone || 'Телефон не указан';
        document.querySelector('.us_email').textContent = data.email || 'Email не указан';

    } catch (error) {
        console.error('Ошибка при загрузке информации о пользователе:', error);
    }
}

// Получить избранные объявления
async function getFavoriteAdIds() {
    const token = localStorage.getItem('accessToken');
    if (!token) return [];

    try {
        const response = await fetch('/api/user_favorit_ads/', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        if (!response.ok) throw new Error('Ошибка загрузки избранных объявлений');
        const data = await response.json();
        return data.results.map(fav => fav.ad);
    } catch (error) {
        console.error('Ошибка при загрузке избранного:', error);
        return [];
    }
}

// Добавление/удаление из избранного
async function toggleFavorite(adId, cardInfElement) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('Вы не авторизованы!');
        return;
    }

    try {
        const response = await fetch('/api/favorit_add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ad: adId })
        });

        if (!response.ok) throw new Error('Ошибка добавления в избранное');

        const isFavNow = cardInfElement.classList.toggle('favorite');
        const svgPath = cardInfElement.querySelector('path');
        if (svgPath) {
            svgPath.setAttribute('fill', isFavNow ? '#ff0000' : '#a1a8bd');
        }
    } catch (error) {
        console.error('Ошибка при добавлении в избранное:', error);
    }
}

function truncate(text, maxLength = 150) {
    return text.length > maxLength ? text.slice(0, maxLength - 1) + '…' : text;
}

// Получение названия категории по ID
async function getCategoryName(id) {
    try {
        const res = await fetch(`/api/category_by_id/${id}/`);
        if (!res.ok) throw new Error('Категория не найдена');
        const data = await res.json();
        return data.subsub_category_name || data.sub_category_name || data.category_name || 'Категория';
    } catch (error) {
        console.error('Ошибка получения категории:', error);
        return 'Категория';
    }
}

// Рендер объявлений пользователя
async function renderAds() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.warn('Нет userId в localStorage');
        return;
    }

    const container = document.querySelector('.cards');
    if (!container) {
        console.error('Контейнер .cards не найден');
        return;
    }

    try {
        const token = localStorage.getItem('accessToken');
        const favoriteAdIds = token ? await getFavoriteAdIds() : [];

        const response = await fetch(`/api/user_info/${userId}/`);
        if (!response.ok) throw new Error('Ошибка загрузки данных пользователя');
        const userInfo = await response.json();

        container.innerHTML = '';

        for (const ad of userInfo.ad_user) {
            const categoryName = await getCategoryName(ad.category);
            const isFavorite = favoriteAdIds.includes(ad.id);

            const div = document.createElement('div');
            div.className = 'card';
            div.dataset.productId = ad.id;

            div.innerHTML = `
                <div class="card_image">
                    <img src="${ad.first_image?.image || '/static/no-image.png'}" alt="">
                </div>
                ${ad.past_price ? `<p class="old_price">${Number(ad.past_price).toLocaleString()} <span>Kgs</span></p>` : ''}
                <p class="price">${Number(ad.price).toLocaleString()} <span>Kgs</span></p>
                <p class="category">${categoryName}</p>
                <p class="discroption">${truncate(ad.description)}</p>
                <div class="card_infos">
                    <div class="user_icon" data-user-id="${userInfo.id}">
                        <img src="${userInfo.user_image || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaUTp3j_LpF5r5_gNdvW0g7p057ExdcHWbUQ&s'}" alt="">
                    </div>
                    <div class="card_inf ${isFavorite ? 'favorite' : ''}" style="cursor:pointer;">
                        <svg width="26" height="26" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M13.6385 3.11717C14.2968 3.83213 14.6666 4.80202 14.6666 5.81337C14.6666 6.82471 14.2968 7.7946 13.6385 8.50956L8.98197 13.5694C8.95632 13.5973 8.92949 13.6241 8.90155 13.6497C8.35911 14.1465 7.51566 14.1106 7.01764 13.5694L2.3611 8.50956C0.990719 7.02049 0.990719 4.60624 2.3611 3.11717C3.73147 1.6281 5.9533 1.6281 7.32367 3.11717L7.99981 3.85187L8.67594 3.11717C9.33392 2.40188 10.2265 2 11.1572 2C12.088 2 12.9806 2.40188 13.6385 3.11717Z"
                                fill="${isFavorite ? '#ff0000' : '#a1a8bd'}" />
                        </svg>
                    </div>
                </div>
            `;

            const cardInfElement = div.querySelector('.card_inf');
            cardInfElement.addEventListener('click', () => {
                toggleFavorite(ad.id, cardInfElement);
            });

            container.appendChild(div);
        }

    } catch (error) {
        console.error('Ошибка при загрузке объявлений:', error);
    }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    renderAds();
});

document.addEventListener('click', (event) => {
    const image = event.target.closest('.card_image img');
    if (image) {
        const card = image.closest('.card');
        if (card && card.dataset.productId) {
            const productId = card.dataset.productId;

            localStorage.setItem('selectedProductId', productId);

            window.location.href = 'http://127.0.0.1:8000/card_detail';
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const postBtn = document.querySelector('.ad_post');

    if (postBtn) {
        postBtn.addEventListener('click', (event) => {
            event.preventDefault();

            const accessToken = localStorage.getItem('accessToken');

            if (accessToken) {
                window.location.href = 'http://127.0.0.1:8000//ad_create';
            } else {
                document.querySelector('.log_inp').style.left = '0';
            }
        });
    }
});