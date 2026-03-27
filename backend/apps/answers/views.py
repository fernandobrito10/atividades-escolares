from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Resposta
from apps.activities.models import Atividade
from .serializers import RespostaSerializer, RespostaAlunoUpdateSerializer, RespostaProfessorUpdateSerializer


class MinhasRespostasView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RespostaSerializer

    def get_queryset(self):
        user = self.request.user

        if not user.is_aluno:
            raise PermissionDenied("Apenas alunos podem ver suas respostas.")

        return Resposta.objects.filter(aluno=user).select_related("atividade", "aluno")


class EnviarRespostaView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RespostaSerializer

    def perform_create(self, serializer):
        if not self.request.user.is_aluno:
            raise PermissionDenied("Apenas alunos podem enviar respostas.")

        serializer.save(aluno=self.request.user)


class RespostaUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    http_method_names = ["patch"]

    def get_serializer_class(self):
        user = self.request.user

        if user.is_professor:
            return RespostaProfessorUpdateSerializer

        return RespostaAlunoUpdateSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_professor:
            return Resposta.objects.filter(atividade__professor=user)

        return Resposta.objects.filter(aluno=user)

    def get_object(self):
        obj = super().get_object()
        user = self.request.user

        if user.is_aluno and obj.aluno != user:
            raise PermissionDenied("Você não tem acesso a esta resposta.")

        if user.is_professor and obj.atividade.professor != user:
            raise PermissionDenied("Você não pode corrigir esta resposta.")

        return obj


class RespostasAtividadeView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RespostaSerializer

    def get_queryset(self):
        user = self.request.user
        atividade_id = self.kwargs["pk"]

        if not user.is_professor:
            raise PermissionDenied("Apenas professores podem ver as respostas.")

        try:
            atividade = Atividade.objects.get(pk=atividade_id, professor=user)
        except Atividade.DoesNotExist:
            raise PermissionDenied("Você não tem acesso a esta atividade.")

        return atividade.respostas.select_related("aluno", "atividade").all()
