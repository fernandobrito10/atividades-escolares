from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from apps.answers.serializers import RespostaSerializer
from .models import Atividade
from .serializers import AtividadeSerializer, AtividadeResumoSerializer
from apps.accounts.models import Usuario

class MinhasAtividadesView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.user.is_professor:
            return AtividadeSerializer
        return AtividadeResumoSerializer
    
    def get_queryset(self):
        user = self.request.user

        if user.is_professor:
            return Atividade.objects.filter(professor=user)
        
        return Atividade.objects.filter(turma=user.turma)
    
    def perform_create(self, serializer):
        if not self.request.user.is_professor:
            raise PermissionDenied("Apenas professores podem criar atividades.")
        serializer.save(professor=self.request.user)

class RespostasAtividadesView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RespostaSerializer

    def get_queryset(self):
        user = self.request.user
        atividade_id = self.kwargs["pk"]

        if not user.is_professor:
            raise PermissionDenied("Apenas professores podem visualizar as respostas")
        
        try:
            atividade = Atividade.objects.get(pk=atividade_id, professor=user)
        except Atividade.DoesNotExist:
            raise PermissionDenied("Você não tem acesso à esta atividade.")
        
        return atividade.respostas.all()