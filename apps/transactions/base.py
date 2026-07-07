from rest_framework import serializers

"""
Base serializers for transactions app.
This module defines the StrictModelSerializer, which is a custom serializer that raises a validation error 
if any unknown fields are present in the input data.
This ensures that only the expected fields are accepted when creating or updating transactions.
"""
class StrictModelSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        unknown_fields = set(self.initial_data) - set(self.fields)

        if unknown_fields:
            raise serializers.ValidationError(dict.fromkeys(unknown_fields, "Unknown field"))
        return super().validate(attrs)