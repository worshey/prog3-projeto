# Regras de negócio — MaisMassa

Cada regra abaixo tem um código (`RNxx`) e existe em algum lugar do
`service.py` correspondente — nunca no `controller.py`, nunca no
`repository.py`.

## Cardápio (`app/pizzas`)

### RN01 — Nome não se repete no cardápio
Não é possível cadastrar duas pizzas com o mesmo nome. Ao criar ou
renomear uma pizza, o sistema verifica se já existe outra com aquele
nome e recusa com `NomeJaCadastrado` (HTTP `409`).

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
