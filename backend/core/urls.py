# backend/core/urls.py

from django.contrib import admin
from django.urls import path, include
# Видаляємо стандартний TokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
# Імпортуємо наш кастомний View з додатка api
from api.views import MyTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/', include('api.urls')),

    # Замінюємо стандартний шлях на наш кастомний
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]