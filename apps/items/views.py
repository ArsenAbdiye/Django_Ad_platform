from django.http import JsonResponse
from rest_framework import viewsets,mixins
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework.parsers import FormParser, MultiPartParser,JSONParser
from rest_framework import permissions
from rest_framework.response import Response
from django.db.models import F
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action

from .serializers import *
from .models import *
from apps.items.mixins import *
from .filters import AdFilter

@extend_schema(tags=['Info page'])
class InfoPageViewset(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = InfoPages.objects.all()
    serializer_class = InfoPagesSerializer


@extend_schema(tags=['Category'])
class CategoryViewset(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


@extend_schema(tags=['Category'])
class SubCategoryViewset(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer


@extend_schema(tags=['Category'])
class SubSubCategoryViewset(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = SubSubCategory.objects.all()
    serializer_class = SubSubCategorySerializer


@extend_schema(tags=['Category'])
class SubSubCategoryByIdViewset(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = SubSubCategory.objects.all()
    serializer_class = SubSubCategorySerializer


@extend_schema(tags=['Ad'])
class CategoryOptionsViewset(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = SubSubCategory.objects.all()
    serializer_class = CategoryOptionsGetSerializer


@extend_schema(tags=['Ad'])
class AdViewSet(mixins.CreateModelMixin,mixins.DestroyModelMixin,viewsets.GenericViewSet):
    queryset = Ad.objects.all()
    serializer_class = AdSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (FormParser, MultiPartParser)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("Вы не можете удалять чужие объявления")
        instance.delete()

    @action(detail=True, methods=['POST'], url_path='deactivate')
    def toggle_activation(self, request, pk=None):
        ad = self.get_object()

        if ad.user != request.user:
            return Response({"detail": "Нельзя менять статус чужого объявления."}, status=status.HTTP_403_FORBIDDEN)

        ad.is_deactivate = not ad.is_deactivate
        ad.save()

        status_str = "деактивировано" if ad.is_deactivate else "активировано"
        return Response({"detail": f"Объявление {status_str}."})


@extend_schema(tags=['Ad'])
class AdCategoryFieldsViewSet(mixins.CreateModelMixin,mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = AdCategoryFields.objects.all()
    serializer_class =AdCategoryFieldsSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (JSONParser, FormParser, MultiPartParser)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@extend_schema(tags=['Ad'])
class FavoritAddViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Favorit.objects.all()
    serializer_class = FavoritSerializer
    permission_classes = [permissions.IsAuthenticated,]

    def create(self, request):
        user = request.user
        ad_id = request.data.get('ad')

        if not ad_id:
            return Response({'detail': 'Ad ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ad = Ad.objects.get(pk=ad_id)
        except ad_id.DoesNotExist:
            return Response({'detail': 'Объявление не найдено.'}, status=status.HTTP_404_NOT_FOUND)

        favorite = Favorit.objects.filter(user=user, ad=ad).first()

        if favorite:
            favorite.delete()
            return Response({'detail': 'Удалено из избранного.'}, status=status.HTTP_200_OK)

        Favorit.objects.create(user=user, ad=ad)
        return Response({'detail': 'Добавлено в избранное.'}, status=status.HTTP_201_CREATED)
    

@extend_schema(tags=['Ad parameters'])
class PhoneNumberViewSet(OwnerCheckMixin, mixins.CreateModelMixin,mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = PhoneNumber.objects.all()
    serializer_class = PhoneNumberSerializer
    permission_classes = [permissions.IsAuthenticated]


@extend_schema(tags=['Ad parameters'])
class AddressViewSet(OwnerCheckMixin, mixins.CreateModelMixin,mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]


@extend_schema(tags=['Ad parameters'])
class EmailAddressViewSet(OwnerCheckMixin, mixins.CreateModelMixin,mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = EmailAddress.objects.all()
    serializer_class = EmailAddressSerializer
    permission_classes = [permissions.IsAuthenticated]


@extend_schema(tags=['Ad parameters'])
class SocialNetworkViewSet(OwnerCheckMixin, mixins.CreateModelMixin,mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = SocialNetwork.objects.all()
    serializer_class = SocialNetworkSerializer
    permission_classes = [permissions.IsAuthenticated]


@extend_schema(tags=['Ad parameters'])
class WorkDaysViewSet(OwnerCheckMixin, mixins.CreateModelMixin,mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = WorkDays.objects.all()
    serializer_class = WorkDaysSerializer
    permission_classes = [permissions.IsAuthenticated]


@extend_schema(tags=['Ad parameters'])
class AdImagesViewSet(OwnerCheckMixin, mixins.CreateModelMixin,mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = AdImage.objects.all()
    serializer_class = AdImageChangeSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (FormParser, MultiPartParser)


@extend_schema(tags=['Ad'])
class AdGetByUserViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Ad.objects.all()
    serializer_class = AdCardSerializer
    permission_classes = [permissions.IsAuthenticated]
    

    def get_queryset(self):
        return Ad.objects.filter(is_deactivate=False)
    
    def list(self, request):
        user = request.user
        ad = Ad.objects.filter(user=user) 

        serializer = self.get_serializer(ad, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    

@extend_schema(tags=['Category'])
class СategoryAdvertisingViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = СategoryAdvertising.objects.all()
    serializer_class = СategoryAdvertisingSerializer


@extend_schema(tags=['Ad'])
class AdUpdateViewSet(mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Ad.objects.all()
    serializer_class = AdUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        ad = self.get_object()

        if ad.user != self.request.user:
            raise PermissionDenied("Вы не можете изменить чужое объявление.")

        serializer.save()


@extend_schema(
    tags=['Ad'],
    parameters=[
        OpenApiParameter(name='category_name', type=int, description='ID категории', required=False),
        OpenApiParameter(name='subcategory', type=int, description='ID подкатегории', required=False),
        OpenApiParameter(name='subsub_category', type=int, description='ID под-подкатегории', required=False),
        OpenApiParameter(name='min_price', type=int, description='Минимальная цена', required=False),
        OpenApiParameter(name='max_price', type=int, description='Максимальная цена', required=False),
        OpenApiParameter(name='description', type=str, description='Поиск по описанию', required=False),
    ]
)
class AdCardViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Ad.objects.all()
    serializer_class = AdCardSerializer
    filter_backends = (DjangoFilterBackend,)
    filterset_class = AdFilter  

    def get_queryset(self):
        return Ad.objects.filter(is_deactivate=False)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())  

        queryset.update(impressions=F('impressions') + 1)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


@extend_schema(tags=['Ad'])
class AdDetailViewSet(mixins.RetrieveModelMixin,viewsets.GenericViewSet):
    queryset = Ad.objects.all()
    serializer_class = AdDetailSerializer

    def get_queryset(self):
        return Ad.objects.filter(is_deactivate=False)

    

@extend_schema(tags=['Ad'])
class AdMapСoordinatesViewSet(OwnerCheckMixin, mixins.CreateModelMixin,mixins.DestroyModelMixin,viewsets.GenericViewSet):
    queryset = AdMapСoordinates.objects.all()
    serializer_class = AdMapСoordinatesSerializer
    permission_classes = [permissions.IsAuthenticated]


@extend_schema(tags=['Ad'])
class citysViewSet(mixins.ListModelMixin,viewsets.GenericViewSet):
    queryset = Citys.objects.all()
    serializer_class = CitysSerializer


@extend_schema(tags=['Ad'])
class FavoriteAdViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = UserFavoriteAdSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorit.objects.filter(user=self.request.user)


@extend_schema(tags=['Ad'])
class FavoriteAdCardsViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = UserFavoriteAdCardsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorit.objects.filter(user=self.request.user)