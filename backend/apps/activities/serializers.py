from rest_framework import serializers
from .models import Atividade, Turma
from django.utils import timezone

class TurmaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turma
        fields = ["id", "nome"]
    
class AtividadeSerializer(serializers.ModelSerializer):
    turma_nome = serializers.CharField(source="turma.nome", read_only=True)
    professor_nome = serializers.CharField(source="professor.get_full_name", read_only=True)

    class Meta:
        model = Atividade
        fields = ["id", "titulo", "descricao", "turma", "turma_nome", "data_entrega", "professor", "professor_nome"]
        read_only_fields = ["id", "professor", "professor_nome", "turma_nome"]

    def validate_data_entrega(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("A data de entrega já foi ultrapassada.")
        return value
    
    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["professor"] = request.user
        return super().create(validated_data)
    
class AtividadeResumoSerializer(serializers.ModelSerializer):
    descricao = serializers.SerializerMethodField()

    class Meta:
        model = Atividade
        fields = ["id", "titulo", "descricao", "data_entrega"]
    
    def get_descricao(self, obj):
        if len(obj.descricao) > 100:
            return obj.descricao[:100] + "..."
        else:
            return obj.descricao