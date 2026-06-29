from django_filters import rest_framework as django_filters

from apps.transactions.models import Transaction


class TransactionFilter(django_filters.FilterSet):
    merchant_name = django_filters.CharFilter(field_name="merchant_name", lookup_expr="icontains")

    class Meta:
        model = Transaction
        fields = {
            "amount": ["exact", "gte", "lte"],
            "due_date": ["exact", "gte", "lte"],
            "description": ["icontains"],
        }
