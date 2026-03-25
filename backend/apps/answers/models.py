from django.db import models

class Resposta(models.Model):
    texto = models.TextField()
    nota = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True
    )
    atividade = models.ForeignKey("activities.Atividade", on_delete=models.CASCADE, related_name="respostas")
    aluno = models.ForeignKey("accounts.Usuario", on_delete=models.CASCADE, related_name="respostas")
    feedback = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Resposta"
        verbose_name_plural = "Respostas"
        unique_together = ("atividade", "aluno")
    
    def __str__(self):
        return f"Resposta de {self.aluno} - {self.atividade}"