# backend/api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
# --- ЗМІНА ТУТ: імпортуємо ОБИДВІ необхідні функції ---
from .views import (
    CabinetViewSet, ContainerViewSet, TransactionViewSet, UserViewSet,
    generate_qr_code_view, get_summary_report
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'cabinets', CabinetViewSet, basename='cabinet')
router.register(r'containers', ContainerViewSet, basename='container')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
    # Маршрут для звітів
    path('reports/summary/', get_summary_report, name='summary-report'),
    # Маршрут для генерації QR-коду
    path('qr/<uuid:container_id>/', generate_qr_code_view, name='generate-qr'),
]
