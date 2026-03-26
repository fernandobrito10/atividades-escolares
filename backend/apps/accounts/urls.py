from django.urls import path
from .views import LoginView, MeView, AdminUsuariosView

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="login"),
    path("me/", MeView.as_view(), name="me"),
    path("gerenciar/usuarios/", AdminUsuariosView.as_view(), name="admin-usuarios"),
]