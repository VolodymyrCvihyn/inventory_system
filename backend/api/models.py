# backend/api/models.py
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMINISTRATOR = "ADMINISTRATOR", "Administrator"
        OPERATOR = "OPERATOR", "Operator"
    role = models.CharField(max_length=50, choices=Role.choices)

# --- НОВА МОДЕЛЬ: Шафа ---
class Cabinet(models.Model):
    name = models.CharField(max_length=255, verbose_name="Назва шафи")
    description = models.TextField(blank=True, null=True, verbose_name="Опис/Розташування")

    def __str__(self):
        return self.name

# --- ОНОВЛЕНА МОДЕЛЬ: Ємність ---
class Container(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Поля, перенесені з моделі Material
    name = models.CharField(max_length=255, verbose_name="Назва матеріалу/ємності")
    unit = models.CharField(max_length=50, verbose_name="Одиниця виміру")
    low_stock_threshold = models.FloatField(default=0, verbose_name="Поріг низького залишку")

    # Кількість
    initial_quantity = models.FloatField(verbose_name="Початкова кількість")
    current_quantity = models.FloatField(verbose_name="Поточна кількість")

    # Прив'язка до нової моделі Cabinet
    cabinet = models.ForeignKey(Cabinet, on_delete=models.CASCADE, related_name='containers', verbose_name="Шафа")

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата створення")

    def __str__(self):
        return f"{self.name} в шафі {self.cabinet.name}"

# Модель Transaction залишається, але зв'язок з Material зникає
class Transaction(models.Model):
    class TransactionType(models.TextChoices):
        WRITE_OFF = "WRITE_OFF", "Списання"
        REPLENISH = "REPLENISH", "Поповнення"
        INITIAL = "INITIAL", "Створення"

    container = models.ForeignKey(Container, on_delete=models.CASCADE, verbose_name="Ємність")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Користувач")
    transaction_type = models.CharField(max_length=50, choices=TransactionType.choices, verbose_name="Тип транзакції")
    quantity_change = models.FloatField(verbose_name="Зміна кількості")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Час операції")

    def __str__(self):
        return f"{self.get_transaction_type_display()} {abs(self.quantity_change)} з {self.container.name}"