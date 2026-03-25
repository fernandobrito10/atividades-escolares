from django.urls import path
from .views import MinhasAtividadesView

urlpatterns = [
    path("me/atividades/", MinhasAtividadesView.as_view(), name="minhas-atividades"),
    path("atividades/", MinhasAtividadesView.as_view(), name="criar-atividade"),
]