# MaisMassa — API de gestão de pizzaria

API em FastAPI onde cada conta tem o próprio cardápio: pizzas são
criadas, listadas, editadas e apagadas sempre dentro do escopo de quem
está logado. Autenticação por JWT, banco via SQLAlchemy + Alembic
(SQLite para desenvolvimento, PostgreSQL em produção).

## Requisitos

- Python 3.11+
- [Poetry](https://python-poetry.org/docs/#installation)
- PostgreSQL (só quando for rodar contra Postgres — veja o passo 8)

## Passo a passo para rodar do zero

### 1. Instalar as dependências

```bash
cd backend
poetry install
```

### 2. Conferir o `.env`

Já existe um `.env` de exemplo neste repositório (não vai para o Git —
está no `.gitignore`). Por padrão ele aponta para SQLite:

```env
DATABASE_URL=sqlite:///./maismassa.db
SECRET_KEY=<uma chave qualquer>
```

Antes de subir para produção, gere sua própria `SECRET_KEY` (é ela que
assina o token JWT — quem tiver essa chave forja um login válido para
qualquer usuário):

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### 3. Rodar as migrações

O schema do banco **não** nasce de `create_all` — quem cria e altera
tabelas é o Alembic:

```bash
poetry run alembic upgrade head
```

Isso cria `maismassa.db` (um arquivo SQLite) já com as tabelas
`usuarios`, `pizzas` e o relacionamento entre elas.

### 4. Subir a API

```bash
poetry run uvicorn app.main:app --reload
```

### 5. Abrir a documentação interativa

Acesse **http://127.0.0.1:8000/docs** — o Swagger UI gerado
automaticamente pelo FastAPI, com todas as rotas, os schemas de
entrada/saída e um botão para testar cada uma direto do navegador.

### 6. Criar uma conta e autenticar

Pelo `/docs` ou por linha de comando:

```bash
# cria a conta
curl -X POST http://127.0.0.1:8000/usuarios/ \
  -H "Content-Type: application/json" \
  -d '{"email": "ana@exemplo.com", "senha": "senha1234"}'

# faz login e recebe o token
curl -X POST http://127.0.0.1:8000/auth/login \
  -d "username=ana@exemplo.com&password=senha1234"
```

No `/docs`, clique no botão **Authorize** (cadeado no topo) e informe
o e-mail/senha no formulário — o Swagger cuida de pedir o token e
anexar `Authorization: Bearer <token>` em toda chamada seguinte.

### 7. Usar o cardápio

Todas as rotas de `/pizzas` exigem o token do passo anterior. Cada
pizza criada é automaticamente vinculada a quem está logado, e a
listagem só devolve as pizzas da própria conta:

```bash
TOKEN="<token recebido no login>"

curl -X POST http://127.0.0.1:8000/pizzas/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome": "Muçarela", "preco": 35.50}'

curl http://127.0.0.1:8000/pizzas/ -H "Authorization: Bearer $TOKEN"

# busca e filtro combináveis
curl "http://127.0.0.1:8000/pizzas/?nome=muça&disponivel=true" \
  -H "Authorization: Bearer $TOKEN"
```

As regras de negócio completas (o que gera cada erro e por quê) estão
em [`docs/regras-de-negocio.md`](docs/regras-de-negocio.md).

### 8. Trocando para PostgreSQL

1. Suba um Postgres e crie banco/usuário (localmente, via Docker, ou
   um serviço gerenciado):

   ```sql
   CREATE DATABASE maismassa;
   CREATE USER maismassa WITH PASSWORD 'senha_secreta';
   GRANT ALL PRIVILEGES ON DATABASE maismassa TO maismassa;
   ```

2. No `.env`, comente a linha do SQLite e descomente a do Postgres
   (já vem pronta, só trocar o comentário):

   ```env
   DATABASE_URL=postgresql+psycopg://maismassa:senha_secreta@localhost:5432/maismassa
   ```

3. Rode as migrações de novo — agora contra o banco novo:

   ```bash
   poetry run alembic upgrade head
   ```

4. Suba a API normalmente:

   ```bash
   poetry run uvicorn app.main:app --reload
   ```

**Nenhum arquivo dentro de `app/` muda nesse processo.** A única linha
do projeto que sabe qual banco está rodando é a que monta os
`connect_args` em `app/database.py`, e ela reage sozinha ao prefixo da
URL — trocar `DATABASE_URL` e rodar `alembic upgrade head` é o
suficiente.

## Estrutura do projeto

```
app/
  main.py            # monta o FastAPI, registra rotas e traduz erros em HTTP
  database.py         # engine, sessão e Base do SQLAlchemy
  auth/security.py     # hash de senha, emissão/leitura do JWT
  usuarios/            # modelo, schemas, repository, service, controller de contas
  pizzas/               # modelo, schemas, repository, service, controller do cardápio
migrations/            # Alembic: histórico de mudanças no schema
docs/regras-de-negocio.md
```

Cada módulo de domínio segue a mesma separação: `controller` fala
HTTP, `service` decide as regras de negócio, `repository` fala com o
banco. Um `service` nunca levanta `HTTPException` e um `repository`
nunca aparece fora do próprio módulo — quem traduz uma recusa de
domínio em código HTTP é o tradutor registrado uma única vez em
`app/main.py`.

## Autenticação e isolamento por conta

- Toda rota de `/pizzas` exige `Authorization: Bearer <token>`.
- Ao criar uma pizza, ela é automaticamente vinculada à conta logada.
- Ao listar, buscar, editar ou apagar, cada conta só enxerga as
  próprias pizzas — tentar acessar uma pizza de outra conta pelo id
  devolve `404`, o mesmo erro de um id que não existe.

## Validação

Os schemas de entrada (Pydantic) recusam dados inválidos com mensagens
específicas por campo, por exemplo:

```json
{
  "detail": [
    {"campo": "senha", "mensagem": "String should have at least 8 characters"},
    {"campo": "preco", "mensagem": "Input should be greater than 0"}
  ]
}
```

## Rodando os testes de fumaça manualmente

Com a API no ar, uma sequência rápida para conferir que tudo está de
pé (substitua os tokens pelos que você receber no login):

```bash
BASE=http://127.0.0.1:8000

curl -X POST $BASE/usuarios/ -H "Content-Type: application/json" \
  -d '{"email": "ana@exemplo.com", "senha": "senha1234"}'

TOKEN=$(curl -s -X POST $BASE/auth/login \
  -d "username=ana@exemplo.com&password=senha1234" \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

curl -X POST $BASE/pizzas/ -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome": "Calabresa", "preco": 38}'

curl "$BASE/pizzas/?disponivel=true" -H "Authorization: Bearer $TOKEN"
```
