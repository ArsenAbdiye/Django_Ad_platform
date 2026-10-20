from rest_framework import serializers
from .models import *
from apps.items.validators import validate_kg_phone_number
from django.core.exceptions import ValidationError


from apps.user.models import CustomUser

class InfoPagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = InfoPages
        fields = ['page_title','page_text','id']


class SubSubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubSubCategory
        fields = ['id', 'subsub_category_name', 'subsub_category_image', 'parent_subcategory']


class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ['id', 'sub_category_name', 'sub_category_image', 'parent_category']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'category_name', 'category_image']


class DetailCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'category_name']

class DetailSubCategorySerializer(serializers.ModelSerializer):
    parent_category = DetailCategorySerializer(read_only=True)  # вложенный Category

    class Meta:
        model = SubCategory
        fields = ['id', 'sub_category_name','parent_category']

class DetailSubSubCategorySerializer(serializers.ModelSerializer):
    parent_subcategory = DetailSubCategorySerializer(read_only=True)  # вложенный SubCategory с Category

    class Meta:
        model = SubSubCategory
        fields = ['id', 'subsub_category_name','parent_subcategory']


class CategoryOptionsFieldsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryOptionsFields
        fields = ['id', 'option_field']


class CategoryOptionsSerializer(serializers.ModelSerializer):
    category_option = CategoryOptionsFieldsSerializer(many=True, read_only=True)
    class Meta:
        model = CategoryOptions
        fields = ['id', 'option_title', 'category_option']


class CategoryOptionsDtSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryOptions
        fields = ['id', 'option_title']


class CategoryOptionsGetSerializer(serializers.ModelSerializer):
    subsubcategories = CategoryOptionsSerializer(many=True, read_only=True)
    class Meta:
        model = SubSubCategory
        fields = ['id', 'subsubcategories']

class FavoritSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorit
        fields = ['ad']

    
class PhoneNumberSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhoneNumber
        fields = ['id','number','ad']

    def validate_number(self, value):
        return validate_kg_phone_number(value)
    

class EmailAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailAddress
        fields = ['id', 'email','ad']


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'address','ad']


class SocialNetworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialNetwork
        fields = ['id','social_network_link','ad']


class WorkDaysSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkDays
        fields = ('__all__')


class AdImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdImage
        fields = ['id', 'image']


class ChosenFieldsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChosenFields
        fields = ['id', 'option', 'field']


class AdCategoryFieldsSerializer(serializers.ModelSerializer):
    ad_categoy_fields = ChosenFieldsSerializer(many=True)

    class Meta:
        model = AdCategoryFields
        fields = ['id','user','category','ad_categoy_fields']
        read_only_fields = ['user']

    def validate(self, data):
        category = data.get('category')
        chosen_fields = data.get('ad_categoy_fields', [])

        all_options = set(CategoryOptions.objects.filter(subsub_category=category).values_list('id', flat=True))
        
        chosen_options = set()
        for field_data in chosen_fields:
            option = field_data.get('option')
            if option.subsub_category != category:
                raise ValidationError(f"Опция {option} не принадлежит категории {category}")
            chosen_options.add(option.id)

        if all_options != chosen_options:
            missing_options = all_options - chosen_options
            raise ValidationError(f"Не выбраны все опции категории. Отсутствуют опции с id: {missing_options}")

        return data

    def create(self, validated_data):
        chosen_fields_data = validated_data.pop('ad_categoy_fields')
        ad_category_fields = AdCategoryFields.objects.create(**validated_data)
        for field_data in chosen_fields_data:
            ChosenFields.objects.create(ad_categoy_fields=ad_category_fields, **field_data)
        return ad_category_fields
    

class CitysSerializer(serializers.ModelSerializer):
    class Meta:
        model = Citys
        fields = ['id','city_name']


class AdSerializer(serializers.ModelSerializer):
    images = AdImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    favorites_count = serializers.SerializerMethodField()
    class Meta:
        model = Ad
        fields = ['images', 'uploaded_images', 'description', 'category','category_options', 'price',
                'currency', 'contact_name', 'phone_number', 'hide_phone',
                'created_at','favorites_count',
                'id','city']

    def get_favorites_count(self, obj):
        return obj.favorited_by.count()
    
    def validate_phone_number(self, value):
        return validate_kg_phone_number(value)
    
    def validate_contact_name(self,value):
        if len(value) < 3 :
            raise serializers.ValidationError("Имя минимум 3 символа ")
        return value
    
    def validate(self, data):
        category = data.get('category')
        category_options = data.get('category_options')

        if category_options and category_options.category != category:
            raise serializers.ValidationError({
                'category_options': 'Поля категории должны принадлежать выбранной категории.'
            })
        return data

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        ad = Ad.objects.create(**validated_data)

        for image in uploaded_images:
            AdImage.objects.create(ad=ad, image=image)
        
        return ad
    

class SimpleCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'category_name', 'category_image']


class SimpleSubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ['id', 'sub_category_name', 'sub_category_image']


class SimpleSubSubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubSubCategory
        fields = ['id', 'subsub_category_name', 'subsub_category_image']


class СategoryAdvertisingSerializer(serializers.ModelSerializer):
    category = SimpleCategorySerializer(read_only=True)
    subcategory = SimpleSubCategorySerializer(read_only=True)
    subsubcategory = SimpleSubSubCategorySerializer(read_only=True)

    class Meta:
        model = СategoryAdvertising
        fields = ['id', 'title', 'category', 'subcategory', 'subsubcategory']


class AdUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ad
        fields = ['description','price',
        'currency', 'contact_name', 'phone_number', 'hide_phone']
        
    def validate_phone_number(self, value):
        return validate_kg_phone_number(value)
    
    def validate_contact_name(self,value):
        if len(value) < 3 :
            raise serializers.ValidationError("Имя минимум 3 символа ")
        return value
    def update(self, instance, validated_data):
        new_price = validated_data.get('price')

        if new_price is not None:
            if new_price != instance.price:
                instance.past_price = instance.price  
            else:
                instance.past_price = None

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
    

class AdImageChangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdImage
        fields = ['id', 'image','ad']


class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser 
        fields = ['id', 'user_image', 'is_vip','is_pro']


class AdCardSerializer(serializers.ModelSerializer):
    user = UserShortSerializer(read_only=True)
    first_image = serializers.SerializerMethodField()
    class Meta:
        model = Ad
        fields = ['id','first_image','price','past_price','category','description','user','is_deactivate']
    
    def get_first_image(self, obj):
        first = obj.images.first()
        if first:
            return AdImageSerializer(first).data
        return None
    

class UserAdSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser 
        fields = ['id', 'user_image', 'is_vip','is_pro','usernickname']


class ChosenFieldsDetailSerializer(serializers.ModelSerializer):
    field = CategoryOptionsFieldsSerializer(read_only=True)
    option = CategoryOptionsDtSerializer(read_only=True)
    class Meta:
        model = ChosenFields
        fields = ['id', 'option', 'field']


class AdCategoryFieldsDetailSerializer(serializers.ModelSerializer):
    ad_categoy_fields = ChosenFieldsDetailSerializer(many=True)

    class Meta:
        model = AdCategoryFields
        fields = ['id','user','category','ad_categoy_fields']


class AdDetailSerializer(serializers.ModelSerializer):
    city = CitysSerializer(read_only=True)
    images = AdImageSerializer(many=True, read_only=True)
    user = UserAdSerializer(read_only=True)
    favorites_count = serializers.SerializerMethodField()
    category_options =AdCategoryFieldsDetailSerializer(read_only=True)
    category =DetailSubSubCategorySerializer(read_only=True)
    social_network = SocialNetworkSerializer(read_only=True,many=True)
    phone_numbers = PhoneNumberSerializer(read_only=True,many=True)
    emails = EmailAddressSerializer(read_only=True,many=True)
    work_days = WorkDaysSerializer(read_only=True)

    class Meta:
        model = Ad
        fields = [
            'images', 'description', 'category','category_options', 'price','past_price',
            'currency', 'contact_name', 'phone_number', 'hide_phone',
            'created_at', 'favorites_count',
            'id', 'user','impressions','views','city','social_network','work_days','phone_numbers','emails'
        ]

    def get_favorites_count(self, obj):
        return obj.favorited_by.count()
    

class CategoryOptionsFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryOptionsFields
        fields = ['id', 'option_field']


class CategoryOptionSerializer(serializers.ModelSerializer):
    category_option = CategoryOptionsFieldSerializer(many=True, read_only=True)  

    class Meta:
        model = CategoryOptions
        fields = ['id', 'option_title', 'subsub_category', 'self_completion', 'category_option']


class SubSubCategoryOptions(serializers.ModelSerializer):
    subsubcategories = CategoryOptionSerializer(many=True, read_only=True) 
    class Meta:
        model = SubSubCategory
        fields = ['subsub_category_name','subsubcategories']


class AdMapСoordinatesSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdMapСoordinates
        fields = ('__all__')


class UserFavoriteAdSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorit
        fields = ['id', 'ad']


class UserFavoriteAdCardsSerializer(serializers.ModelSerializer):
    ad = AdCardSerializer(read_only=True)
    class Meta:
        model = Favorit
        fields = ['id', 'ad']