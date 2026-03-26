from django.urls import path
from .views import MinhasAtividadesView, TurmasView

urlpatterns = [
    path("me/atividades/", MinhasAtividadesView.as_view(), name="minhas-atividades"),
    path("atividades/", MinhasAtividadesView.as_view(), name="criar-atividade"),
    path("turmas/", TurmasView.as_view(), name="turmas"),
]