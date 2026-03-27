from rest_framework import serializers
from django.utils import timezone
from .models import Resposta

class RespostaSerializer(serializers.ModelSerializer):
    aluno_nome = serializers.SerializerMethodField()

    def get_aluno_nome(self, obj):
        full_name = obj.aluno.get_full_name()
        return full_name if full_name else obj.aluno.username

    atividade_titulo = serializers.CharField(
        source="atividade.titulo",
        read_only=True,
    )

    class Meta:
        model = Resposta
        fields = ["id", "texto", "nota", "feedback", "atividade", "atividade_titulo", "aluno", "aluno_nome", "created_at", "updated_at"]
        read_only_fields = ["id", "nota", "feedback", "atividade_titulo", "aluno", "aluno_nome", "created_at", "updated_at"]

    def validate(self, data):
        request = self.context.get("request")
        aluno = request.user
        atividade = data.get("atividade")

        if atividade.turma != aluno.turma:
            raise serializers.ValidationError("Você não tem acesso à esta atividade.")
        
        if timezone.now() > atividade.data_entrega:
            raise serializers.ValidationError("O prazo para entregar esta atividade encerrou.")
        
        if Resposta.objects.filter(atividade=atividade, aluno=aluno).exists():
            raise serializers.ValidationError("Você já enviou uma resposta para esta atividade.")
        
        return data
    
    def create(self, validated_data):
        return super().create(validated_data)
    
class RespostaAlunoUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resposta
        fields = ["texto"]
    
    def validate(self, data):
        atividade = self.instance.atividade

        if timezone.now() > atividade.data_entrega:
            raise serializers.ValidationError("O prazo se encerrou. Não é possível alterar a resposta.")
        
        return data
    
class RespostaProfessorUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resposta
        fields = ["nota", "feedback"]
    
    def validate_nota(self, value):
        if value is None:
            raise serializers.ValidationError("A nota não foi inserida.")
        
        if value < 0 or value > 10:
            raise serializers.ValidationError("A nota tem que ser entre 0 e 10.")
        return value