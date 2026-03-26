from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework import status, generics
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Usuario
from .serializers import LoginSerializer, UsuarioSerializer, CriarUsuarioSerializer


class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UsuarioSerializer(user).data,
        }, status=status.HTTP_200_OK)

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)


class AdminUsuariosView(generics.ListCreateAPIView):
    permission_classes = [IsSuperUser]
    queryset = Usuario.objects.select_related("turma").order_by("role", "username")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CriarUsuarioSerializer
        return UsuarioSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        headers = self.get_success_headers(serializer.data)
        return Response(
            UsuarioSerializer(usuario).data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )