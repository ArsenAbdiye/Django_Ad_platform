if (localStorage.getItem('editAdId')) {
    const cityMap = {};

    document.addEventListener("DOMContentLoaded", () => {
        const datalist = document.getElementById("cityList");

        fetch('/api/citys/')
            .then(res => res.json())
            .then(data => {
                data.results.forEach(city => {
                    cityMap[city.city_name.trim().toLowerCase()] = city.id;

                    const option = document.createElement("option");
                    option.value = city.city_name;
                    datalist.appendChild(option);
                });
            });
    });

    document.addEventListener('DOMContentLoaded', function () {
        const optionsBlock = document.querySelector('.cre_options');
        if (optionsBlock) {
            optionsBlock.style.display = 'block';
        }
    });

    let workDaysId = null;
    const newImages = [];
    const deletedImageIds = [];
    const deletedEmailIds = [];
    const deletedPhoneIds = [];
    const deletedSocialIds = [];

    document.addEventListener('DOMContentLoaded', async function () {
        const adId = localStorage.getItem('editAdId');
        if (!adId) return;

        try {
            const response = await fetch(`/api/ad_detail/${adId}/`);
            const data = await response.json();

            // Сохраняем workDaysId
            workDaysId = data.work_days?.id || null;

            // Описание
            document.getElementById('cre_textarea').value = data.description || '';

            // Изображения
            const imageContainer = document.getElementById('imagePreviewContainer');
            imageContainer.innerHTML = '';
            data.images.forEach(img => {
                const image = document.createElement('img');
                image.src = img.image;
                image.dataset.id = img.id;
                image.style.cursor = 'pointer';

                image.addEventListener('click', () => {
                    imageContainer.removeChild(image);
                    if (img.id) deletedImageIds.push(img.id);
                });

                imageContainer.appendChild(image);
            });

            document.getElementById('imageInput').addEventListener('change', function () {
                const files = Array.from(this.files);
                files.forEach(file => {
                    newImages.push(file);

                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const imgEl = document.createElement('img');
                        imgEl.src = e.target.result;
                        imgEl.dataset.new = 'true';
                        imgEl.style.cursor = 'pointer';

                        imgEl.addEventListener('click', () => {
                            imageContainer.removeChild(imgEl);
                            const index = newImages.indexOf(file);
                            if (index !== -1) newImages.splice(index, 1);
                        });

                        imageContainer.appendChild(imgEl);
                    };
                    reader.readAsDataURL(file);
                });
                this.value = '';
            });

            // Цена
            document.querySelector('.cre_price_options .cre_price .cre_inps').value = data.price || '';

            // Валюта
            document.querySelectorAll('input[name="currency"]').forEach(input => {
                if (input.value === data.currency) input.checked = true;
            });

            // Телефон
            document.querySelector('.cre_price_options .cre_phone .cre_inps').value = data.phone_number || '';

            // Город
            document.getElementById('cityInput').value = data.city?.city_name || '';

            // EMAIL
            const emailWrapper = document.querySelector('.cre_meails');
            emailWrapper.querySelectorAll('.cre_email').forEach(e => e.remove());
            data.emails.forEach(emailObj => {
                const div = document.createElement('div');
                div.className = 'cre_email';
                div.dataset.id = emailObj.id;
                div.innerHTML = `<input class="cre_email_inp cre_inps" type="text" value="${emailObj.email}"><button class="cre_email_btn btn_cre" type="button">удалить</button>`;
                div.querySelector('button').addEventListener('click', () => {
                    deletedEmailIds.push(emailObj.id);
                    div.remove();
                });
                emailWrapper.appendChild(div);
            });

            // PHONE
            const phoneWrapper = document.querySelector('.cre_phones');
            phoneWrapper.querySelectorAll('.cre_phone').forEach(e => e.remove());
            data.phone_numbers.forEach(phoneObj => {
                const div = document.createElement('div');
                div.className = 'cre_phone';
                div.dataset.id = phoneObj.id;
                div.innerHTML = `<input class="cre_email_inp cre_inps" type="text" value="${phoneObj.number}"><button class="cre_email_btn btn_cre" type="button">удалить</button>`;
                div.querySelector('button').addEventListener('click', () => {
                    deletedPhoneIds.push(phoneObj.id);
                    div.remove();
                });
                phoneWrapper.appendChild(div);
            });

            // SOCIAL
            const socWrapper = document.querySelector('.cre_socs');
            socWrapper.querySelectorAll('.cre_soc').forEach(e => e.remove());
            data.social_network.forEach(soc => {
                const div = document.createElement('div');
                div.className = 'cre_soc';
                div.dataset.id = soc.id;
                div.innerHTML = `<input class="cre_email_inp cre_inps" type="text" value="${soc.social_network_link}"><button class="cre_email_btn btn_cre" type="button">удалить</button>`;
                div.querySelector('button').addEventListener('click', () => {
                    deletedSocialIds.push(soc.id);
                    div.remove();
                });
                socWrapper.appendChild(div);
            });

            // WORK DAYS
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            days.forEach(day => {
                const select = document.getElementById(day);
                if (select) select.value = data.work_days[day] || '';
            });

        } catch (error) {
            console.error('Ошибка при загрузке:', error);
        }
    });


    document.addEventListener('DOMContentLoaded', () => {
        const days = {
            monday: 'Пн',
            tuesday: 'Вт',
            wednesday: 'Ср',
            thursday: 'Чт',
            friday: 'Пт',
            saturday: 'Сб',
            sunday: 'Вс'
        };

        const options = [
            'Выходной',
            'Утро',
            'День',
            'Вечер',
            'Круглосуточно'
        ];

        const container = document.getElementById('weekly-schedule');

        Object.entries(days).forEach(([key, label]) => {
            const wrapper = document.createElement('div');

            const selectLabel = document.createElement('label');
            selectLabel.textContent = `${label}: `;

            const select = document.createElement('select');
            select.name = key;
            select.id = key;

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Выбрать';
            select.appendChild(defaultOption);

            options.forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });

            selectLabel.appendChild(select);
            wrapper.appendChild(selectLabel);
            container.appendChild(wrapper);
        });
    });

    document.addEventListener('DOMContentLoaded', () => {
        // Email
        document.querySelector('.add_email_btn').addEventListener('click', () => {
            const container = document.createElement('div');
            container.className = 'cre_email';
            container.innerHTML = `
      <input class="cre_email_inp cre_inps" type="text" placeholder="Email">
      <button class="cre_email_btn btn_cre remove_btn" type="button">удалить</button>
    `;
            document.querySelector('.cre_meails').appendChild(container);
        });

        // Phone
        document.querySelector('.add_phone_btn').addEventListener('click', () => {
            const container = document.createElement('div');
            container.className = 'cre_phone';
            container.innerHTML = `
      <input class="cre_email_inp cre_inps" type="text" placeholder="Телефон">
      <button class="cre_email_btn btn_cre remove_btn" type="button">удалить</button>
    `;
            document.querySelector('.cre_phones').appendChild(container);
        });

        // Socs
        document.querySelector('.add_soc_btn').addEventListener('click', () => {
            const container = document.createElement('div');
            container.className = 'cre_soc';
            container.innerHTML = `
      <input class="cre_email_inp cre_inps" type="text" placeholder="Социальные ссылки">
      <button class="cre_email_btn btn_cre remove_btn" type="button">удалить</button>
    `;
            document.querySelector('.cre_socs').appendChild(container);
        });

        // Удаление любого доп. поля
        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('remove_btn')) {
                const parent = e.target.parentElement;
                parent.remove();
            }
        });
    });


    document.querySelector('.cre_btn').addEventListener('click', async () => {
        const id = localStorage.getItem('editAdId');
        const token = localStorage.getItem('accessToken');

        const description = document.getElementById('cre_textarea').value.trim();
        const price = document.querySelector('.cre_price_options .cre_price .cre_inps').value.trim();
        const phone_number = document.querySelector('.cre_price_options .cre_phone .cre_inps').value.trim();
        const currencyEl = document.querySelector('input[name="currency"]:checked');
        const currency = currencyEl ? currencyEl.value : null;

        const body = {
            description,
            price,
            currency,
            contact_name: "string",
            phone_number,
            hide_phone: true
        };

        try {
            await fetch(`/api/ad_update/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            // DELETE
            for (const imgId of deletedImageIds) await fetch(`/api/ad_images/${imgId}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            for (const emailId of deletedEmailIds) await fetch(`/api/email/${emailId}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            for (const phoneId of deletedPhoneIds) await fetch(`/api/phone_number/${phoneId}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            for (const socialId of deletedSocialIds) await fetch(`/api/social_netrwork/${socialId}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });

            // POST images
            for (const file of newImages) {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('ad', id);
                await fetch('/api/ad_images/', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
            }

            // POST email
            document.querySelectorAll('.cre_meails .cre_email').forEach(async el => {
                if (!el.dataset.id) {
                    const email = el.querySelector('input').value.trim();
                    if (email) {
                        await fetch('/api/email/', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ email, ad: parseInt(id) })
                        });
                    }
                }
            });

            // POST phone
            document.querySelectorAll('.cre_phones .cre_phone').forEach(async el => {
                if (!el.dataset.id) {
                    const number = el.querySelector('input').value.trim();
                    if (number) {
                        await fetch('/api/phone_number/', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ number, ad: parseInt(id) })
                        });
                    }
                }
            });

            // POST social
            document.querySelectorAll('.cre_socs .cre_soc').forEach(async el => {
                if (!el.dataset.id) {
                    const link = el.querySelector('input').value.trim();
                    if (link) {
                        await fetch('/api/social_netrwork/', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ social_network_link: link, Ad: parseInt(id) })
                        });
                    }
                }
            });

            // WORK DAYS
            const schedule = {};
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
                const el = document.getElementById(day);
                schedule[day] = el ? el.value : '';
            });

            if (workDaysId) {
                await fetch(`/api/work_days/${workDaysId}/`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            await fetch('/api/work_days/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...schedule, ad: parseInt(id) })
            });

            alert('Объявление успешно обновлено');
            localStorage.removeItem('editAdId');
            window.location.href = 'http://127.0.0.1:8000/settings';

        } catch (error) {
            alert('Ошибка сети: ' + error.message);
        }
    });


    document.addEventListener('DOMContentLoaded', () => {
        const cancelButton = document.querySelector('.btn_del');
        if (cancelButton) {
            cancelButton.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('editAdId');
                window.location.href = 'http://127.0.0.1:8000/settings';
            });
        }
    });
} else {
    const cityMap = {};


    document.addEventListener("DOMContentLoaded", () => {
        const datalist = document.getElementById("cityList");

        fetch('/api/citys/')
            .then(res => res.json())
            .then(data => {
                data.results.forEach(city => {
                    cityMap[city.city_name.trim().toLowerCase()] = city.id;

                    const option = document.createElement("option");
                    option.value = city.city_name;
                    datalist.appendChild(option);
                });
            });
    });

    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const errorContainer = document.getElementById('errorContainer');

    let selectedImages = [];

    imageInput.addEventListener('change', function () {
        const newFiles = Array.from(imageInput.files);

        if (selectedImages.length + newFiles.length > 10) {
            errorContainer.textContent = "Максимум можно загрузить 10 изображений.";
            return;
        }

        errorContainer.textContent = "";

        newFiles.forEach(file => {
            const reader = new FileReader();

            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.cursor = 'pointer';

                img.addEventListener('click', () => {
                    const index = selectedImages.indexOf(file);
                    if (index > -1) {
                        selectedImages.splice(index, 1);
                    }
                    previewContainer.removeChild(img);
                });

                previewContainer.appendChild(img);
            };

            reader.readAsDataURL(file);
            selectedImages.push(file);
        });

        imageInput.value = '';
    });

    const categoryBtn = document.getElementById('categoryToggleBtn');
    const categoryList = document.getElementById('categoryList');
    const ulCategories = categoryList.querySelector('ul');
    const selectedCategoryDiv = document.getElementById('selectedCategory');

    let isCategoryVisible = false;
    let subcategoriesCache = [];
    let subsubcategoriesCache = [];

    categoryBtn.addEventListener('click', function () {
        if (isCategoryVisible) {
            categoryList.style.display = 'none';
            isCategoryVisible = false;
            selectedCategoryDiv.innerHTML = '';
            return;
        }

        if (ulCategories.children.length === 0) {
            fetch('/api/categorys/')
                .then(res => res.json())
                .then(data => {
                    ulCategories.innerHTML = '';
                    data.results.forEach(cat => {
                        const li = document.createElement('li');
                        li.textContent = cat.category_name;
                        li.dataset.categoryId = cat.id;
                        ulCategories.appendChild(li);
                    });
                    categoryList.style.display = 'block';
                    isCategoryVisible = true;
                })
                .catch(err => console.error('Ошибка при загрузке категорий:', err));
        } else {
            categoryList.style.display = 'block';
            isCategoryVisible = true;
        }

        if (subcategoriesCache.length === 0) {
            fetch('/api/subcategorys/')
                .then(res => res.json())
                .then(data => {
                    subcategoriesCache = data.results;
                })
                .catch(err => console.error('Ошибка при загрузке подкатегорий:', err));
        }

        if (subsubcategoriesCache.length === 0) {
            fetch('/api/subsubcategorys/')
                .then(res => res.json())
                .then(data => {
                    subsubcategoriesCache = data.results;
                })
                .catch(err => console.error('Ошибка при загрузке подподкатегорий:', err));
        }
    });

    let formData = {
        subsubId: null,
        options: {}
    };

    ulCategories.addEventListener('click', event => {
        const catLi = event.target;
        const categoryId = parseInt(catLi.dataset.categoryId);
        if (!categoryId) return;

        const filteredSubcategories = subcategoriesCache.filter(
            sub => sub.parent_category === categoryId
        );

        selectedCategoryDiv.innerHTML = `
        <strong>Подкатегории:</strong>
        <ul class="subcategoriesList" id="subcategoriesList"></ul>
        <div class="subsubcategoriesContainer" id="subsubcategoriesContainer"></div>
        <div class="category_options" id="categoryOptionsContainer"></div>
    `;

        const subUl = document.getElementById('subcategoriesList');
        const subsubContainer = document.getElementById('subsubcategoriesContainer');
        const optionsContainer = document.getElementById('categoryOptionsContainer');

        subUl.innerHTML = '';
        subsubContainer.innerHTML = '';
        optionsContainer.innerHTML = '';

        formData.subsubId = null;
        formData.options = {};

        filteredSubcategories.forEach(sub => {
            const li = document.createElement('li');
            li.textContent = sub.sub_category_name;
            li.dataset.subcategoryId = sub.id;
            li.style.cursor = 'pointer';
            subUl.appendChild(li);
        });

        subUl.onclick = (subEvent) => {
            const subLi = subEvent.target;
            const subcategoryId = parseInt(subLi.dataset.subcategoryId);
            if (!subcategoryId) return;

            const filteredSubsub = subsubcategoriesCache.filter(
                subsub => subsub.parent_subcategory === subcategoryId
            );

            subsubContainer.innerHTML = `<strong>Подподкатегории:</strong><ul id="subsubList"></ul>`;
            optionsContainer.innerHTML = '';

            const subsubUl = document.getElementById('subsubList');
            subsubUl.innerHTML = '';

            formData.subsubId = null;
            formData.options = {};

            filteredSubsub.forEach(ss => {
                const li = document.createElement('li');
                li.textContent = ss.subsub_category_name;
                li.dataset.subsubId = ss.id;
                li.style.cursor = 'pointer';
                subsubUl.appendChild(li);
            });

            subsubUl.onclick = async (ssEvent) => {
                const subsubLi = ssEvent.target;
                const subsubId = parseInt(subsubLi.dataset.subsubId);
                if (!subsubId) return;

                formData.subsubId = subsubId;
                formData.options = {};

                optionsContainer.innerHTML = '<strong>Опции:</strong>';

                try {
                    const response = await fetch(`/api/category_options/${subsubId}/`);
                    if (!response.ok) throw new Error('Ошибка загрузки опций');
                    const data = await response.json();

                    data.subsubcategories.forEach(optionGroup => {
                        const groupDiv = document.createElement('div');
                        groupDiv.style.marginBottom = '10px';

                        const title = document.createElement('p');
                        title.textContent = optionGroup.option_title;
                        title.style.fontWeight = 'bold';
                        groupDiv.appendChild(title);

                        optionGroup.category_option.forEach(opt => {
                            const label = document.createElement('label');
                            label.style.display = 'block';

                            const input = document.createElement('input');
                            input.type = 'radio';
                            input.name = `option_${optionGroup.id}`;
                            input.value = opt.id;

                            input.addEventListener('change', () => {
                                formData.options[optionGroup.id] = opt.id;
                            });

                            label.appendChild(input);
                            label.appendChild(document.createTextNode(opt.option_field));
                            groupDiv.appendChild(label);
                        });

                        optionsContainer.appendChild(groupDiv);
                    });

                } catch (error) {
                    optionsContainer.innerHTML = 'Ошибка при загрузке опций';
                    console.error(error);
                }
            };
        };
    });

    // Добавляем обработчик на кнопку "Опубликовать"
    const publishBtn = document.querySelector('.cre_btn');

    publishBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const selectedCityName = document.getElementById("cityInput").value.trim().toLowerCase();
        const cityId = cityMap[selectedCityName];

        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('Токен не найден. Пожалуйста, войдите в систему.');
            return;
        }

        if (!formData.subsubId) {
            alert('Выберите подподкатегорию.');
            return;
        }

        if (Object.keys(formData.options).length === 0) {
            alert('Выберите опции категории.');
            return;
        }
        if (!cityId) {
            alert('Выберите город из выпадающего списка.');
            console.log(cityId);

            return;
        }

        const bodyCategoryOptions = {
            category: formData.subsubId,
            ad_categoy_fields: Object.entries(formData.options).map(([optionId, fieldId]) => ({
                option: parseInt(optionId),
                field: parseInt(fieldId)
            }))
        };


        try {
            const responseOptions = await fetch('/api/ad_category_options/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(bodyCategoryOptions)
            });

            if (!responseOptions.ok) {
                const errorData = await responseOptions.json();
                alert('Ошибка при отправке опций: ' + (errorData.detail || JSON.stringify(errorData)));
                return;
            }

            const dataOptions = await responseOptions.json();
            const adCategoryOptionsId = dataOptions.id;

            const formDataToSend = new FormData();

            selectedImages.forEach(file => {
                formDataToSend.append('uploaded_images', file);
            });

            formDataToSend.append('description', document.getElementById('cre_textarea').value.trim());
            formDataToSend.append('category', formData.subsubId);
            formDataToSend.append('category_options', adCategoryOptionsId);
            formDataToSend.append('price', document.querySelector('.cre_price input').value.trim());

            const currencyInput = document.querySelector('.cre_currency input[type="radio"]:checked');
            formDataToSend.append('currency', currencyInput ? currencyInput.value : '');

            formDataToSend.append('contact_name', 'Имя контакта'); // ← Замени на ввод с формы
            formDataToSend.append('phone_number', document.querySelector('.cre_phone input').value.trim());
            formDataToSend.append('hide_phone', true); // ← Или false
            formDataToSend.append('city', cityId); // ← Замени на динамический ID

            const responseAd = await fetch('/api/ad/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formDataToSend
            });

            if (!responseAd.ok) {
                const errorAd = await responseAd.json();
                alert('Ошибка при отправке объявления: ' + (errorAd.detail || JSON.stringify(errorAd)));
                return;
            }

            const dataAd = await responseAd.json();
            alert('Объявление успешно опубликовано!');
            window.location.href = 'http://127.0.0.1:8000';

        } catch (error) {
            console.error('Ошибка при отправке объявления:', error);
            alert('Ошибка при отправке данных. Попробуйте позже.');
        }
    });

}