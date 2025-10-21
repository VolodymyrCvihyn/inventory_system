# backend/api/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
# --- ЗМІНА ТУТ: імпортуємо тільки нові моделі ---
from .models import User, Cabinet, Container, Transaction

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_staff', 'role')
    fieldsets = UserAdmin.fieldsets + (('Додаткові поля', {'fields': ('role',)}),)

admin.site.register(User, CustomUserAdmin)
# --- І ТУТ: реєструємо Cabinet ---
admin.site.register(Cabinet)
admin.site.register(Container)
admin.site.register(Transaction)