from django.db.models import QuerySet
from django_filters.rest_framework import DjangoFilterBackend


class TokenUserFilterBackend(DjangoFilterBackend):
    """Apply user scoping from JWT payload before regular django-filter processing."""

    def get_authenticated_user_id(self, request) -> int | None:
        token_payload = request.auth
        if token_payload is not None:
            user_id = token_payload.get("user_id")
            if user_id is not None:
                return user_id

        return getattr(request.user, "id", None)

    def filter_queryset(self, request, queryset: QuerySet, view):
        user_id = self.get_authenticated_user_id(request)
        if user_id is None:
            scoped_queryset = queryset.none()
        else:
            scoped_queryset = queryset.filter(**{"user_id": user_id})

        return super().filter_queryset(request, scoped_queryset, view)
