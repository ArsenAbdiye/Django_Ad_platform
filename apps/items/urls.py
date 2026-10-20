from rest_framework import routers
from .views import *

items_router = routers.DefaultRouter()

items_router.register(r'info_pages', InfoPageViewset,basename='info_pages')
items_router.register(r'categorys', CategoryViewset,basename='categorys')
items_router.register(r'subcategorys', SubCategoryViewset,basename='subcategorys')
items_router.register(r'subsubcategorys', SubSubCategoryViewset,basename='subsubcategorys')
items_router.register(r'category_options', CategoryOptionsViewset,basename='category_options')
items_router.register(r'ad', AdViewSet,basename='ad')
items_router.register(r'ad_category_options', AdCategoryFieldsViewSet,basename='ad_category_options')
items_router.register(r'favorit_add', FavoritAddViewSet,basename='favorit_add')
items_router.register(r'phone_number', PhoneNumberViewSet,basename='phone_number')
items_router.register(r'adress', AddressViewSet,basename='adress')
items_router.register(r'email', EmailAddressViewSet,basename='email')
items_router.register(r'social_netrwork', SocialNetworkViewSet,basename='social_netrwork')
items_router.register(r'get_ads_by_user', AdGetByUserViewSet,basename='get_ads_by_user')
items_router.register(r'work_days', WorkDaysViewSet,basename='work_days')
items_router.register(r'category_adversing', СategoryAdvertisingViewSet,basename='category_adversing')
items_router.register(r'ad_update', AdUpdateViewSet,basename='ad_update')
items_router.register(r'ad_images', AdImagesViewSet,basename='ad_images')
items_router.register(r'ad_card', AdCardViewSet,basename='ad_card')
items_router.register(r'ad_detail', AdDetailViewSet,basename='ad_detail')
items_router.register(r'ad_map_coordinates', AdMapСoordinatesViewSet,basename='ad_map_coordinates')
items_router.register(r'citys', citysViewSet,basename='citys')
items_router.register(r'category_by_id', SubSubCategoryByIdViewset,basename='category_by_id')
items_router.register(r'user_favorit_ads', FavoriteAdViewSet,basename='user_favorit_ads')
items_router.register(r'user_favorit_cards', FavoriteAdCardsViewSet,basename='user_favorit_cards')






