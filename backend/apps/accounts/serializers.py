from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ["id", "username", "email", "role", "turma"]
        read_only_fields = ["id", "role"]

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            user = Usuario.objects.get(email=data["email"])
        except Usuario.DoesNotExist:
            raise serializers.ValidationError("Credenciais inválidas!")
        
        user = authenticate(username=user.username, password=data["password"])

        if not user:
            raise serializers.ValidationError("Credenciais inválidas!")

        if not user.is_active:
            raise serializers.ValidationError("Usuário inativo!")
        
        data["user"] = user
        return data