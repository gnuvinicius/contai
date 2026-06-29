from rest_framework.routers import DefaultRouter

from apps.users.views import UserRegisterViewSet


router = DefaultRouter()
router.register(r"api/auth/register", UserRegisterViewSet, basename="auth-register")

urlpatterns = router.urls