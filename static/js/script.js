


async function loadAdvAll() {
    try {
        const response = await fetch('/api/advertisments/');
        if (!response.ok) throw new Error('Ошибка загрузки рекламы');
        const data = await response.json();
        const adverts = data.results || [];

        if (adverts.length === 0) return;

        const link = document.getElementById('adv-link');
        const img = document.getElementById('adv-img');

        let currentIndex = 0;

        function showAd(index) {
            link.href = adverts[index].advertisment_url || '#';
            img.src = adverts[index].advertisment_image || '';
        }

        showAd(currentIndex);

        setInterval(() => {
            currentIndex = (currentIndex + 1) % adverts.length;
            showAd(currentIndex);
        }, 30000);

    } catch (error) {
        console.error('Ошибка при загрузке рекламы:', error);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadAdvAll();
});
document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById('subcategoryContainer');
    const mainCategories = document.querySelector('.main-categories');

    mainCategories.addEventListener('mouseover', function (event) {
        const categoryItem = event.target.closest('.category_item');
        if (!categoryItem) return;

        const categoryId = categoryItem.dataset.id;

        Promise.all([
            fetch('/api/subcategorys').then(res => res.json()),
            fetch('/api/subsubcategorys').then(res => res.json())
        ])
            .then(([subcategoriesData, subsubcategoriesData]) => {
                const subcategories = Array.isArray(subcategoriesData)
                    ? subcategoriesData
                    : (subcategoriesData.subcategories || subcategoriesData.results || []);

                const subsubcategories = Array.isArray(subsubcategoriesData)
                    ? subsubcategoriesData
                    : (subsubcategoriesData.subsubcategories || subsubcategoriesData.results || []);

                const filteredSubcategories = subcategories.filter(sub => sub.parent_category === Number(categoryId));

                container.innerHTML = ''; // очищаем контейнер

                if (filteredSubcategories.length > 0) {
                    filteredSubcategories.forEach(sub => {
                        const ul = document.createElement('ul');


                        const p = document.createElement('p');
                        p.textContent = sub.sub_category_name;
                        p.id = `${sub.id}`;
                        p.classList.add('subcategory');
                        ul.appendChild(p);

                        const subSubs = subsubcategories.filter(ss => ss.parent_subcategory === sub.id);

                        if (subSubs.length > 0) {
                            subSubs.forEach(ss => {
                                const li = document.createElement('li');
                                li.classList.add('subsub_item');
                                li.id = `${ss.id}`; // ✅ уникальный ID для под-подкатегории
                                li.textContent = ss.subsub_category_name;
                                ul.appendChild(li);
                            });
                        } else {
                            const li = document.createElement('li');
                            li.textContent = 'Нет под-подкатегорий';
                            ul.appendChild(li);
                        }

                        container.appendChild(ul);
                    });
                } else {
                    container.textContent = 'Нет подкатегорий';
                }
                document.querySelectorAll('.subcategory').forEach(item => {
                    item.addEventListener('click', () => {
                        console.log('aboba');

                        const subcategoryId = item.id;
                        const url = new URL('http://127.0.0.1:8000/cards_search');
                        url.searchParams.set('subcategory', subcategoryId);
                        window.location.href = url.toString();
                    });
                });
                document.querySelectorAll('.subsub_item').forEach(item => {
                    item.addEventListener('click', () => {
                        const subsubcategoryId = item.id;
                        const url = new URL('http://127.0.0.1:8000/cards_search');
                        url.searchParams.set('subsub_category', subsubcategoryId);
                        window.location.href = url.toString();
                    });
                });
            })
            .catch(error => {
                console.error('Ошибка при получении данных:', error);
            });
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.querySelector('.tag_button');
    const categoryBlock = document.querySelector('.categorys');

    toggleButton.addEventListener('click', function () {
        categoryBlock.classList.toggle('open');
    });
});



const container = document.querySelector('.cards');

function truncate(text, maxLength = 150) {
    return text.length > maxLength ? text.slice(0, maxLength - 1) + '…' : text;
}

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

async function getFavoriteAdIds() {
    try {
        const response = await fetch('/api/user_favorit_ads/', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
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

        // Переключаем класс favorite
        const isFavNow = cardInfElement.classList.toggle('favorite');

        // Меняем цвет иконки в SVG в зависимости от состояния
        const svgPath = cardInfElement.querySelector('path');
        if (svgPath) {
            svgPath.setAttribute('fill', isFavNow ? '#ff0000' : '#a1a8bd');
        }
    } catch (error) {
        console.error('Ошибка при добавлении в избранное:', error);
    }
}

async function renderAds() {
    try {
        const token = localStorage.getItem('accessToken');

        // Запрос избранных только если есть токен
        const favoriteAdIds = token ? await getFavoriteAdIds() : [];

        const adsResponse = await fetch('/api/ad_card/');

        if (!adsResponse.ok) throw new Error('Ошибка загрузки объявлений');
        const ads = await adsResponse.json();

        container.innerHTML = ''; // очистка контейнера перед рендером

        for (const ad of ads) {
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
                    <div class="user_icon" data-user-id='${ad.user.id}'>
                        <img src="${ad.user.user_image || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaUTp3j_LpF5r5_gNdvW0g7p057ExdcHWbUQ&s'}" alt="">
                    </div>
                    <div class="card_inf ${isFavorite ? 'favorite' : ''}" style="cursor:pointer;">
                        <svg width="26" height="26" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.6385 3.11717C14.2968 3.83213 14.6666 4.80202 14.6666 5.81337C14.6666 6.82471 14.2968 7.7946 13.6385 8.50956L8.98197 13.5694C8.95632 13.5973 8.92949 13.6241 8.90155 13.6497C8.35911 14.1465 7.51566 14.1106 7.01764 13.5694L2.3611 8.50956C0.990719 7.02049 0.990719 4.60624 2.3611 3.11717C3.73147 1.6281 5.9533 1.6281 7.32367 3.11717L7.99981 3.85187L8.67594 3.11717C9.33392 2.40188 10.2265 2 11.1572 2C12.088 2 12.9806 2.40188 13.6385 3.11717Z" fill="${isFavorite ? '#ff0000' : '#a1a8bd'}"/>
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
renderAds();


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


document.querySelector('.btnsearch').addEventListener('click', () => {
    const input = document.querySelector('.inpsearch');
    const query = input.value.trim();

    const url = new URL('http://127.0.0.1:8000/cards_search');
    if (query) {
        url.searchParams.set('description', query);
    }
    window.location.href = url.toString();
});


document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.category_item').forEach(item => {
        item.addEventListener('click', () => {
            const categoryId = item.dataset.id;
            const url = new URL('http://127.0.0.1:8000/cards_search');
            url.searchParams.set('category', categoryId);
            window.location.href = url.toString();
        });
    });

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


document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (e) => {
        const userIcon = e.target.closest('.user_icon');
        if (!userIcon) return;

        const userId = userIcon.dataset.userId;
        if (!userId) return;

        localStorage.setItem('userId', userId);
        window.location.href = 'http://127.0.0.1:8000/user';
    });
});