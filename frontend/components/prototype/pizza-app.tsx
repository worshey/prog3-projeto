'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { type Pedido, PEDIDOS_EXEMPLO } from '@/lib/pedidos'
import { LoginScreen } from './login-screen'
import { RegisterScreen } from './register-screen'
import { OrdersListScreen, type ListState } from './orders-list-screen'
import { OrderFormScreen } from './order-form-screen'
import { OrderDetailScreen } from './order-detail-screen'

type Tela =
  | { nome: 'login' }
  | { nome: 'cadastro' }
  | { nome: 'lista' }
  | { nome: 'form'; pedidoId: string | null }
  | { nome: 'detalhe'; pedidoId: string }

export function PizzaApp() {
  const [tela, setTela] = useState<Tela>({ nome: 'login' })
  const [pedidos, setPedidos] = useState<Pedido[]>(PEDIDOS_EXEMPLO)
  const [estadoLista, setEstadoLista] = useState<ListState>('carregando')
  const [snackbar, setSnackbar] = useState<string | null>(null)
  const [proximoNumero, setProximoNumero] = useState(1043)

  // Simula o carregamento inicial dos pedidos ao entrar na lista
  function carregarPedidos() {
    setEstadoLista('carregando')
    const timer = setTimeout(() => setEstadoLista('ok'), 900)
    return () => clearTimeout(timer)
  }

  useEffect(() => {
    if (tela.nome === 'lista' && estadoLista === 'carregando') {
      return carregarPedidos()
    }
  }, [tela.nome, estadoLista])

  function mostrarSnackbar(msg: string) {
    setSnackbar(msg)
  }

  useEffect(() => {
    if (!snackbar) return
    const t = setTimeout(() => setSnackbar(null), 3000)
    return () => clearTimeout(t)
  }, [snackbar])

  function irParaLista() {
    setEstadoLista('carregando')
    setTela({ nome: 'lista' })
  }

  const pedidoAtual =
    tela.nome === 'detalhe' || (tela.nome === 'form' && tela.pedidoId)
      ? pedidos.find((p) => p.id === (tela as { pedidoId: string }).pedidoId) ?? null
      : null

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-background">
      {tela.nome === 'login' && (
        <LoginScreen onLogin={irParaLista} onGoToRegister={() => setTela({ nome: 'cadastro' })} />
      )}

      {tela.nome === 'cadastro' && (
        <RegisterScreen
          onBack={() => setTela({ nome: 'login' })}
          onRegistered={() => setTela({ nome: 'login' })}
        />
      )}

      {tela.nome === 'lista' && (
        <OrdersListScreen
          pedidos={pedidos}
          estado={estadoLista}
          onRetry={() => setEstadoLista('carregando')}
          onCreate={() => setTela({ nome: 'form', pedidoId: null })}
          onOpen={(id) => setTela({ nome: 'detalhe', pedidoId: id })}
          onLogout={() => setTela({ nome: 'login' })}
        />
      )}

      {tela.nome === 'form' && (
        <OrderFormScreen
          pedido={pedidoAtual}
          onCancel={() =>
            pedidoAtual
              ? setTela({ nome: 'detalhe', pedidoId: pedidoAtual.id })
              : setTela({ nome: 'lista' })
          }
          onSave={(dados) => {
            if (pedidoAtual) {
              setPedidos((atual) =>
                atual.map((p) => (p.id === pedidoAtual.id ? { ...p, ...dados } : p)),
              )
              mostrarSnackbar('Pedido atualizado com sucesso.')
              setTela({ nome: 'detalhe', pedidoId: pedidoAtual.id })
            } else {
              const novo: Pedido = {
                ...dados,
                id: `ped-${proximoNumero}`,
                numero: proximoNumero,
                criadoEm: new Date().toISOString(),
              }
              setPedidos((atual) => [novo, ...atual])
              setProximoNumero((n) => n + 1)
              mostrarSnackbar('Pedido criado com sucesso.')
              setTela({ nome: 'lista' })
            }
          }}
        />
      )}

      {tela.nome === 'detalhe' && pedidoAtual && (
        <OrderDetailScreen
          pedido={pedidoAtual}
          onBack={() => setTela({ nome: 'lista' })}
          onEdit={() => setTela({ nome: 'form', pedidoId: pedidoAtual.id })}
          onDelete={() => {
            setPedidos((atual) => atual.filter((p) => p.id !== pedidoAtual.id))
            mostrarSnackbar('Pedido excluído.')
            setTela({ nome: 'lista' })
          }}
        />
      )}

      {/* Snackbar de sucesso (MD3) */}
      {snackbar && (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl bg-status-entregue px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg"
          >
            <CheckCircle2 className="size-5" />
            {snackbar}
          </div>
        </div>
      )}
    </main>
  )
}
