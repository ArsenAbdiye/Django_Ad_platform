document.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        console.warn('Токен не найден, пользователь не авторизован.');
        return;
    }

    fetch('http://127.0.0.1:8000/api/user_options/0/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка при получении данных профиля');
        }
        return response.json();
    })
    .then(data => {
        const imgTag = document.querySelector('.user_image_setin img');
        if (imgTag && data.user_image) {
            imgTag.src = data.user_image;
        }

        const nameInput = document.querySelector('.user_name_set input');
        if (nameInput && data.usernickname) {
            nameInput.value = data.usernickname;
        }

        const aboutTextarea = document.querySelector('.user_disc_set textarea');
        if (aboutTextarea && data.user_discription) {
            aboutTextarea.value = data.user_discription.replace(/<\/?[^>]+(>|$)/g, "");
        }

        const phoneField = document.querySelector('.ph_li_set');
        if (phoneField && data.phone) {
            phoneField.textContent = data.phone;
        }

        const emailField = document.querySelector('.em_li_set');
        if (emailField && data.email) {
            emailField.textContent = data.email;
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
});



document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('userFileInput');
    const chooseBtn = document.querySelector('.user_img_btn_set button:first-child');
    const deleteBtn = document.querySelector('.user_img_btn_set button:last-child');
    const imageTag = document.querySelector('.user_image_setin img');

    const storedImage = localStorage.getItem('user_profile_image');
    if (storedImage && imageTag) {
        imageTag.src = storedImage;
    }

    chooseBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const imageUrl = event.target.result;
                imageTag.src = imageUrl;
                localStorage.setItem('user_profile_image', imageUrl); 
            };
            reader.readAsDataURL(file);
        }
    });

    deleteBtn.addEventListener('click', () => {
        imageTag.src = '';
        localStorage.removeItem('user_profile_image');
        fileInput.value = ''; 
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('userNameInput');
    const aboutTextarea = document.getElementById('userAboutTextarea');

    const savedName = localStorage.getItem('user_name');
    const savedAbout = localStorage.getItem('user_about');

    if (savedName) {
        nameInput.value = savedName;
    }

    if (savedAbout) {
        aboutTextarea.value = savedAbout;
    }

    nameInput.addEventListener('input', () => {
        localStorage.setItem('user_name', nameInput.value);
    });

    aboutTextarea.addEventListener('input', () => {
        localStorage.setItem('user_about', aboutTextarea.value);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.querySelector('.save_set');

    saveBtn.addEventListener('click', async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            alert('Вы не авторизованы');
            return;
        }

        const userImage = localStorage.getItem('user_profile_image'); 
        const userName = document.getElementById('userNameInput').value;
        const userAbout = document.getElementById('userAboutTextarea').value;

        const imageBlob = userImage ? dataURLtoBlob(userImage) : null;
        const formData = new FormData();

        if (imageBlob) {
            formData.append('user_image', imageBlob, 'profile.jpg');
        }

        formData.append('usernickname', userName || '');
        formData.append('user_discription', userAbout || '');
        formData.append('is_vip', false);  
        formData.append('is_pro', false);  

        try {
            const response = await fetch('http://127.0.0.1:8000/api/user_options/0/', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: formData,
            });

            if (response.ok) {
                alert('Данные успешно сохранены!');
            } else {
                const errorData = await response.json();
                console.error('Ошибка:', errorData);
                alert('Ошибка при сохранении данных');
            }
        } catch (error) {
            console.error('Ошибка при отправке:', error);
            alert('Ошибка соединения');
        }
    });

    function dataURLtoBlob(dataURL) {
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], { type: mimeString });
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const blockMap = {
        'user_li_set': 'main_info_set',
        'email_li_set': 'mail_set',
        'phone_li_set': 'phone_set',
        'pass_li_set': 'pass_set',
    };

    const contentBlocks = Object.values(blockMap).map(cls => document.querySelector(`.${cls}`));

    Object.entries(blockMap).forEach(([liClass, contentClass]) => {
        const trigger = document.querySelector(`.${liClass}`);
        const content = document.querySelector(`.${contentClass}`);

        if (trigger && content) {
            trigger.addEventListener('click', () => {
                // Скрыть все блоки
                contentBlocks.forEach(block => {
                    if (block) block.style.display = 'none';
                });

                // Показать нужный блок
                content.style.display = 'block';
            });
        }
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const saveButton = document.querySelector('.pass_btn_set');

    if (saveButton) {
        saveButton.addEventListener('click', async () => {
            const currentPassword = document.querySelector('.current_pass').value.trim();
            const newPassword = document.querySelector('.new_pass').value.trim();
            const confirmPassword = document.querySelector('.confirm_pass').value.trim();

            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('Вы не авторизованы.');
                return;
            }

            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Пожалуйста, заполните все поля.');
                return;
            }

            if (newPassword !== confirmPassword) {
                alert('Пароли не совпадают.');
                return;
            }
            if (newPassword.length < 8) {
                alert('Новый пароль должен содержать минимум 8 символов.');
                return;
            }

            try {
                const response = await fetch('/api/user/change-password/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        current_password: currentPassword,
                        new_password: newPassword,
                        new_password_confirm: confirmPassword
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Пароль успешно изменён.');
                } else {
                    alert(`Ошибка: ${data.detail || 'Не удалось изменить пароль.'}`);
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при отправке запроса.');
            }
        });
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const savePhoneBtn = document.querySelector('.save_set_phone');

    if (savePhoneBtn) {
        savePhoneBtn.addEventListener('click', async () => {
            const phoneInput = document.querySelector('.phone_input');
            if (!phoneInput) {
                alert('Поле телефона не найдено.');
                return;
            }

            const phone = phoneInput.value.trim();
            const token = localStorage.getItem('accessToken');

            if (!token) {
                alert('Вы не авторизованы.');
                return;
            }

            if (!phone || phone.length < 6) {
                alert('Введите корректный номер телефона.');
                return;
            }

            try {
                const response = await fetch('/api/user_contacts/0/', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        phone: phone
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Телефон успешно обновлён.');
                } else {
                    alert(`Ошибка: ${data.detail || 'Не удалось обновить телефон.'}`);
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при отправке запроса.');
            }
        });
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const saveEmailBtn = document.querySelector('.save_set_email');

    if (saveEmailBtn) {
        saveEmailBtn.addEventListener('click', async () => {
            const emailInput = document.querySelector('.email_input');
            if (!emailInput) {
                alert('Поле email не найдено.');
                return;
            }

            const email = emailInput.value.trim();
            const token = localStorage.getItem('accessToken');

            if (!token) {
                alert('Вы не авторизованы.');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Введите корректный email.');
                return;
            }

            try {
                const response = await fetch('/api/user_contacts/0/', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        email: email
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Email успешно обновлён.');
                } else {
                    alert(`Ошибка: ${data.detail || 'Не удалось обновить email.'}`);
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при отправке запроса.');
            }
        });
    }
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
        // Предположим, что в ответе есть поле с названием категории, например subsub_category_name или category_name
        return data.subsub_category_name || data.sub_category_name || data.category_name || 'Категория';
    } catch (error) {
        console.error('Ошибка получения категории:', error);
        return 'Категория';
    }
}

async function renderAds() {
    try {
        const container = document.querySelector('.cards.cards_ser');
        container.innerHTML = '';

        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('Пользователь не авторизован');

        const response = await fetch('/api/get_ads_by_user/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Ошибка загрузки объявлений');

        const ads = await response.json();

        for (const ad of ads) {
            const div = document.createElement('div');
            div.className = 'card card_ser card_set';

            if (ad.is_deactivate) {
                div.classList.add('gray-filter');
            }

            div.dataset.productId = ad.id;

            div.innerHTML = `
                <div class="card_image card_image_ser">
                    <img src="${ad.first_image?.image ?? '/static/no-image.png'}" alt="">
                </div>
                <div class="card_infos_ser">
                    ${ad.past_price ? `<p class="old_price">${Number(ad.past_price).toLocaleString()} <span>Kgs</span></p>` : ''}
                    <p class="price old_price_ser">${Number(ad.price).toLocaleString()} <span>Kgs</span></p>
                    <p class="discroption">${truncate(ad.description)}</p>
                </div>
                <div class="card_btns_set">
                    <button class="set_toggle">${ad.is_deactivate ? 'Активировать' : 'Деактивировать'}</button>
                    <button class="set_red"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.6653 3.93277L19.7866 6.05409L6.51074 19.3299L3.49483 20.4056L4.41365 17.1844L17.6653 3.93277Z" stroke="#a1a8bd" stroke-width="2"></path></svg> Редактировать</button>
                    <button class="set_del"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#a1a8bd" d="M3.28114 2.21979C2.98806 1.92674 2.51289 1.92674 2.21981 2.21979C1.92673 2.51284 1.92673 2.98798 2.21981 3.28103L10.9387 11.9992L2.21981 20.7173C1.92673 21.0104 1.92673 21.4855 2.21981 21.7786C2.51289 22.0716 2.98806 22.0716 3.28114 21.7786L12 13.0604L20.7189 21.7785C21.0119 22.0716 21.4871 22.0716 21.7802 21.7785C22.0733 21.4854 22.0733 21.0103 21.7802 20.7173L13.0614 11.9992L21.7802 3.28109C22.0733 2.98804 22.0733 2.51291 21.7802 2.21985C21.4871 1.9268 21.0119 1.9268 20.7189 2.21985L12 10.9379L3.28114 2.21979Z"></path></svg> Удалить</button>
                </div>
            `;

            // Обработка toggle
            div.querySelector('.set_toggle').addEventListener('click', async () => {
                const res = await fetch(`/api/ad/${ad.id}/deactivate/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await res.json();

                if (res.ok) {
                    alert(result.detail);
                    renderAds(); // Обновим всё
                } else {
                    alert(result.detail || 'Ошибка при переключении статуса');
                }
            });
            const delBtn = div.querySelector('.set_del');

            delBtn.addEventListener('click', async () => {
                if (!confirm('Вы уверены, что хотите удалить это объявление?')) return;

                const res = await fetch(`/api/ad/${ad.id}/`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    alert('Объявление удалено.');
                    renderAds();
                } else {
                    alert('Ошибка при удалении.');
                }
            });

            container.appendChild(div);

            const editBtn = div.querySelector('.set_red');
            editBtn.addEventListener('click', () => {
                localStorage.setItem('editAdId', ad.id);
                window.location.href = 'http://127.0.0.1:8000//ad_create';
            });
        }

        if (ads.length === 0) {
            container.textContent = 'Объявлений не найдено';
        }

    } catch (error) {
        console.error('Ошибка при загрузке объявлений:', error);
    }
}

renderAds();



document.addEventListener('DOMContentLoaded', () => {
    const liMain = document.querySelector('.li_main_set');
    const liCards = document.querySelector('.li_user_cards_set');
    const liCardsFa = document.querySelector('.li_cards_fa');

    const blockMain = document.querySelector('.main_set');
    const blockCards = document.querySelector('.user_cards_set');
    const blockCardsFa = document.querySelector('.favotirs');

    function activateTab(activeLi, inactiveLis, showBlock, hideBlocks) {
        activeLi.classList.add('active_tab');
        inactiveLis.forEach(li => li.classList.remove('active_tab'));

        if (showBlock === blockCardsFa) {
            showBlock.style.display = 'block';
        } else {
            showBlock.style.display = 'flex';
        }

        hideBlocks.forEach(block => {
            block.style.display = 'none';
        });
    }

    if (liMain && liCards && liCardsFa && blockMain && blockCards && blockCardsFa) {
        liMain.addEventListener('click', () => {
            activateTab(liMain, [liCards, liCardsFa], blockMain, [blockCards, blockCardsFa]);
        });

        liCards.addEventListener('click', () => {
            activateTab(liCards, [liMain, liCardsFa], blockCards, [blockMain, blockCardsFa]);
        });

        liCardsFa.addEventListener('click', () => {
            activateTab(liCardsFa, [liMain, liCards], blockCardsFa, [blockMain, blockCards]);
        });
    }
});




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


const cards_fa = document.querySelector('.cards_fa');

async function renderFavoriteAds() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('Вы не авторизованы!');
        return;
    }

    try {
        const response = await fetch('/api/user_favorit_cards/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Ошибка загрузки избранных объявлений');

        const data = await response.json();
        const favorites = data.results;

        if (!favorites || favorites.length === 0) {
            container.innerHTML = '<p>Избранных объявлений нет</p>';
            return;
        }

        container.innerHTML = ''; // очистка контейнера

        for (const favoriteItem of favorites) {
            const ad = favoriteItem.ad;

            const categoryName = await getCategoryName(ad.category);

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
                    <div class="user_icon">
                        <img src="${ad.user.user_image || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaUTp3j_LpF5r5_gNdvW0g7p057ExdcHWbUQ&s'}" alt="">
                    </div>
                    <div class="card_inf favorite" style="cursor:pointer;">
                        <svg width="26" height="26" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.6385 3.11717C14.2968 3.83213 14.6666 4.80202 14.6666 5.81337C14.6666 6.82471 14.2968 7.7946 13.6385 8.50956L8.98197 13.5694C8.95632 13.5973 8.92949 13.6241 8.90155 13.6497C8.35911 14.1465 7.51566 14.1106 7.01764 13.5694L2.3611 8.50956C0.990719 7.02049 0.990719 4.60624 2.3611 3.11717C3.73147 1.6281 5.9533 1.6281 7.32367 3.11717L7.99981 3.85187L8.67594 3.11717C9.33392 2.40188 10.2265 2 11.1572 2C12.088 2 12.9806 2.40188 13.6385 3.11717Z" fill="#ff0000"/>
                        </svg>
                    </div>
                </div>
            `;

            const cardInfElement = div.querySelector('.card_inf');
            cardInfElement.addEventListener('click', () => {
                toggleFavorite(ad.id, cardInfElement);
            });

            cards_fa.appendChild(div);
        }
    } catch (error) {
        console.error('Ошибка при загрузке избранных объявлений:', error);
    }
}

renderFavoriteAds();


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