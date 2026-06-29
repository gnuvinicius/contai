
from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.users.serializers import UserRegisterSerializer

class UserRegisterViewSet(viewsets.GenericViewSet):
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]
    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        serialize = self.get_serializer(data=request.data)
        serialize.is_valid(raise_exception=True)
        user = serialize.save()

        return Response(
            {
                "id": user.id,
                "email": user.email,
                "groups": list(user.groups.values_list("name", flat=True))
            },
            status=status.HTTP_201_CREATED,
        )