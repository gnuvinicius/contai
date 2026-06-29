from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone

User = get_user_model()


class Status(models.TextChoices):
    ACTIVE = "active", "Active"
    INACTIVE = "inactive", "Inactive"


class Transaction(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="transactions",
        db_index=True,
    )
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.ACTIVE)
    type = models.CharField(max_length=50)
    payment_method = models.CharField(null=True, blank=True)
    description = models.TextField()
    merchant_name = models.CharField(max_length=255, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3)
    is_installment = models.BooleanField(default=False)
    installment = models.DecimalField(max_digits=3, decimal_places=0, null=True, blank=True)
    installment_total = models.DecimalField(max_digits=3, decimal_places=0, null=True, blank=True)
    due_date = models.DateTimeField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(null=True, blank=True, auto_now=True)

    def __str__(self):
        return f"{self.description} - {self.amount}"


class PromptTemplate(models.Model):
    name = models.CharField(max_length=100, unique=True)
    content = models.TextField(
        help_text="Prompt template. Use {user_input} as placeholder for user data."
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Prompt Template"
        verbose_name_plural = "Prompt Templates"
