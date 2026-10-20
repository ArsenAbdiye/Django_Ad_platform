from .serializers import *

from rest_framework import mixins, viewsets
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import permissions,status
from drf_spectacular.utils import extend_schema
from django.shortcuts import render
import requests
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import action
import random
from django.contrib.auth import get_user_model

from .models import CustomUser
from apps.user.tasks import send_reset_password_email


@extend_schema(tags=['User'])
class RegisterWithEmailCodeView(viewsets.GenericViewSet):
    serializer_class = RegisterWithEmailCodeSerializer

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Пользователь успешно создан.'}, status=status.HTTP_200_OK)


@extend_schema(tags=['User'])
class ConfirmCodeViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = ConfirmCodeSerializer
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Аккаунт активирован"}, status=status.HTTP_200_OK)


@extend_schema(tags=['User'])
class ResendCodeViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = ResendCodeSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Код отправлен повторно"}, status=status.HTTP_200_OK)


@extend_schema(tags=['User'])
class RegisterWithGoogleView(viewsets.GenericViewSet):
    serializer_class = RegisterWithGoogleSerializer

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(self.get_serializer(instance).data)
    



@extend_schema(tags=["User"])
class GoogleLoginViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = GoogleLoginSerializer
    queryset = CustomUser.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        google_token = serializer.validated_data['google_token']

        response = requests.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": google_token}
        )

        if response.status_code != 200:
            return Response({"error": "Неверный Google токен"}, status=status.HTTP_401_UNAUTHORIZED)

        google_data = response.json()
        email = google_data.get("email")
        name = google_data.get("name", email)

        if not email:
            return Response({"error": "Email не найден в токене"}, status=status.HTTP_400_BAD_REQUEST)

        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={
                "username": name,
                "usernickname": name
            }
        )

        if created:
            user.set_unusable_password()
            user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })
    

def vk_login_view(request):
    return render(request, 'vk_login.html') 


@extend_schema(tags=["User"])
class RegisterWithCodeView(viewsets.GenericViewSet):
    serializer_class = RegisterWithCodeSerializer  

    def create(self, request, *args, **kwargs):
        code = request.data.get("code")
        if not code:
            return Response({"error": "Code is required"}, status=status.HTTP_400_BAD_REQUEST)

        client_id = '53543622'
        client_secret = 'Os5jWdfGZP4sJgLAmB0D'
        redirect_uri = "http://localhost"

        if not client_id or not client_secret:
            return Response({"error": "VK client_id or client_secret not set"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            response = requests.get(
                "https://oauth.vk.com/access_token",
                params={
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "code": code,
                    "redirect_uri": redirect_uri,
                }
            )

            response.raise_for_status()  

            data = response.json()

            if 'access_token' not in data:
                return Response({"error": f"Access token not found in response: {data}"},
                                 status=status.HTTP_400_BAD_REQUEST)

            access_token = data['access_token']
            return Response({"access_token": access_token})

        except requests.exceptions.RequestException as e:
            error_message = f"Request failed: {str(e)}"
            if response:
                error_message += f", Status Code: {response.status_code}, Response: {response.text}"
            return Response({"error": error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@extend_schema(tags=["User"])
class UserOptionsViewSet(mixins.RetrieveModelMixin,
                         mixins.UpdateModelMixin,viewsets.GenericViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserOptionsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CustomUser.objects.filter(id=self.request.user.id)

    def get_object(self):
        return self.request.user
    

@extend_schema(tags=["User"])
class UserContactsViewSet(mixins.UpdateModelMixin,viewsets.GenericViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UpdatePhoneEmailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return CustomUser.objects.filter(id=self.request.user.id)

    def get_object(self):
        return self.request.user
    

@extend_schema(tags=["User"])
class UserUpdateViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer
    @action(detail=False, methods=['post'], url_path='change-password')
    @extend_schema(request=ChangePasswordSerializer, responses={200: 'Пароль успешно изменён.'})
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Пароль успешно изменён.'}, status=status.HTTP_200_OK)
    

@extend_schema(tags=["User"])
class ResetPasswordViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = ResetPasswordSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        User = get_user_model()

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Пользователь с таким email не найден."}, status=status.HTTP_404_NOT_FOUND)

        new_password = ''.join([random.choice('0123456789') for _ in range(6)])
        user.set_password(new_password)
        user.save()

        send_reset_password_email.delay(email, new_password)

        return Response({"detail": "Новый пароль отправлен на вашу почту."}, status=status.HTTP_200_OK)
    

@extend_schema(tags=["User"])
class UserIfoViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = CustomUser.objects.all()
    serializer_class =UserInfoSerializer
    