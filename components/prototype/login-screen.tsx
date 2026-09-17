'use client'

import { useState, type FormEvent } from 'react'
import { AlertCircle, Loader2, Pizza } from 'lucide-react'
import { MdButton, TextField } from './md3'

/* Credenciais de exemplo — protótipo sem autenticação real */
const EMAIL_DEMO = 'gerente@fornodigital.com'
const SENHA_DEMO = 'pizza123'

export function LoginScreen({
  onLogin,
  onGoToRegister,
}: {
  onLogin: () => void
  onGoToRegister: () => void
}) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setCarregando(true)
    // Simula chamada de rede à API FastAPI
    setTimeout(() => {
      if (email.trim() === EMAIL_DEMO && senha === SENHA_DEMO) {
        onLogin()
      } else {
        setErro('E-mail ou senha incorretos. Verifique os dados e tente novamente.')
        setCarregando(false)
      }
    }, 1100)
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-sm">
            <Pizza className="size-8" />
          </div>
          <h1 className="mt-4 text-2xl font-medium text-foreground">Forno Digital</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestão integrada para a sua pizzaria
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {erro && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <TextField
            label="E-mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="voce@pizzaria.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Senha"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <MdButton type="submit" fullWidth disabled={carregando} className="mt-2">
            {carregando ? (
              <>
                <Loader2 className="size-[18px] animate-spin" />
                Entrando…
              </>
            ) : (
              'Entrar'
            )}
          </MdButton>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Ainda não tem conta?{' '}
          <button
            type="button"
            onClick={onGoToRegister}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Criar cadastro
          </button>
        </div>

        <div className="mt-8 rounded-xl bg-secondary/60 px-4 py-3 text-center text-xs text-secondary-foreground">
          Acesso de demonstração — e-mail{' '}
          <span className="font-medium">{EMAIL_DEMO}</span> · senha{' '}
          <span className="font-medium">{SENHA_DEMO}</span>
        </div>
      </div>
    </div>
  )
}
