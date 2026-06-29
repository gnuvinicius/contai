from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.authentication import JWTAuthentication

from apps.transactions.filters import TransactionFilter
from apps.transactions.permissions import HasExtractionPermission, HasTransactionPermission
from apps.transactions.serializers import (
    TransactionCreateSerializer,
    TransactionExtractionSerializer,
    TransactionSerializer,
    TransactionUpdateSerializer,
)
from core.filter_backends import TokenUserFilterBackend

from .models import Status, Transaction


class TransactionPagination(PageNumberPagination):
    page_size = 10


# Create your views here.
class TransactionViewSet(ModelViewSet):
    """CRUD API for authenticated user transactions."""

    authentication_classes = [JWTAuthentication]
    filterset_class = TransactionFilter
    filter_backends = [TokenUserFilterBackend]
    pagination_class = TransactionPagination
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated, HasTransactionPermission]
    queryset = Transaction.objects.all()

    def get_queryset(self):
        return Transaction.objects.filter(status=Status.ACTIVE)

    def get_serializer_class(self):
        if self.action == "create":
            return TransactionCreateSerializer
        if self.action in ["update", "partial_update"]:
            return TransactionUpdateSerializer
        return TransactionSerializer

    def perform_create(self, serializer):
        """Bind created transactions to the requesting user."""
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        instance.status = Status.INACTIVE
        instance.save(update_fields=["status"])


class TransactionExtractionViewSet(viewsets.GenericViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, HasExtractionPermission]
    serializer_class = TransactionExtractionSerializer
    queryset = Transaction.objects.all()
    http_method_names = ["post"]

    @swagger_auto_schema(
        request_body=TransactionExtractionSerializer,
        responses={201: TransactionSerializer},
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            result = serializer.save()
        except ValueError as exc:
            return Response(
                {
                    "error": "ValueError",
                    "detail": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(result, status=status.HTTP_201_CREATED)
