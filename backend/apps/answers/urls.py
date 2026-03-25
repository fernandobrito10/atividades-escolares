from django.urls import path
from .views import MinhasRespostasView, RespostaUpdateView, RespostasAtividadeView

urlpatterns = [
    path("respostas/", MinhasRespostasView.as_view(), name="respostas"),
    path("me/respostas/", MinhasRespostasView.as_view(), name="minhas-respostas"),
    path("respostas/<int:pk>/", RespostaUpdateView.as_view(), name="resposta-update"),
    path("atividades/<int:pk>/respostas/", RespostasAtividadeView.as_view(), name="respostas-atividade"),
]