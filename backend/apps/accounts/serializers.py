from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    turma_nome = serializers.CharField(source="turma.nome", read_only=True, allow_null=True, default=None)

    class Meta:
        model = Usuario
        fields = ["id", "username", "email", "role", "turma", "turma_nome", "is_superuser"]
        read_only_fields = ["id", "role", "turma_nome", "is_superuser"]

class CriarUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = Usuario
        fields = ["username", "email", "password", "role", "turma"]

    def validate(self, data):
        if data.get("role") == Usuario.ALUNO and not data.get("turma"):
            raise serializers.ValidationError({"turma": "Aluno deve estar vinculado a uma turma."})
        if data.get("role") == Usuario.PROFESSOR:
            data["turma"] = None
        return data

    def create(self, validated_data):
        from django.core.exceptions import ValidationError as DjangoValidationError
        password = validated_data.pop("password")
        user = Usuario(**validated_data)
        user.set_password(password)
        try:
            user.save()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        return user

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