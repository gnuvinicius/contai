from django.contrib.auth.models import AbstractUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class CustomTokenObtainPairView(TokenObtainPairView):
    def get_serializer_class(self):
        return CustomTokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Include user role claims in JWT payload and token response."""

    @classmethod
    def get_token(cls, user: AbstractUser):
        token = super().get_token(user)

        roles = list(user.groups.values_list("name", flat=True))
        token["roles"] = roles
        token["is_staff"] = user.is_staff
        token["is_superuser"] = user.is_superuser

        return token

    # def validate(self, attrs):
    #     data = cast(dict[str, Any], super().validate(attrs))

    #     user = self.user
    #     if user is None:
    #         return data

    #     authenticated_user = cast(AbstractUser, user)
    #     roles = cast(list[str], list(authenticated_user.groups.values_list("name", flat=True)))

    #     data["roles"] = roles
    #     data["is_staff"] = authenticated_user.is_staff
    #     data["is_superuser"] = authenticated_user.is_superuser

    #     return data
