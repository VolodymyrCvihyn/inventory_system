# backend/api/views.py

from rest_framework import viewsets, status, permissions
# --- ЗМІНА ТУТ: додаємо api_view та permission_classes ---
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, F

from .models import Cabinet, Container, Transaction, User
from .serializers import CabinetSerializer, ContainerSerializer, TransactionSerializer, UserSerializer

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer

@api_view(['GET'])
@permission_classes([permissions.AllowAny]) # Доступ для всіх, без авторизації
def health_check(request):
    """Простий ендпоінт, який повертає 200 OK."""
    return JsonResponse({'status': 'ok'})

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_staff

# --- ViewSets для моделей ---

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class CabinetViewSet(viewsets.ModelViewSet):
    queryset = Cabinet.objects.prefetch_related('containers').all()
    serializer_class = CabinetSerializer
    permission_classes = [permissions.IsAdminUser]

class ContainerViewSet(viewsets.ModelViewSet):
    queryset = Container.objects.all()
    serializer_class = ContainerSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        initial_quantity = serializer.validated_data.get('initial_quantity')
        container = serializer.save(initial_quantity=initial_quantity)
        
        Transaction.objects.create(
            container=container,
            user=self.request.user,
            transaction_type=Transaction.TransactionType.INITIAL,
            quantity_change=container.initial_quantity
        )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def write_off(self, request, pk=None):
        container = self.get_object()
        user = request.user
        try:
            quantity_to_write_off = float(request.data.get('quantity'))
            if quantity_to_write_off <= 0: raise ValueError()
        except (ValueError, TypeError):
            return Response({'error': 'Некоректна кількість'}, status=status.HTTP_400_BAD_REQUEST)

        if container.current_quantity < quantity_to_write_off:
            return Response({'error': f'Недостатньо матеріалу. Залишок: {container.current_quantity}'}, status=status.HTTP_400_BAD_REQUEST)
        
        container.current_quantity -= quantity_to_write_off
        container.save()
        
        Transaction.objects.create(
            container=container, user=user,
            transaction_type=Transaction.TransactionType.WRITE_OFF,
            quantity_change=-quantity_to_write_off
        )
        serializer = self.get_serializer(container)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def replenish(self, request, pk=None):
        container = self.get_object()
        user = request.user
        try:
            quantity_to_add = float(request.data.get('quantity'))
            if quantity_to_add <= 0: raise ValueError()
        except (ValueError, TypeError):
            return Response({'error': 'Некоректна кількість'}, status=status.HTTP_400_BAD_REQUEST)
        
        container.current_quantity += quantity_to_add
        container.save()

        Transaction.objects.create(
            container=container,
            user=user,
            transaction_type=Transaction.TransactionType.REPLENISH,
            quantity_change=quantity_to_add
        )
        serializer = self.get_serializer(container)
        return Response(serializer.data, status=status.HTTP_200_OK)

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Transaction.objects.select_related('user', 'container').all().order_by('-timestamp')
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAdminUser]

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# --- Спеціальний View для звітів ---

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def get_summary_report(request):
    cabinet_id = request.query_params.get('cabinet_id')
    
    container_queryset = Container.objects.all()
    if cabinet_id:
        container_queryset = container_queryset.filter(cabinet_id=cabinet_id)

    total_containers = container_queryset.count()

    full_inventory_list = container_queryset.select_related('cabinet').order_by('cabinet__name', 'name')
    full_inventory_serializer = ContainerSerializer(full_inventory_list, many=True)

    materials_summary = container_queryset.values('name', 'unit').annotate(
        total_quantity=Sum('current_quantity')
    ).order_by('name')

    low_stock_items = container_queryset.filter(
        current_quantity__lte=F('low_stock_threshold')
    ).select_related('cabinet').order_by('name')
    
    low_stock_serializer = ContainerSerializer(low_stock_items, many=True)

    report_data = {
        'total_containers': total_containers,
        'materials_summary': list(materials_summary),
        'low_stock_items': low_stock_serializer.data,
        'full_inventory': full_inventory_serializer.data,
    }

    if not cabinet_id:
        report_data['total_cabinets'] = Cabinet.objects.count()

    return Response(report_data)

# --- ДОДАЙТЕ ЦЕЙ КОД В КІНЕЦЬ ФАЙЛУ ---
import qrcode
from django.http import HttpResponse
from io import BytesIO

# Ця функція не прив'язана до жодного ViewSet, тому вона існує окремо
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated]) # Доступ для будь-якого залогіненого
def generate_qr_code_view(request, container_id):
    # Ми зашиваємо в QR-код текст, який зрозуміє наш сканер на фронтенді
    url_for_scanner = f"scan/{container_id}"

    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(url_for_scanner)
    qr.make(fit=True)

    img = qr.make_image(fill='black', back_color='white')

    buffer = BytesIO()
    img.save(buffer, 'PNG')
    return HttpResponse(buffer.getvalue(), content_type="image/png")