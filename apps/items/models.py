from django.db import models
from ckeditor.fields import RichTextField

from apps.user.models import CustomUser
from apps.items.utils import directory_path

class InfoPages(models.Model):
    page_title = models.CharField('Заголовок страницы', max_length=100)
    page_text = RichTextField('Текст страницы')

    class Meta:
        verbose_name = "Инфо страница"
        verbose_name_plural = "Инфо страницы"
    def __str__(self):
        return self.page_title
    

class Category(models.Model):
    category_name = models.CharField(max_length=50,verbose_name='Название категории')
    category_image = models.ImageField('Картинка категории', upload_to=directory_path)

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категория"

    def __str__(self):  
        return self.category_name
    

class SubCategory(models.Model):
    sub_category_name = models.CharField(max_length=50,verbose_name='Название подкатегории')
    sub_category_image = models.ImageField('Картинка категории', upload_to=directory_path, null=True,blank=True)
    parent_category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories', verbose_name='Родительская категория')
    class Meta:
        verbose_name = "Подкатегория"
        verbose_name_plural = "Подкатегории"

    def __str__(self):  
        return self.sub_category_name
    

class SubSubCategory(models.Model):
    subsub_category_name = models.CharField(max_length=50,verbose_name='Название под-подкатегории')
    subsub_category_image = models.ImageField('Картинка категории', upload_to=directory_path, null=True,blank=True)
    parent_subcategory = models.ForeignKey(SubCategory, on_delete=models.CASCADE, related_name='subsubcategories', verbose_name='Родительская подкатегория')

    class Meta:
        verbose_name = "Под-подкатегория"
        verbose_name_plural = "Под-подкатегории"

    def __str__(self):  
        return self.subsub_category_name
    

class CategoryOptions(models.Model):
    option_title = models.CharField(max_length=50,verbose_name="Заголовок опции")
    subsub_category = models.ForeignKey(SubSubCategory, on_delete=models.CASCADE, related_name='subsubcategories', verbose_name='под-подкатегории')
    self_completion = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Опция категории"
        verbose_name_plural = "Опции категории"

    def __str__(self):  
        return str(self.option_title)
    

class CategoryOptionsFields(models.Model):
    option_field = models.CharField(max_length=50,verbose_name='Поле опции')
    option = models.ForeignKey(CategoryOptions, on_delete=models.CASCADE, related_name='category_option', verbose_name='Опция')

    class Meta:
        verbose_name = "Поля категории"
        verbose_name_plural = "Поля категории"

    def __str__(self):  
        return str(self.option_field)


class Citys(models.Model):
    city_name = models.CharField(max_length=50,verbose_name='Город')

    class Meta:
        verbose_name = "Город"
        verbose_name_plural = "Города"

    def __str__(self):  
        return self.city_name


class AdCategoryFields(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='category_fields',verbose_name='category_fields')
    category = models.ForeignKey(SubSubCategory, on_delete=models.CASCADE,verbose_name="Id категории")
    class Meta:
        verbose_name = "Поля категорий объявления"
        verbose_name_plural = "Поля категорий объявления"

    def __str__(self):  
        return f"{self.user}"

class ChosenFields(models.Model):
    option = models.ForeignKey(CategoryOptions,on_delete=models.CASCADE, related_name='option')
    field = models.ForeignKey(CategoryOptionsFields,on_delete=models.CASCADE, related_name='field',null=True)
    ad_categoy_fields = models.ForeignKey(AdCategoryFields, on_delete=models.CASCADE, related_name='ad_categoy_fields',verbose_name='ad_categoy_fields')

    class Meta:
        verbose_name = "Выбранное поле"
        verbose_name_plural = "Выбранные поля"

    def __str__(self):  
        return f"{self.field}"


class Ad(models.Model):
    description = models.TextField(max_length=6000, verbose_name="Описание")
    category = models.ForeignKey(SubSubCategory, on_delete=models.CASCADE,verbose_name="Id категории")
    category_options = models.ForeignKey(AdCategoryFields, on_delete=models.CASCADE,verbose_name="Поля категории")
    price = models.DecimalField(max_digits=12, decimal_places=2,verbose_name="Цена")
    past_price = models.DecimalField(max_digits=12,decimal_places=2,verbose_name='Прошлая цена',null=True)
    currency = models.CharField(max_length=3, choices=[('KGS', 'KGS'), ('USD', 'USD')], default='KGS', verbose_name="Валюта")
    contact_name = models.CharField(max_length=100, verbose_name="Имя")
    phone_number = models.CharField(max_length=20, verbose_name="Телефон",blank=True,null=True)
    hide_phone = models.BooleanField(default=False, verbose_name="Скрыть номер")
    created_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(blank=True,null=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='ad_user',verbose_name='Пользователь объявления')
    impressions = models.PositiveIntegerField(default=0,verbose_name="Показы")
    views = models.PositiveIntegerField(default=0,verbose_name="Просмотры")
    is_deactivate = models.BooleanField(default=False)
    city =models.ForeignKey(Citys, on_delete=models.CASCADE, related_name='city',verbose_name='city')


    class Meta:
        verbose_name = "Объявление"
        verbose_name_plural = "Объявления"

    def __str__(self):  
        return self.description


class AdMapСoordinates(models.Model):
    ad = models.OneToOneField('Ad', on_delete=models.CASCADE, related_name='coordinates')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, verbose_name='Широта')
    longitude = models.DecimalField(max_digits=9, decimal_places=6, verbose_name='Долгота')

    class Meta:
        verbose_name = 'Координаты карты объявления'
        verbose_name_plural = 'Координаты карты объявления'

    def __str__(self):
        return f'Локация для объявления {self.ad.id}'
    

class AdImage(models.Model):
    ad = models.ForeignKey('Ad', on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=directory_path)
    
    
    class Meta:
        verbose_name = 'Изображение объявления'
        verbose_name_plural = 'Изображения объявления'

        
class Favorit(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='favorites', verbose_name='Пользователь')
    ad = models.ForeignKey(Ad, on_delete=models.CASCADE, related_name='favorited_by', verbose_name='Объявление')

    class Meta:
        verbose_name = 'Избранное'
        verbose_name_plural = 'Избранные'
        unique_together = ('user', 'ad')


class SocialNetwork(models.Model):
    social_network_link = models.URLField(verbose_name='Ссылка социальной сети')
    ad = models.ForeignKey(Ad, related_name='social_network', on_delete=models.CASCADE)

    class Meta:
        verbose_name = 'Социальная сеть'
        verbose_name_plural = 'Социальная сети'

    def __str__(self):  
        return self.social_network_link
    

class PhoneNumber(models.Model):
    ad = models.ForeignKey(Ad, related_name='phone_numbers', on_delete=models.CASCADE)
    number = models.CharField('Номер телефона', max_length=600)

    class Meta:
        verbose_name = 'Телефон'
        verbose_name_plural = 'Телефоны'

    def __str__(self):
        return self.number


class EmailAddress(models.Model):
    ad = models.ForeignKey(Ad, related_name='emails', on_delete=models.CASCADE)
    email = models.EmailField('Email')

    class Meta:
        verbose_name = 'Email'
        verbose_name_plural = 'Emails'

    def __str__(self):
        return self.email


class Address(models.Model):
    ad = models.ForeignKey(Ad, related_name='addresses', on_delete=models.CASCADE)
    address = models.TextField('Адрес')

    class Meta:
        verbose_name = 'Адрес'
        verbose_name_plural = 'Адреса'

    def __str__(self):
        return self.address
    

class WorkDays(models.Model):
    monday = models.CharField(max_length=30, verbose_name='Понедельник', default='Круглосуточно')
    tuesday = models.CharField(max_length=30, verbose_name='Вторник', default='Круглосуточно')
    wednesday = models.CharField(max_length=30, verbose_name='Среда', default='Круглосуточно')
    thursday = models.CharField(max_length=30, verbose_name='Четверг', default='Круглосуточно')
    friday = models.CharField(max_length=30, verbose_name='Пятница', default='Круглосуточно')
    saturday = models.CharField(max_length=30, verbose_name='Суббота', default='Круглосуточно')
    sunday = models.CharField(max_length=30, verbose_name='Воскресенье', default='Круглосуточно')
    ad = models.OneToOneField(Ad, related_name='work_days', on_delete=models.CASCADE)

    class Meta:
        verbose_name = 'Дни работы'

    def __str__(self):
        return f"График работы для объявления {self.ad.id}"
    

class СategoryAdvertising(models.Model):
    title = models.CharField(max_length=250,verbose_name='Заголовок рекламы')
    category = models.ForeignKey('Category', on_delete=models.CASCADE, related_name='category_advertising', null=True, blank=True)
    subcategory = models.ForeignKey('SubCategory', on_delete=models.CASCADE, related_name='subcategories_advertising', null=True, blank=True)
    subsubcategory = models.ForeignKey('SubSubCategory', on_delete=models.CASCADE, related_name='subsubcategories_advertising', null=True, blank=True)

    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = 'Реклама категории'
        verbose_name_plural = 'Рекламы категорий'