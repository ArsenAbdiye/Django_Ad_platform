from rest_framework import routers
from django.urls import path

from .views import *

core_router = routers.DefaultRouter()


core_router.register(r'site_logo', SiteLogoViewset,basename='site_logo')
core_router.register(r'header_burger_links', BurgerLinksViewset,basename='header_burger_links')
core_router.register(r'footer_links', FooterSiteLinksViewset,basename='footer_links')
core_router.register(r'footer_copyright', FooterCopyrightViewset,basename='footer_copyright')
core_router.register(r'advertisments', AdvertismentsViewset,basename='advertisments')


urlpatterns = [
    path('', mainpage_view, name='mainpage'),
    path('card_detail', card_detail, name='card_detail'),
    path('cards_search', cards_search, name='cards_search'),
    path('ad_create', ad_create, name='ad_create'),
    path('settings', settings, name='settings'),
    path('user', user, name='user')

]