from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    PROFESSOR = 'professor'
    ALUNO = 'aluno'
    
    ROLES = [(PROFESSOR, 'Professor'), (ALUNO, 'Aluno')]

    role = models.CharField(
        max_length=20,
        choices=ROLES,
        default=ALUNO,
        verbose_name="Perfil",
    )

    turma = models.ForeignKey(
        "activities.Turma",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="alunos",
        verbose_name="Turma",
    )

    class Meta:
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"
    
    @property
    def is_professor(self):
        return self.role == self.PROFESSOR
    
    @property
    def is_aluno(self):
        return self.role == self.ALUNO
    
    def clean(self):
        from django.core.exceptions import ValidationError

        if self.is_superuser:
            self.role = self.PROFESSOR
            return
        
        if self.is_aluno and not self.turma:
            raise ValidationError({"turma": "Aluno deve estar vinculado a uma turma"})
        
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)