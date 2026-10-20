from rest_framework import routers

from apps.user.views import *

user_router = routers.DefaultRouter()

user_router.register(r"registry_password", RegisterWithEmailCodeView, basename="registry_password")
user_router.register(r"confirm_account", ConfirmCodeViewSet, basename="confirm_account")
user_router.register(r"resend_code", ResendCodeViewSet, basename="resend_code")
user_router.register(r"registry_google", RegisterWithGoogleView, basename="registry_google")
user_router.register(r'auth/google', GoogleLoginViewSet, basename='google-login')
user_router.register(r'user_options', UserOptionsViewSet, basename='user_options')
user_router.register(r'user_contacts', UserContactsViewSet, basename='user_contacts')
user_router.register(r'user', UserUpdateViewSet, basename='user_password_change')
user_router.register(r'password_reset_email', ResetPasswordViewSet, basename='password_reset_email')
user_router.register(r'user_info', UserIfoViewSet, basename='user_info')


