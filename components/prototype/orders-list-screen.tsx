'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bike,
  LogOut,
  Loader2,
  Plus,
  Receipt,
  Search,
  Store,
  X,
} from 'lucide-react'
import {
  type Pedido,
  type StatusPedido,
  type TipoEntrega,
  TIPO_ENTREGA_LABEL,
  STATUS_LABEL,
  formatBRL,
  formatDataHora,
} from '@/lib/pedidos'
import { FilterChip, MdButton, StatusChip } from './md3'

export type ListState = 'carregando' | 'erro' | 'ok'

/* Status oferecidos no filtro conforme especificação */
const STATUS_FILTRO: StatusPedido[] = ['em preparo', 'em rota', 'entregue']

function OrderCard({ pedido, onOpen }: { pedido: Pedido; onOpen: () => void }) {
  const qtdItens = pedido.itens.reduce((s, i) => s + i.quantidade, 0)
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-secondary/40 active:bg-secondary/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-medium text-foreground">{pedido.clienteNome}</p>
          <p className="text-sm text-muted-foreground">Pedido #{pedido.numero}</p>
        </div>
        <StatusChip status={pedido.status} />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {pedido.tipoEntrega === 'entrega' ? (
          <Bike className="size-4 shrink-0" />
        ) : (
          <Store className="size-4 shrink-0" />
        )}
        <span>{TIPO_ENTREGA_LABEL[pedido.tipoEntrega]}</span>
        <span aria-hidden>·</span>
        <span>
          {qtdItens} {qtdItens === 1 ? 'item' : 'itens'}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-xs text-muted-foreground">{formatDataHora(pedido.criadoEm)}</span>
        <span className="text-base font-medium text-foreground">
          {formatBRL(pedido.valorTotal)}
        </span>
      </div>
    </button>
  )
}

export function OrdersListScreen({
  pedidos,
  estado,
  onRetry,
  onCreate,
  onOpen,
  onLogout,
}: {
  pedidos: Pedido[]
  estado: ListState
  onRetry: () => void
  onCreate: () => void
  onOpen: (id: string) => void
  onLogout: () => void
}) {
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState<StatusPedido | null>(null)
  const [tipo, setTipo] = useState<TipoEntrega | null>(null)
  const [data, setData] = useState('')

  const filtrados = useMemo(() => {
    return pedidos.filter((p) => {
      const termo = busca.trim().toLowerCase()
      const casaBusca =
        termo === '' ||
        p.clienteNome.toLowerCase().includes(termo) ||
        String(p.numero).includes(termo)
      const casaStatus = !status || p.status === status
      const casaTipo = !tipo || p.tipoEntrega === tipo
      const casaData = !data || p.criadoEm.slice(0, 10) === data
      return casaBusca && casaStatus && casaTipo && casaData
    })
  }, [pedidos, busca, status, tipo, data])

  const temFiltro = !!status || !!tipo || !!data || busca.trim() !== ''

  function limparFiltros() {
    setBusca('')
    setStatus(null)
    setTipo(null)
    setData('')
  }

  return (
    <div className="flex min-h-dvh flex-col pb-24">
      <header className="sticky top-0 z-20 bg-background/95 px-4 pb-2 pt-4 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-medium text-foreground">Pedidos</h1>
            <p className="text-sm text-muted-foreground">Forno Digital · Cozinha e entregas</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Sair"
            className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
          >
            <LogOut className="size-5" />
          </button>
        </div>

        {/* Busca */}
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente ou nº do pedido"
            className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/25"
          />
        </div>

        {/* Filtros de status */}
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {STATUS_FILTRO.map((s) => (
            <FilterChip
              key={s}
              active={status === s}
              onClick={() => setStatus(status === s ? null : s)}
            >
              {STATUS_LABEL[s]}
            </FilterChip>
          ))}
        </div>

        {/* Filtros de tipo e data */}
        <div className="mt-2 flex gap-2">
          <div className="flex flex-1 gap-2">
            <FilterChip active={tipo === 'entrega'} onClick={() => setTipo(tipo === 'entrega' ? null : 'entrega')}>
              Entrega
            </FilterChip>
            <FilterChip active={tipo === 'retirada'} onClick={() => setTipo(tipo === 'retirada' ? null : 'retirada')}>
              Retirada
            </FilterChip>
          </div>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            aria-label="Filtrar por data"
            className="h-9 rounded-lg border border-border bg-card px-2 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>

        {temFiltro && (
          <button
            type="button"
            onClick={limparFiltros}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            <X className="size-4" />
            Limpar filtros
          </button>
        )}
      </header>

      <div className="flex flex-1 flex-col px-4 pt-2">
        {estado === 'carregando' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm">Carregando pedidos…</p>
          </div>
        )}

        {estado === 'erro' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-7" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">
                Não foi possível carregar os pedidos
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Verifique sua conexão e tente novamente.
              </p>
            </div>
            <MdButton variant="tonal" onClick={onRetry}>
              Tentar novamente
            </MdButton>
          </div>
        )}

        {estado === 'ok' && filtrados.length === 0 && temFiltro && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Search className="size-7" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">Nenhum pedido encontrado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajuste a busca ou os filtros para ver outros resultados.
              </p>
            </div>
            <MdButton variant="text" onClick={limparFiltros}>
              Limpar filtros
            </MdButton>
          </div>
        )}

        {estado === 'ok' && filtrados.length === 0 && !temFiltro && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Receipt className="size-8" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">Nenhum pedido ainda</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Assim que um pedido for registrado, ele aparece aqui. Que tal criar o primeiro?
              </p>
            </div>
            <MdButton icon={Plus} onClick={onCreate}>
              Criar primeiro pedido
            </MdButton>
          </div>
        )}

        {estado === 'ok' && filtrados.length > 0 && (
          <>
            <p className="pb-2 pt-1 text-xs text-muted-foreground">
              {filtrados.length} {filtrados.length === 1 ? 'pedido' : 'pedidos'}
            </p>
            <ul className="flex flex-col gap-3">
              {filtrados.map((p) => (
                <li key={p.id}>
                  <OrderCard pedido={p} onOpen={() => onOpen(p.id)} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* FAB de criar em destaque */}
      {estado === 'ok' && (
        <button
          type="button"
          onClick={onCreate}
          className="fixed bottom-6 right-6 z-30 flex h-14 items-center gap-2 rounded-2xl bg-primary px-5 text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-100"
        >
          <Plus className="size-6" />
          <span className="text-sm font-medium">Novo pedido</span>
        </button>
      )}
    </div>
  )
}
