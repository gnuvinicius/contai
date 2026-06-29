from typing import cast

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, UserManager
from rest_framework import serializers

User = get_user_model()

class UserRegisterSerializer(serializers.Serializer):
    username = serializers.CharField(write_only=True, required=True, min_length=8)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    @staticmethod
    def validate_email(value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Já existe um usuario com esse e-mail.")
        return value
    
    def create(self, validated_data):
        username = validated_data["username"]
        email = validated_data["email"]
        password = validated_data["password"]
        
        user_manager = cast(UserManager, User.objects)

        user = user_manager.create_user(
            username=username,
            email=email,
            password=password,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", "")
        )

        group = Group.objects.get(name="user")
        user.groups.add(group)
        return user