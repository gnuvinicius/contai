from typing import cast

from django.contrib.auth.models import AbstractUser
from rest_framework.permissions import BasePermission


class HasTransactionPermission(BasePermission):
    """Custom permission to check if the user has access to the transaction."""

    def has_permission(self, request, view) -> bool:
        action = getattr(view, "action", None)

        user = cast(AbstractUser, request.user)

        if not user or not user.is_authenticated:
            return False

        if action in ["list", "retrieve"]:
            return user.has_perm("transactions.view_transaction")
        if action == "create":
            return user.has_perm("transactions.add_transaction")
        if action in ["update", "partial_update"]:
            return user.has_perm("transactions.change_transaction")
        if action == "extractions":
            return user.has_perm("transactions.add_transaction")
        if action == "destroy":
            return user.has_perm("transactions.delete_transaction")

        return False


class HasExtractionPermission(BasePermission):
    
    def has_permission(self, request, view) -> bool:
        action = getattr(view, "action", None)
        user = cast(AbstractUser, request.user)

        if not user or not user.is_authenticated:
            return False
        
        if action == "create":
            return user.has_perm("transactions.add_transaction")

        return False