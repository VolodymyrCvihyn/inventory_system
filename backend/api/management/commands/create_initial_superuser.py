# backend/api/management/commands/create_initial_superuser.py

import os
from django.core.management.base import BaseCommand
from django.db import IntegrityError
from api.models import User # Переконайтесь, що User імпортовано з правильного місця

class Command(BaseCommand):
    help = 'Creates an initial superuser from environment variables if it does not exist.'

    # --- ДОДАНО: Дозволяємо прапор --noinput ---
    def add_arguments(self, parser):
        parser.add_argument(
            '--noinput', '--no-input', action='store_true',
            help='Tells Django to NOT prompt the user for input of any kind.',
        )

    def handle(self, *args, **options):
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

        if not all([username, email, password]):
            self.stdout.write(self.style.ERROR('Не встановлено всі змінні середовища для суперадміністратора (USERNAME, EMAIL, PASSWORD)'))
            return

        if not User.objects.filter(username=username).exists():
            try:
                self.stdout.write(self.style.SUCCESS(f'Створення суперадміністратора {username}'))
                User.objects.create_superuser(username=username, email=email, password=password)
                self.stdout.write(self.style.SUCCESS(f'Суперадміністратора {username} успішно створено'))
            except IntegrityError:
                self.stdout.write(self.style.WARNING(f'Помилка створення (можливо, користувач вже існує): {username}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Невідома помилка при створенні суперадміністратора: {e}'))
        else:
            self.stdout.write(self.style.WARNING(f'Суперадміністратор {username} вже існує'))