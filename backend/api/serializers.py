# backend/api/serializers.py

from rest_framework import serializers
from .models import User, Cabinet, Container, Transaction
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role', 'is_staff']
        read_only_fields = ['id']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            role=validated_data.get('role', User.Role.OPERATOR),
            is_staff=validated_data.get('is_staff', False)
        )
        return user

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.role = validated_data.get('role', instance.role)
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)

        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance

class ContainerSerializer(serializers.ModelSerializer):
    cabinet_name = serializers.CharField(source='cabinet.name', read_only=True)
    class Meta:
        model = Container
        fields = [
            'id', 'name', 'unit', 'low_stock_threshold', 'initial_quantity',
            'current_quantity', 'cabinet', 'cabinet_name', 'created_at'
        ]

class CabinetSerializer(serializers.ModelSerializer):
    containers = ContainerSerializer(many=True, read_only=True)
    class Meta:
        model = Cabinet
        fields = ['id', 'name', 'description', 'containers']

class TransactionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    container_name = serializers.CharField(source='container.name', read_only=True)
    class Meta:
        model = Transaction
        fields = '__all__'

# --- ЗМІНА ТУТ: РОБИМО ЛОГІКУ СТВОРЕННЯ ТОКЕНА НАДІЙНІШОЮ ---
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Додаємо кастомні поля
        token['username'] = user.username
        
        # Надійна перевірка ролі
        role = user.role
        if not role: # Якщо поле ролі порожнє
            if user.is_staff: # Але користувач є адміністратором
                role = User.Role.ADMINISTRATOR
            else:
                role = User.Role.OPERATOR
        token['role'] = role

        return token