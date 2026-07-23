/* eslint-disable @next/next/no-img-element */
"use client"

import { useCallback, useEffect, useState } from "react"
import Header from "../_components/header"
import { Badge } from "../_components/ui/badge"
import { Button } from "../_components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../_components/ui/dialog"
import { Input } from "../_components/ui/input"
import {
  getAdminUsers,
  getAdminUserStats,
  setUserBlocked,
  AdminUserRow,
  AdminUserStats,
} from "../_actions/admin-users"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  Ban,
  BadgeCheck,
  CalendarCheck,
  Loader2,
  LockOpen,
  Search,
  Users,
} from "lucide-react"
import { cn } from "../_lib/utils"
import { format } from "date-fns"

const roleLabel = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "Admin"
    case "MENSALISTAC":
      return "Mensalista Cabelo"
    case "MENSALISTAB":
      return "Mensalista Barba"
    case "MENSALISTACB":
      return "Mensalista Cabelo e Barba"
    default:
      return "Cliente"
  }
}

const Panel = () => {
  const { data, status } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<AdminUserStats | null>(null)
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [search, setSearch] = useState("")
  const [onlyBlocked, setOnlyBlocked] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<AdminUserRow | null>(null)
  const [isToggling, setIsToggling] = useState(false)

  const loadStats = useCallback(() => {
    getAdminUserStats()
      .then(setStats)
      .catch(() => toast.error("Erro ao carregar estatísticas."))
  }, [])

  const loadUsers = useCallback(
    async (searchTerm: string, blockedOnly: boolean) => {
      const result = await getAdminUsers({
        search: searchTerm,
        onlyBlocked: blockedOnly,
      })
      setUsers(result.users)
      setHasMore(result.hasMore)
    },
    [],
  )

  // Carga inicial
  useEffect(() => {
    if (status === "loading") return
    if (data?.user?.role !== "ADMIN") {
      setIsLoading(false)
      return
    }
    setIsAdmin(true)
    Promise.all([loadUsers("", false), getAdminUserStats().then(setStats)])
      .catch(() => toast.error("Erro ao carregar usuários."))
      .finally(() => setIsLoading(false))
  }, [data?.user?.role, status, loadUsers])

  // Busca com debounce
  useEffect(() => {
    if (!isAdmin) return
    const timeout = setTimeout(() => {
      loadUsers(search, onlyBlocked).catch(() =>
        toast.error("Erro ao buscar usuários."),
      )
    }, 400)
    return () => clearTimeout(timeout)
  }, [search, onlyBlocked, isAdmin, loadUsers])

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    try {
      const result = await getAdminUsers({
        search,
        onlyBlocked,
        skip: users.length,
      })
      setUsers((prev) => [...prev, ...result.users])
      setHasMore(result.hasMore)
    } catch {
      toast.error("Erro ao carregar mais usuários.")
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleToggleBlock = async () => {
    if (!confirmTarget) return
    setIsToggling(true)
    try {
      const result = await setUserBlocked(
        confirmTarget.id,
        !confirmTarget.blocked,
      )
      if (!result.success) {
        toast.error(
          result.error === "cannot_block_admin"
            ? "Não é possível bloquear um administrador."
            : "Erro ao atualizar o usuário.",
        )
        return
      }
      toast.success(
        confirmTarget.blocked
          ? `${confirmTarget.name ?? "Usuário"} desbloqueado!`
          : `${confirmTarget.name ?? "Usuário"} bloqueado! Ele não conseguirá mais agendar.`,
      )
      setUsers((prev) =>
        prev.map((u) =>
          u.id === confirmTarget.id ? { ...u, blocked: !u.blocked } : u,
        ),
      )
      loadStats()
    } finally {
      setIsToggling(false)
      setConfirmTarget(null)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <>
        <Header />
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    )
  }

  if (!isAdmin) {
    return (
      <>
        <Header />
        <div className="flex h-[60vh] flex-col items-center justify-center gap-2 px-5 text-center">
          <h1 className="font-display text-2xl">Acesso restrito</h1>
          <p className="text-muted-foreground">
            Esta área é exclusiva dos barbeiros.
          </p>
        </div>
      </>
    )
  }

  const statCards = [
    { label: "Clientes", value: stats?.total ?? "–", icon: Users },
    { label: "Mensalistas", value: stats?.mensalistas ?? "–", icon: BadgeCheck },
    { label: "Bloqueados", value: stats?.blocked ?? "–", icon: Ban },
  ]

  return (
    <>
      <Header />
      <div className="mx-auto max-w-5xl px-5 py-8">
        <h1 className="font-display text-3xl tracking-wide">
          Clientes <span className="text-primary">da barbearia</span>
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Veja todos os clientes e bloqueie contas que não devem mais agendar.
        </p>

        {/* ESTATÍSTICAS */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-border/60 bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </p>
                <card.icon size={16} className="text-primary" />
              </div>
              <p className="mt-2 font-display text-3xl">{card.value}</p>
            </div>
          ))}
        </div>

        {/* BUSCA + FILTRO */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail ou telefone..."
              className="rounded-xl pl-9"
            />
          </div>
          <Button
            variant={onlyBlocked ? "default" : "outline"}
            className="rounded-xl"
            onClick={() => setOnlyBlocked((v) => !v)}
          >
            <Ban size={15} />
            Só bloqueados
          </Button>
        </div>

        {/* LISTA */}
        <div className="space-y-3">
          {users.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              Nenhum usuário encontrado.
            </p>
          )}

          {users.map((user) => (
            <div
              key={user.id}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center sm:justify-between",
                user.blocked && "border-destructive/40 bg-destructive/5",
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={user.image || "/logo.png"}
                  alt={user.name || "Usuário"}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">
                      {user.name || "Sem nome"}
                    </p>
                    {user.role !== "USER" && (
                      <Badge
                        variant="outline"
                        className="border-primary/50 text-primary"
                      >
                        {roleLabel(user.role)}
                      </Badge>
                    )}
                    {user.blocked && (
                      <Badge variant="destructive">Bloqueado</Badge>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email}
                    {user.number ? ` • ${user.number}` : ""}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarCheck size={12} className="text-primary" />
                    {user.bookingsCount} agendamento
                    {user.bookingsCount === 1 ? "" : "s"} • cliente desde{" "}
                    {format(new Date(user.createdAt), "MM/yyyy")}
                  </p>
                </div>
              </div>

              {user.role !== "ADMIN" && (
                <Button
                  size="sm"
                  variant={user.blocked ? "outline" : "destructive"}
                  className="shrink-0 self-end sm:self-auto"
                  onClick={() => setConfirmTarget(user)}
                >
                  {user.blocked ? (
                    <>
                      <LockOpen size={14} />
                      Desbloquear
                    </>
                  ) : (
                    <>
                      <Ban size={14} />
                      Bloquear
                    </>
                  )}
                </Button>
              )}
            </div>
          ))}

          {hasMore && (
            <Button
              variant="outline"
              className="mx-auto flex w-full max-w-[240px]"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                "Carregar mais"
              )}
            </Button>
          )}
        </div>
      </div>

      {/* CONFIRMAÇÃO */}
      <Dialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
      >
        <DialogContent className="w-[90%] max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {confirmTarget?.blocked ? "Desbloquear" : "Bloquear"}{" "}
              {confirmTarget?.name ?? "usuário"}?
            </DialogTitle>
            <DialogDescription>
              {confirmTarget?.blocked
                ? "O cliente voltará a conseguir fazer agendamentos normalmente."
                : "O cliente continuará conseguindo entrar no site, mas não conseguirá mais fazer agendamentos até ser desbloqueado."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-3">
            <DialogClose asChild>
              <Button variant="secondary" className="w-full">
                Voltar
              </Button>
            </DialogClose>
            <Button
              variant={confirmTarget?.blocked ? "default" : "destructive"}
              className="w-full"
              onClick={handleToggleBlock}
              disabled={isToggling}
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : confirmTarget?.blocked ? (
                "Desbloquear"
              ) : (
                "Bloquear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Panel
