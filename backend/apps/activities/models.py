from django.db import models

class Turma(models.Model):
    nome = models.CharField(max_length=100)

    class Meta:
        verbose_name = "Turma"
        verbose_name_plural = "Turmas"
        ordering = ["nome"]
    
    def __str__(self):
        return self.nome
    
class Atividade(models.Model):
    titulo = models.CharField(max_length=100)
    descricao = models.TextField()
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE, related_name="atividades")
    data_entrega = models.DateTimeField()
    professor = models.ForeignKey("accounts.Usuario", on_delete=models.CASCADE, related_name="atividades")

    class Meta:
        verbose_name = "Atividade"
        verbose_name_plural = "Atividades"
        ordering = ["data_entrega"]

    def __str__(self):
        return self.titulo