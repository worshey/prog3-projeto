'use client'

import { useState, type FormEvent } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { MdButton, TextField, TopAppBar } from './md3'

type Erros = {
  nome?: string
  email?: string
  senha?: string
}

export function RegisterScreen({
  onBack,
  onRegistered,
}: {
  onBack: () => void
  onRegistered: () => void
}) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState<Erros>({})
  const [carregando, setCarregando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  function validar(): Erros {
    const e: Erros = {}
    if (nome.trim().length < 3) e.nome = 'Informe seu nome completo (mín. 3 caracteres).'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = 'Informe um e-mail válido.'
    if (senha.length < 6) e.senha = 'A senha deve ter no mínimo 6 caracteres.'
    return e
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault()
    const e = validar()
    setErros(e)
    if (Object.keys(e).length > 0) return
    setCarregando(true)
    setTimeout(() => {
      setCarregando(false)
      setSucesso(true)
    }, 1100)
  }

  if (sucesso) {
    return (
      <div className="flex min-h-dvh flex-col">
        <TopAppBar title="Cadastro" onBack={onBack} />
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-status-entregue-container text-status-entregue">
            <CheckCircle2 className="size-9" />
          </div>
          <h2 className="mt-4 text-xl font-medium text-foreground">Cadastro concluído!</h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Sua conta foi criada com sucesso. Faça login para começar a gerenciar os pedidos.
          </p>
          <MdButton onClick={onRegistered} className="mt-6" icon={undefined}>
            Ir para o login
          </MdButton>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopAppBar title="Criar cadastro" onBack={onBack} />
      <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-4 px-6 py-4">
        <p className="text-sm text-muted-foreground">
          Preencha os dados abaixo para criar seu acesso à equipe.
        </p>

        <TextField
          label="Nome completo"
          placeholder="Ex.: Maria da Silva"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          error={erros.nome}
          hint="Como você aparece para a equipe."
          required
        />
        <TextField
          label="E-mail"
          type="email"
          inputMode="email"
          placeholder="voce@pizzaria.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={erros.email}
          required
        />
        <TextField
          label="Senha"
          type="password"
          placeholder="Crie uma senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          error={erros.senha}
          hint="Mínimo de 6 caracteres."
          required
        />

        <MdButton type="submit" fullWidth disabled={carregando} className="mt-2">
          {carregando ? (
            <>
              <Loader2 className="size-[18px] animate-spin" />
              Criando conta…
            </>
          ) : (
            'Criar conta'
          )}
        </MdButton>
      </form>
    </div>
  )
}
