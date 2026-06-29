from django.db import models
from django.utils import timezone


# Create your models here.
class SystemSetting(models.Model):
    title = models.CharField(max_length=255)
    value = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "system_settings"

    def __str__(self):
        return self.title
