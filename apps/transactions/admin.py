from django.contrib import admin

from apps.transactions.models import PromptTemplate, Transaction


class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "status",
        "type",
        "description",
        "amount",
        "currency",
        "due_date",
    )
    search_fields = ("description", "merchant_name")
    list_filter = ("status", "type", "currency")


admin.site.register(Transaction, TransactionAdmin)


@admin.register(PromptTemplate)
class PromptTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "created_at", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name",)
