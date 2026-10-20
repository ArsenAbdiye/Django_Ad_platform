from rest_framework import serializers
from .models import *
from apps.items.validators import validate_kg_phone_number
import requests
from django.contrib.auth import authenticate
from django.contrib.auth import password_validation
from .tasks import send_verification_email_task
from .utils import *

class RegisterWithEmailCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        email = validated_data['email'].lower()
        password = validated_data['password']

        user = CustomUser.objects.create(
            email=email,
            username=email,
            is_active=False
        )
        user.set_password(password)
        user.save()
        user.usernickname = f"account{user.id}"
        user.save()

        code = generate_verification_code()
        EmailVerificationCode.objects.create(user=user, code=code)

        send_verification_email_task.delay(user.id, code)

        return user
    

class ConfirmCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

    def validate(self, data):
        email = data['email'].lower()
        code = data['code']

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Пользователь не найден")

        record = EmailVerificationCode.objects.filter(user=user, code=code).last()

        if not record or record.is_expired():
            raise serializers.ValidationError("Код неверный или истёк")

        data['user'] = user
        return data

    def save(self):
        user = self.validated_data['user']
        user.is_active = True
        user.save()
        user.usernickname = f"account{user.id}"
        user.save()
        EmailVerificationCode.objects.filter(user=user).delete()
        return user
    


class ResendCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = CustomUser.objects.get(email=value.lower(), is_active=False)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Пользователь не найден или уже активирован")
        return value.lower()

    def save(self):
        email = self.validated_data['email']
        user = CustomUser.objects.get(email=email)

        EmailVerificationCode.objects.filter(user=user).delete()

        code = generate_verification_code()
        EmailVerificationCode.objects.create(user=user, code=code)
        send_verification_email_task.delay(user.id, code)
        return user
    

class ConfirmCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

    def validate(self, data):
        email = data['email']
        code = data['code']
        try:
            user = CustomUser.objects.get(email=email)
            record = EmailVerificationCode.objects.filter(user=user, code=code).last()
            if not record or record.is_expired():
                raise serializers.ValidationError("Код неверный или истёк")
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Пользователь не найден")

        return data

    def save(self):
        email = self.validated_data['email']
        user = CustomUser.objects.get(email=email)
        user.is_active = True
        user.save()
        EmailVerificationCode.objects.filter(user=user).delete()
        return user


class RegisterWithGoogleSerializer(serializers.ModelSerializer):
    google_token = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('google_token',)

    def create(self, validated_data):
        google_token = validated_data['google_token']
        return self._create_user_with_google(google_token)

    def _create_user_with_google(self, google_token):
        url = 'https://www.googleapis.com/oauth2/v3/tokeninfo'
        response = requests.get(url, params={'id_token': google_token})

        if response.status_code != 200:
            raise serializers.ValidationError("Invalid Google token")

        google_data = response.json()

        user, created = CustomUser.objects.get_or_create(
            email=google_data['email'],
            defaults={
                'username': google_data['name'],
                'usernickname': google_data['name'],
                'is_google_user': True,
            }
        )

        if created:
            user.set_unusable_password()  
            user.save()

        return user
    

class GoogleLoginSerializer(serializers.Serializer):
    google_token = serializers.CharField()


class RegisterWithCodeSerializer(serializers.Serializer):
    code  = serializers.CharField()


class UserOptionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['user_image','usernickname','user_discription','is_vip','is_pro','phone','email']


class UpdatePhoneEmailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['phone', 'email']

    def validate_phone(self, value):
        value = validate_kg_phone_number(value)
        user = self.instance

        if CustomUser.objects.exclude(id=user.id).filter(phone=value).exists():
            raise serializers.ValidationError("Этот номер уже используется другим пользователем.")
        return value

    def validate_email(self, value):
        user = self.instance
        if value and CustomUser.objects.exclude(id=user.id).filter(email=value).exists():
            raise serializers.ValidationError("Этот email уже используется другим пользователем.")
        return value


    def update(self, instance, validated_data):
        phone = validated_data.get('phone')
        email = validated_data.get('email')

        if phone:
            instance.phone = phone

        if email:
            instance.email = email
            instance.username = email  


        instance.save()
        return instance
    

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Текущий пароль указан неверно.")
        return value

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError("Новые пароли не совпадают.")
        password_validation.validate_password(data['new_password'], self.context['request'].user)
        return data

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
    

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email не найден.")
        return value

from apps.items.serializers import AdCardSerializer

class UserInfoSerializer(serializers.ModelSerializer):
    ad_user = AdCardSerializer(many=True, read_only=True)
    class Meta:
        model = CustomUser
        fields = [
            'usernickname',
            'user_image',
            'user_discription',
            'email',
            'phone',
            'ad_user'
        ]