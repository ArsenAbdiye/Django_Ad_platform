document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('.burger_menu button');
    const menu = document.querySelector('.burger_menu');

    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('open');
        });
    }
});

document.querySelectorAll('.log_btn').forEach(btn => {
    btn.addEventListener('click', () => {
        closeAll();
        document.querySelector('.log_inp').style.left = '0';
    });
});

document.querySelectorAll('.log').forEach(btn => {
    btn.addEventListener('click', () => {
        closeAll();
        document.querySelector('.log_inp').style.left = '0';
    });
});

document.querySelectorAll('.reg_btn').forEach(btn => {
    btn.addEventListener('click', () => {
        closeAll();
        document.querySelector('.reg_inp').style.left = '0';
    });
});

document.querySelectorAll('.res_btn').forEach(btn => {
    btn.addEventListener('click', () => {
        closeAll();
        document.querySelector('.res_pass').style.left = '0';
    });
});

document.querySelectorAll('.modal__close').forEach(btn => {
    btn.addEventListener('click', () => {
        closeAll();
    });
});


function closeAll() {
    document.querySelector('.log_inp').style.left = '-100%';
    document.querySelector('.reg_inp').style.left = '-100%';
    document.querySelector('.res_pass').style.left = '-100%';
}



document.addEventListener('DOMContentLoaded', () => {
    // Проверка: если пользователь залогинен
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
        document.querySelector('.log')?.style.setProperty('display', 'none', 'important');
        document.querySelector('.user_info')?.style.setProperty('display', 'block', 'important');
    }

    // Авторизация по кнопке
    document.querySelector('.login_btn').addEventListener('click', async () => {
        const username = document.querySelector('.login_email_input').value.trim();
        const password = document.querySelector('.login_password_input').value.trim();

        if (!username || !password) {
            console.error('Username или password пусты');
            return;
        }

        try {
            const response = await fetch('/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                alert('Ошибка авторизации, не верный пароль либо акаунт не потвержден')
                throw new Error('Ошибка авторизации');
            }

            const data = await response.json();

            console.log('Ответ сервера:', data);

            // Сохраняем токены
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);

            // Скрываем логин и показываем инфо
            document.querySelector('.log')?.style.setProperty('display', 'none', 'important');
            document.querySelector('.user_info')?.style.setProperty('display', 'block', 'important');

            alert('Успешный вход!');

        } catch (error) {
            console.error('Ошибка при получении токена:', error);
        }
    });
});

document.querySelector('.get_out')?.addEventListener('click', () => {
    // Удаляем токены из localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Показываем блок логина и скрываем user_info
    document.querySelector('.log')?.style.setProperty('display', 'block', 'important');
    document.querySelector('.user_info')?.style.setProperty('display', 'none', 'important');

    alert('Вы вышли из аккаунта');
});

document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) return;

    try {
        const userId = 0; // Заменить на нужный ID

        const response = await fetch(`/api/user_options/${userId}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Не удалось получить данные пользователя');

        const data = await response.json();

        // Элементы
        const userImg = document.querySelector('.user_img');
        const userName = document.querySelector('.user_name');

        // Фото по умолчанию
        const defaultImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaUTp3j_LpF5r5_gNdvW0g7p057ExdcHWbUQ&s';

        // Вставка данных
        userImg.src = data.user_image || defaultImage;
        userName.textContent = data.usernickname || 'Без имени';

    } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
    }
});



document.querySelectorAll('.user_button').forEach(btn => {
    btn.addEventListener('click', () => {
        const menu = document.querySelector('.user_menu');
        const isVisible = menu.style.display === 'block';
        menu.style.display = isVisible ? 'none' : 'block'; // Переключить
    });
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.reset_btn')?.addEventListener('click', async () => {
        const email = document.querySelector('.reset_email_input')?.value.trim();

        if (!email) {
            alert('Пожалуйста, введите email');
            return;
        }

        try {
            const response = await fetch('/api/password_reset_email/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка при сбросе пароля');
            }

            alert('Новый пароль отправлен на вашу почту');

        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            alert(`Ошибка: ${error.message}`);
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const regButton = document.querySelector('.reg_btn_reg');
    const backButton = document.querySelector('.back');
    const codebtn = document.querySelector('.codebtn')

    function updateView() {
        const showCode = localStorage.getItem('showCode');
        if (showCode === 'true') {
            // Скрыть регистрацию и дополнительные блоки
            document.querySelectorAll('.loginp, .log_or_reg, .logbtns').forEach(el => el.style.display = 'none');
            // Показать код
            document.querySelectorAll('.code').forEach(el => el.style.display = 'block');
        } else {
            // Показать регистрацию и дополнительные блоки
            document.querySelectorAll('.loginp,.logbtns').forEach(el => el.style.display = 'block');
            document.querySelectorAll('.log_or_reg').forEach(el => el.style.display = 'flex');
            // Скрыть код
            document.querySelectorAll('.code').forEach(el => el.style.display = 'none');
        }
    }

    updateView();

    regButton?.addEventListener('click', async () => {
        const email = document.querySelector('.reg_inp_email')?.value.trim();
        const password = document.querySelector('.reg_enp_password')?.value.trim();
        const confirm = document.querySelector('.reg_confirm')?.checked;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Введите корректный email');
            return;
        }

        if (!password) {
            alert('Введите пароль');
            return;
        }

        if (!confirm) {
            alert('Вы должны согласиться с условиями');
            return;
        }

        try {
            const response = await fetch('/api/registry_password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Ошибка сервера:', data);
                throw new Error(data.detail || JSON.stringify(data));
            }

            localStorage.setItem('showCode', 'true');
            updateView();

            alert('Регистрация прошла успешно! Введите код из почты.');

        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            alert(`Ошибка: ${error.message}`);
        }
    });

    backButton?.addEventListener('click', () => {
        localStorage.removeItem('showCode');
        updateView();
    });

    codebtn?.addEventListener('click', () => {
        localStorage.setItem('showCode', 'true');
        updateView();
    });
});



document.addEventListener('DOMContentLoaded', () => {
    const checkBtn = document.querySelector('.check');
    const resetBtn = document.querySelector('.reset');

    checkBtn?.addEventListener('click', async () => {
        const email = document.querySelector('.code_inp_mail')?.value.trim();
        const code = document.querySelector('.code_inp')?.value.trim();

        if (!email || !code) {
            alert('Пожалуйста, введите email и код');
            return;
        }

        try {
            const response = await fetch('/api/confirm_account/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || JSON.stringify(data));
            }

            alert('Аккаунт подтвержден успешно!');

            // Если нужно, можно сбросить localStorage и показать исходный экран
            localStorage.removeItem('showCode');
            // Переключить вид, если есть функция updateView из предыдущего кода:
            if (typeof updateView === 'function') {
                updateView();
            }

        } catch (error) {
            console.error('Не верный код, либо код он истек:', error);
            alert(`Ошибка: ${error.message}`);
        }
    });

    resetBtn?.addEventListener('click', async () => {
        const email = document.querySelector('.code_inp_mail')?.value.trim();

        if (!email) {
            alert('Пожалуйста, введите email');
            return;
        }

        try {
            const response = await fetch('/api/resend_code/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || JSON.stringify(data));
            }

            alert('Код успешно отправлен повторно!');

        } catch (error) {
            console.error('Ошибка при повторной отправке кода:', error);
            alert(`Ошибка: ${error.message}`);
        }
    });
});


document.querySelector('.google_login_btn').addEventListener('click', () => {
    const clientId = '855620373622-hlvav5npqebntirnsd29nfjr42rg4f33.apps.googleusercontent.com'; 
    const scope = 'openid email profile';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth` +
        `?response_type=code` +
        `&client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent(scope)}` +
        `&access_type=offline&prompt=consent`;

    window.location.href = authUrl;
});


const clientId = '855620373622-hlvav5npqebntirnsd29nfjr42rg4f33.apps.googleusercontent.com';
const redirectUri = 'http://127.0.0.1:8000';
const scope = 'openid email profile'; 
const responseType = 'id_token';
const nonce = 'random_nonce_123456'; 

document.querySelectorAll('.google_login_btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${clientId}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=${responseType}` +
            `&scope=${encodeURIComponent(scope)}` +
            `&nonce=${nonce}` +
            `&prompt=select_account`;

        window.location.href = authUrl;
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const idToken = hashParams.get('id_token');

    if (idToken) {
        fetch('/api/auth/google/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ google_token: idToken }),
        })
            .then(res => {
                if (!res.ok) throw new Error('Ошибка авторизации');
                return res.json();
            })
            .then(data => {
                localStorage.setItem('accessToken', data.access);
                // Очистить URL от хеша
                window.history.replaceState({}, document.title, '/');
                // Обновить интерфейс, например показать пользователя
            })
            .catch(err => console.error('Ошибка авторизации:', err));
    }
});


async function loadFooter() {
    console.log('Загрузка футера началась');

    try {
        const logoDiv = document.querySelector('.fo_logo');
        const copyDiv = document.querySelector('.fo_copyright');
        const linksDiv = document.querySelector('.fo_links');

        logoDiv.innerHTML = '';
        copyDiv.textContent = '';
        linksDiv.innerHTML = '';

        // 1. Загрузка логотипа
        const logoRes = await fetch('/api/site_logo/');
        if (logoRes.ok) {
            const logoJson = await logoRes.json();
            const logoData = logoJson.results?.[0];
            if (logoData?.header_logo) {
                const img = document.createElement('img');
                img.src = logoData.header_logo;
                img.alt = 'Site Logo';
                img.classList.add('footer-logo-img');
                logoDiv.appendChild(img);
            }
        }

        // 2. Загрузка копирайта
        const copyRes = await fetch('/api/footer_copyright/');
        if (copyRes.ok) {
            const copyJson = await copyRes.json();
            const copyData = copyJson.results?.[0];
            if (copyData?.copyright) {
                copyDiv.textContent = copyData.copyright;
            }
        }

        // 3. Загрузка ссылок и создание выпадающего меню
        const linksRes = await fetch('/api/footer_links/');
        if (linksRes.ok) {
            const linksJson = await linksRes.json();
            const linksData = linksJson.results?.[0];

            if (linksData?.footer_category || Array.isArray(linksData?.link)) {
                // Добавляем класс для контейнера
                linksDiv.classList.add('footer-menu');

                // Кнопка открытия меню
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'footer-menu-toggle';
                toggleBtn.type = 'button';
                toggleBtn.textContent = `${linksData.footer_category ?? 'Ссылки'} ▾`;
                linksDiv.appendChild(toggleBtn);

                // Создаем список ссылок
                const ul = document.createElement('ul');
                ul.className = 'footer-menu-list';

                linksData.link.forEach(linkObj => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = linkObj.footer_link_url;
                    a.textContent = linkObj.footer_link_text;
                    a.target = '_blank';
                    li.appendChild(a);
                    ul.appendChild(li);
                });

                linksDiv.appendChild(ul);
            }
        }

        // 4. Обработчик открытия/закрытия меню
        document.addEventListener('click', function (e) {
            const toggleBtn = e.target.closest('.footer-menu-toggle');
            const dropdown = e.target.closest('.footer-menu');

            // Закрываем все кроме текущего
            document.querySelectorAll('.fo_links.footer-menu').forEach(d => {
                if (d !== dropdown) d.classList.remove('show');
            });

            if (toggleBtn && dropdown) {
                e.preventDefault();
                dropdown.classList.toggle('show');
            } else {
                // Клик вне меню - закрываем все
                document.querySelectorAll('.fo_links.footer-menu').forEach(d => d.classList.remove('show'));
            }
        });

    } catch (error) {
        console.error('Ошибка загрузки футера:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadFooter);