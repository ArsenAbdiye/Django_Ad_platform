from rest_framework import viewsets,mixins
from drf_spectacular.utils import extend_schema
from django.shortcuts import render

from .serializers import *
from .models import *
from apps.items.models import *
from apps.user.models import *

@extend_schema(tags=['Header'])
class SiteLogoViewset(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = SiteLogo.objects.all()
    serializer_class = SiteLogoSerializer


@extend_schema(tags=['Header'])
class BurgerLinksViewset(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = BurgerCategory.objects.all()
    serializer_class = BurgerCategorySerializer

@extend_schema(tags=['Header'])
class AdvertismentsViewset(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Advertisments.objects.all()
    serializer_class = AdvertismentsSerializer

@extend_schema(tags=['Footer'])
class FooterSiteLinksViewset(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = FooterSiteLinksCategory.objects.all()
    serializer_class = FooterSiteLinksCategorySerializer

@extend_schema(tags=['Footer'])
class FooterCopyrightViewset(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = FooterCopyright.objects.all()
    serializer_class = FooterCopyrightSerializer


from .models import *
from apps.items.models import *
from apps.user.models import *
from django.http import JsonResponse

def mainpage_view(request):
    logo = SiteLogo.objects.all()
    burger_categories = BurgerCategory.objects.prefetch_related('link').all()
    categories = Category.objects.all()
    social_categories = burger_categories.filter(is_social=True)
    regular_categories = burger_categories.filter(is_social=False)
    return render(request, 'core/index.html',
        {
            'logo':logo,
            'social_categories': social_categories,
            'regular_categories': regular_categories,
            'categories':categories
        })


def card_detail(request):
    logo = SiteLogo.objects.all()
    burger_categories = BurgerCategory.objects.prefetch_related('link').all()
    categories = Category.objects.all()
    social_categories = burger_categories.filter(is_social=True)
    regular_categories = burger_categories.filter(is_social=False)
    return render(request, 'core/card_detail.html',
        {
            'logo':logo,
            'social_categories': social_categories,
            'regular_categories': regular_categories,
            'categories':categories
        })

def cards_search(request):
    logo = SiteLogo.objects.all()
    burger_categories = BurgerCategory.objects.prefetch_related('link').all()
    categories = Category.objects.all()
    social_categories = burger_categories.filter(is_social=True)
    regular_categories = burger_categories.filter(is_social=False)
    return render(request, 'core/cards_search.html',
        {
            'logo':logo,
            'social_categories': social_categories,
            'regular_categories': regular_categories,
            'categories':categories
        })


def ad_create(request):
    logo = SiteLogo.objects.all()
    burger_categories = BurgerCategory.objects.prefetch_related('link').all()
    categories = Category.objects.all()
    social_categories = burger_categories.filter(is_social=True)
    regular_categories = burger_categories.filter(is_social=False)
    return render(request, 'core/ad_create.html',
        {
            'logo':logo,
            'social_categories': social_categories,
            'regular_categories': regular_categories,
            'categories':categories
        })


def settings(request):
    logo = SiteLogo.objects.all()
    burger_categories = BurgerCategory.objects.prefetch_related('link').all()
    categories = Category.objects.all()
    social_categories = burger_categories.filter(is_social=True)
    regular_categories = burger_categories.filter(is_social=False)
    return render(request, 'core/settings.html',
        {
            'logo':logo,
            'social_categories': social_categories,
            'regular_categories': regular_categories,
            'categories':categories
        })


def user(request):
    logo = SiteLogo.objects.all()
    burger_categories = BurgerCategory.objects.prefetch_related('link').all()
    categories = Category.objects.all()
    social_categories = burger_categories.filter(is_social=True)
    regular_categories = burger_categories.filter(is_social=False)
    return render(request, 'core/user.html',
        {
            'logo':logo,
            'social_categories': social_categories,
            'regular_categories': regular_categories,
            'categories':categories
        })