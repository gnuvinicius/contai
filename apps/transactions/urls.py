from rest_framework.routers import DefaultRouter

from apps.transactions.views import (
    TransactionExtractionViewSet,
    TransactionViewSet,
)

app_name = "transaction"

router = DefaultRouter()
router.register("transactions", TransactionViewSet, basename="transactions")
router.register("extractions", TransactionExtractionViewSet, basename="extractions")

urlpatterns = router.urls
