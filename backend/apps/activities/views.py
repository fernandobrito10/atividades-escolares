from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Atividade, Turma
from .serializers import AtividadeSerializer, AtividadeResumoSerializer, TurmaSerializer


class MinhasAtividadesView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.user.is_professor:
            return AtividadeSerializer
        return AtividadeResumoSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_professor:
            return Atividade.objects.filter(professor=user).select_related("turma", "professor")

        return Atividade.objects.filter(turma=user.turma).select_related("turma", "professor")


class CriarAtividadeView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AtividadeSerializer

    def perform_create(self, serializer):
        if not self.request.user.is_professor:
            raise PermissionDenied("Apenas professores podem criar atividades.")
        serializer.save(professor=self.request.user)


class TurmasView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TurmaSerializer
    queryset = Turma.objects.all()
