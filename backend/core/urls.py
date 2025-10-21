# backend/core/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from api.views import MyTokenObtainPairView, health_check # Додаємо health_check

urlpatterns = [
    # --- НОВИЙ ШЛЯХ ---
    path('health/', health_check, name='health-check'),
    
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]