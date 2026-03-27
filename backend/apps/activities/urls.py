from django.urls import path
from .views import MinhasAtividadesView, CriarAtividadeView, TurmasView

urlpatterns = [
    path("me/atividades/", MinhasAtividadesView.as_view(), name="minhas-atividades"),
    path("atividades/", CriarAtividadeView.as_view(), name="criar-atividade"),
    path("turmas/", TurmasView.as_view(), name="turmas"),
]
