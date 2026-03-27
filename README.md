# Plataforma de Atividades Escolares
Aplicação web para gestão de atividades escolares. Professores criam atividades e corrigem respostas, alunos visualizam atividades e enviam respostas.
---
## Como rodar 
```bash
docker compose up --build
```
(Um adendo, normalmente o comando no terminal seria normalmente assim "docker compose up --build", porém, tive erros pra rodar dessa forma por conta de uma incompatibilidade do docker com as novas versões do python onde uma biblioteca foi descontinuada, então por favor utilize o comando do docker da maneira acima. Obrigado!)

Após a inicialização:
Frontend: http://localhost:5173
Backend: http://localhost:8000

## Usuários
Como não foi informado alguma maneira dos usuários serem cadastrados tomei liberdade para criar um usuário admin e uma rota para criar usuários (tanto professor quanto aluno), vou deixar listado abaixo todos os usuários que foram criados **para o uso do sistema**.
| Login                  | Senha  |
|------------------------|--------|
| admin@email.com        | admin  | usuário admin
| tiagoprof@email.com    | 123456 | usuário professor
| prof@email.com         | 123456 | usuário professor
| fernando@email.com     | 123456 | usuário aluno
| aluno@email.com        | 123456 | usuário aluno
| clara@email.com        | 123456 | usuário aluno
| tatiana@email.com      | 123456 | usuário aluno

## Decisões técnicas
### Backend
**Django**
Escolhidos por serem o requisito do teste.
**Autenticação por JWT**
JWT foi adotado por ser stateless, ou seja, não exigindo sessões no servidor. O token de acesso expira em 1 hora e o refresh token em 7 dias. O refresh é feito automaticamente pelo Axios no front.
**Modelo de usuário customizado (`AbstractUser`)**
Extender `AbstractUser` permite adicionar os campos `role` (professor/aluno) e `turma` sem perder nenhuma funcionalidade nativa do Django (admin, autenticação, permissões).
**SQLite**
Utilizado por simplicidade no ambiente de desenvolvimento.
**Separação de views por responsabilidade**
Cada endpoint tem sua própria view com responsabilidade única (ex: `MinhasAtividadesView` só faz GET, `CriarAtividadeView` só faz POST), tornando o código mais legível e fácil de manter.
**Validações no serializer, não na view**
Regras de negócio como "aluno não pode enviar resposta de outra turma" ou "prazo encerrado" são validadas nos serializers, centralizando a lógica e facilitando testes.
### Frontend
**React + TypeScript + Vite**
Utilizei React por ser um requisito e TypeScript com Vite por estar familiarizado com as tecnologias pois uso no meu trabalho.
**Tailwind**
Estilização mais bonita e mais agradável, também pela simplicidade do código.
**Axios com interceptor de refresh**
O cliente Axios centraliza o JWT no header de todas as requisições. Um interceptor de resposta captura erros, renova o token automaticamente via `POST /auth/token/refresh/` e reenvia a requisição original sem que o usuário perceba.
**Estado global mínimo (apenas AuthContext)**
A sessão do usuário é o único estado global necessário. O estado das telas (listas, modais, formulários) é mantido localmente com `useState`.
**Guards de rota por perfil**
`RoleRoute` e `AdminRoute` protegem rotas no frontend por role e `is_superuser`, redirecionando para `/login` caso o usuário não tenha permissão. A segurança real é garantida pelo backend.
