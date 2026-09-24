# Regras de negócio — MaisMassa

Cada regra abaixo tem um código (`RNxx`) e existe em algum lugar do
`service.py` correspondente — nunca no `controller.py`, nunca no
`repository.py`.

## Cardápio (`app/pizzas`)

Desde que o cardápio passou a ser por conta (uma pizza sempre pertence
a quem a cadastrou — ver RN06), toda regra abaixo que fala em "o
cardápio" quer dizer "o cardápio *daquele* usuário", nunca o de todos.

### RN01 — Nome não se repete no cardápio da mesma conta
Não é possível cadastrar duas pizzas com o mesmo nome **na mesma
conta**. Ao criar ou renomear uma pizza, o sistema verifica se já
existe outra com aquele nome pertencente ao mesmo usuário e recusa com
`NomeJaCadastrado` (HTTP `409`). Duas contas diferentes podem ter, cada
uma, uma pizza chamada "Muçarela" sem conflito nenhum.

### RN02 — Disponibilidade não se edita pelo cardápio
O campo `disponivel` não pode ser alterado por uma edição comum da
pizza (`PATCH /pizzas/{id}`). Quem controla se uma pizza está em
estoque é o fluxo de controle de estoque/cozinha (fora do escopo desta
entrega) — não o cadastro do cardápio. Tentar mudar esse campo por
aqui gera `CampoNaoEditavel` (HTTP `409`).

### RN03 — Pizza fora de estoque não é removida do cardápio
Uma pizza com `disponivel = False` (fora de estoque no momento) não
pode ser apagada — ela some da vitrine ao ficar indisponível, mas o
cadastro continua existindo até voltar ao estoque. A tentativa de
apagar gera `PizzaIndisponivel` (HTTP `409`).

### RN06 — Toda pizza pertence a quem a cadastrou
`POST /pizzas/` vincula a pizza criada automaticamente ao usuário do
token (`usuario_id`), sem o cliente informar isso. `GET /pizzas/`
devolve só as pizzas do usuário logado, nunca as de outra conta.
Buscar, editar ou apagar uma pizza que existe mas pertence a outro
usuário dá o mesmo `PizzaNaoEncontrada` (HTTP `404`) de uma pizza que
não existe — de propósito, para não revelar que o id pertence a
alguém (mesma lógica de não vazar pista que a RN05 já aplica no
login).

### RN07 — Busca e filtro na listagem
`GET /pizzas/` aceita dois parâmetros de busca opcionais, combináveis
entre si e sempre restritos ao cardápio do usuário logado (RN06):
- `nome`: busca parcial e sem diferenciar maiúsculas/minúsculas
  (`?nome=muça` encontra "Muçarela").
- `disponivel`: filtra por `true` ou `false`.

## Contas (`app/usuarios`)

### RN04 — Um e-mail abre uma única conta
Não é possível cadastrar duas contas com o mesmo e-mail. A tentativa
gera `EmailJaCadastrado` (HTTP `409`).

### RN05 — Login não distingue e-mail inexistente de senha errada
Se o e-mail não existe ou a senha não confere com o hash salvo, a
resposta é sempre a mesma mensagem genérica (`CredenciaisInvalidas`,
HTTP `401`). Isso evita que alguém descubra, por tentativa e erro,
quais e-mails têm conta no sistema.

## Convenção seguida em todas as regras

- O `service.py` é quem decide. Ele nunca levanta `HTTPException` e
  nunca escreve `db.query`.
- O `controller.py` só recebe a requisição, delega para o `service` e
  devolve a resposta.
- Quem traduz uma recusa (`ErroDePizza`, `ErroDeUsuario`) em código HTTP
  é o tradutor registrado uma única vez em `app/main.py`.
