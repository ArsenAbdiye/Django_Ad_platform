// ======= ИНИЦИАЛИЗАЦИЯ ПРИ DOMContentLoaded =======
document.addEventListener("DOMContentLoaded", function () {
    initCategoryToggle();
    initHoverCategoryLoad();
    loadAdvAll();
    initProductDetail();
});

// ======= КЭШ ДЛЯ ПОДКАТЕГОРИЙ =======
let subcategoriesCache = null;
let subsubcategoriesCache = null;

async function fetchCategories() {
    if (!subcategoriesCache || !subsubcategoriesCache) {
        const [sub, subsub] = await Promise.all([
            fetch('/api/subcategorys').then(res => res.json()),
            fetch('/api/subsubcategorys').then(res => res.json()),
        ]);
        subcategoriesCache = sub.results || sub;
        subsubcategoriesCache = subsub.results || subsub;
    }
}

// ======= ФУНКЦИИ ИНИЦИАЛИЗАЦИИ UI =======


function initCategoryToggle() {
    const toggleButton = document.querySelector('.tag_button');
    const categoryBlock = document.querySelector('.categorys');
    if (toggleButton && categoryBlock) {
        toggleButton.addEventListener('click', () => {
            categoryBlock.classList.toggle('open');
        });
    }
}

function initHoverCategoryLoad() {
    const container = document.getElementById('subcategoryContainer');
    const mainCategories = document.querySelector('.main-categories');
    if (!container || !mainCategories) return;

    mainCategories.addEventListener('mouseover', async function (event) {
        const categoryItem = event.target.closest('.category_item');
        if (!categoryItem) return;

        await fetchCategories();

        const categoryId = Number(categoryItem.dataset.id);
        const filteredSubcategories = subcategoriesCache.filter(sub => sub.parent_category === categoryId);

        container.innerHTML = '';

        if (filteredSubcategories.length > 0) {
            filteredSubcategories.forEach(sub => {
                const ul = document.createElement('ul');
                const p = document.createElement('p');
                p.textContent = sub.sub_category_name;
                ul.appendChild(p);

                const subSubs = subsubcategoriesCache.filter(ss => ss.parent_subcategory === sub.id);

                if (subSubs.length > 0) {
                    subSubs.forEach(ss => {
                        const li = document.createElement('li');
                        li.classList.add('subsub_item');
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
    });
}

// ======= РЕКЛАМА =======
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

// ======= ЗАГРУЗКА ИНФОРМАЦИИ О ПРОДУКТЕ =======
async function initProductDetail() {
    const productId = localStorage.getItem('selectedProductId');
    if (!productId) return;

    const adId = `http://127.0.0.1:8000/api/ad_detail/${productId}/`;

    try {
        const response = await fetch(adId);
        const data = await response.json();

        // Основное
        renderImages(data.images);
        renderStatistics(data); 
        
        renderOptions(data.category_options.ad_categoy_fields);
        renderDescription(data.description);
        renderCity(data.city);
        renderPrice(data); // туда можно передавать data.currency
        renderBreadcrumbs(data.category);
        
        // Новые поля:
        renderPhoneNumbers(data.phone_number, data.phone_numbers);
        renderEmails(data.emails);
        renderSocialLinks(data.social_network);
        renderUser(data.user, data.hide_phone);
        renderWorkDays(data.work_days);
        renderCreatedAt(data.created_at);


    } catch (err) {
        console.error('Ошибка при загрузке деталей:', err);
    }
}


// ======= ОТДЕЛЬНЫЕ ФУНКЦИИ РЕНДЕРА =======
function renderImages(images) {
    const mainList = document.querySelector('#main-slider .splide__list');
    const thumbList = document.querySelector('#thumbnail-slider .splide__list');
    mainList.innerHTML = '';
    thumbList.innerHTML = '';

    images.forEach(img => {
        const mainItem = document.createElement('li');
        mainItem.className = 'splide__slide';
        mainItem.innerHTML = `<img src="${img.image}" alt="Ad image">`;
        mainList.appendChild(mainItem);

        const thumbItem = document.createElement('li');
        thumbItem.className = 'splide__slide';
        thumbItem.innerHTML = `<img src="${img.image}" alt="Ad thumbnail">`;
        thumbList.appendChild(thumbItem);
    });

    const main = new Splide('#main-slider', {
        type: 'fade', heightRatio: 0.8, pagination: false, arrows: true, cover: true,
    });

    const thumbs = new Splide('#thumbnail-slider', {
        fixedWidth: 104,
        fixedHeight: 78,
        isNavigation: true,
        gap: 10,
        focus: 'center',
        pagination: false,
        cover: true,
        breakpoints: {
            640: { fixedWidth: 66, fixedHeight: 38 }
        },
    });

    main.sync(thumbs);
    main.mount();
    thumbs.mount();
}


function renderStatistics(data) {
    document.querySelector('.impressions').textContent = data.impressions ?? '0';
    document.querySelector('.views').textContent = '';
    document.querySelector('.favorites_count').textContent = data.favorites_count ?? '0';
}


function renderOptions(fields) {
    const container = document.querySelector('.details-page__params');
    container.innerHTML = '';

    fields.forEach(field => {
        const title = field.option.option_title;
        const value = field.field.option_field;

        const li = document.createElement('li');
        li.innerHTML = `<p class="LFParagraph size-14 option">${title}:</p>
                         <a class="LFLink small weight-400 value_or_field" href="#">${value}</a>`;
        container.appendChild(li);
    });
}

function renderDescription(text = '') {
    const h1 = document.querySelector('h1.discription_part');
    const p = document.querySelector('.pdes');

    if (h1) h1.textContent = text.slice(0, 50);
    if (p) p.textContent = text.slice(50);
}

function renderCity(city) {
    const cityBlock = document.querySelector('.map p');
    if (cityBlock) {
        cityBlock.textContent = city?.city_name || 'Неизвестно';
    }
}



function renderBreadcrumbs(cat) {
    const ul = document.getElementById('breadcrumb');
    ul.innerHTML = '';

    const crumbs = [];

    if (cat?.parent_subcategory?.parent_category) {
        crumbs.push({
            name: cat.parent_subcategory.parent_category.category_name,
            url: '/' + cat.parent_subcategory.parent_category.category_name.toLowerCase()
        });
    }
    if (cat?.parent_subcategory) {
        crumbs.push({
            name: cat.parent_subcategory.sub_category_name,
            url: '/' + cat.parent_subcategory.sub_category_name.toLowerCase().replace(/\s+/g, '-')
        });
    }
    if (cat?.subsub_category_name) {
        crumbs.push({
            name: cat.subsub_category_name,
            url: '/' + cat.subsub_category_name.toLowerCase().replace(/\s+/g, '-')
        });
    }

    crumbs.forEach((crumb, idx) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = crumb.url;
        a.textContent = crumb.name;
        li.appendChild(a);

        if (idx < crumbs.length - 1) {
            li.innerHTML += ' &gt;';
        }

        ul.appendChild(li);
    });
}

function renderPrice(data) {
    const priceBlock = document.querySelector('.de_price');
    if (!priceBlock) return;

    const price = Number(data.price).toLocaleString();
    const currency = data.currency || 'KGS';

    if (data.past_price) {
        const oldPrice = Number(data.past_price).toLocaleString();
        priceBlock.innerHTML = `
            <span class="old_price">${oldPrice} ${currency}</span><br>
            <span class="new_price">${price} ${currency}</span>
        `;
    } else {
        priceBlock.textContent = `${price} ${currency}`;
    }
}

function renderUser(user, hidePhone, phone) {
    const userImg = document.querySelector('.de_img img');
    const userName = document.querySelector('.de_name p');

    if (userImg && user?.user_image) {
        userImg.src = user.user_image;
    }

    if (userName && user?.usernickname) {
        userName.textContent = user.usernickname;
    }

    // Если хочешь — сюда же можно вставить номер телефона (если не скрыт)
    if (!hidePhone && phone) {
        const phoneBlock = document.querySelector('.de_phone'); // добавь этот div в HTML
        if (phoneBlock) {
            phoneBlock.textContent = `Тел: ${phone}`;
        }
    }
}


function renderPhoneNumbers(mainPhone, extraPhones) {
    const phonesBlock = document.querySelector('.de_phones');
    if (!phonesBlock) return;

    phonesBlock.innerHTML = '';

    if (mainPhone) {
        const pMain = document.createElement('p');
        pMain.textContent = `${mainPhone}`;
        phonesBlock.appendChild(pMain);
    }

    if (Array.isArray(extraPhones)) {
        extraPhones.forEach((phoneObj, index) => {
            if (phoneObj && phoneObj.number) {
                const pExtra = document.createElement('p');
                pExtra.textContent = ` ${phoneObj.number}`;
                phonesBlock.appendChild(pExtra);
            }
        });
    } else {
        console.log('extraPhones не массив или отсутствует');
    }
}

function renderEmails(emails) {
    const emailsBlock = document.querySelector('.de_emails');
    if (!emailsBlock) return;

    emailsBlock.innerHTML = '';

    if (Array.isArray(emails) && emails.length > 0) {
        emails.forEach(emailObj => {
            if (emailObj?.email) {
                const p = document.createElement('p');
                p.textContent = emailObj.email;
                emailsBlock.appendChild(p);
            }
        });
    }
}

function renderSocialLinks(socialNetworks) {
    const socialBlock = document.querySelector('.de_social');
    if (!socialBlock) return;

    socialBlock.innerHTML = '';

    if (Array.isArray(socialNetworks) && socialNetworks.length > 0) {
        socialNetworks.forEach(socialObj => {
            if (socialObj?.social_network_link) {
                const a = document.createElement('a');
                a.href = socialObj.social_network_link;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.textContent = socialObj.social_network_link; // просто ссылка как текст
                socialBlock.appendChild(a);
                socialBlock.appendChild(document.createElement('br')); // перенос строки
            }
        });
    }
}


function renderWorkDays(workDays) {
    const workBlock = document.querySelector('.de_work');
    if (!workBlock) return;

    workBlock.innerHTML = '';

    if (!workDays || typeof workDays !== 'object') {
        workBlock.textContent = '';
        return;
    }

    const daysMap = {
        monday: 'Понедельник',
        tuesday: 'Вторник',
        wednesday: 'Среда',
        thursday: 'Четверг',
        friday: 'Пятница',
        saturday: 'Суббота',
        sunday: 'Воскресенье'
    };

    for (const [key, value] of Object.entries(workDays)) {
        if (daysMap[key]) {
            const p = document.createElement('p');
            p.textContent = `${daysMap[key]}: ${value || '—'}`;
            workBlock.appendChild(p);
        }
    }
}

function renderCreatedAt(createdAt) {
    const createBlock = document.querySelector('.de_create');
    if (!createBlock) return;

    if (!createdAt) {
        createBlock.textContent = 'Дата не указана';
        return;
    }

    // Преобразуем строку в объект Date
    const date = new Date(createdAt);

    // Форматируем дату в удобный вид, например: 25.06.2025 16:38
    const formattedDate = date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    createBlock.textContent = `${formattedDate}`;
}

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