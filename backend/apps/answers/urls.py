from django.urls import path
from .views import MinhasRespostasView, EnviarRespostaView, RespostaUpdateView, RespostasAtividadeView

urlpatterns = [
    path("respostas/", EnviarRespostaView.as_view(), name="enviar-resposta"),
    path("me/respostas/", MinhasRespostasView.as_view(), name="minhas-respostas"),
    path("respostas/<int:pk>/", RespostaUpdateView.as_view(), name="resposta-update"),
    path("atividades/<int:pk>/respostas/", RespostasAtividadeView.as_view(), name="respostas-atividade"),
]
