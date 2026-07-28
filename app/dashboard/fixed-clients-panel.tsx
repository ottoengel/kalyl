"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CalendarClock,
  Loader2,
  Pause,
  Pencil,
  Play,
  Plus,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "../_components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../_components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../_components/ui/select"
import { cn } from "../_lib/utils"
import {
  createFixedClient,
  deleteFixedClient,
  FixedClientWithSkips,
  getFixedClients,
  setFixedClientActive,
  skipFixedOccurrence,
  unskipFixedOccurrence,
  updateFixedClient,
} from "../_actions/fixed-clients"
import {
  DAY_OF_WEEK_LABELS,
  FREQUENCY_LABELS,
  FixedFrequency,
  nextFixedOccurrences,
} from "../_lib/fixed-clients"
import { generateTimeSlots, getSlotStep } from "../_lib/schedule"
import { addDays } from "date-fns"

interface FixedClientsPanelProps {
  barbers: { id: string; name: string }[]
  /** avisa o dashboard para recarregar a grade de horários */
  onChanged?: () => void
}

interface FormState {
  id?: string
  barberId: string
  clientName: string
  phone: string
  frequency: FixedFrequency
  dayOfWeek: number
  time: string
  durationMinutes: number
  startDate: string // yyyy-MM-dd
  notes: string
}

const emptyForm = (barberId: string): FormState => ({
  barberId,
  clientName: "",
  phone: "",
  frequency: "SEMANAL",
  dayOfWeek: 6,
  time: "",
  durationMinutes: 60,
  startDate: format(new Date(), "yyyy-MM-dd"),
  notes: "",
})

const inputClass =
  "h-9 w-full rounded-xl border border-input bg-secondary/50 px-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"

/** Um dia futuro qualquer com o dayOfWeek desejado, só para gerar os labels de slots */
const sampleDayForWeekday = (dayOfWeek: number) => {
  let d = new Date()
  for (let i = 0; i < 7; i++) {
    if (d.getDay() === dayOfWeek) return d
    d = addDays(d, 1)
  }
  return d
}

const dayKey = (d: Date | string) => format(new Date(d), "yyyy-MM-dd")

const FixedClientsPanel = ({ barbers, onChanged }: FixedClientsPanelProps) => {
  const [clients, setClients] = useState<FixedClientWithSkips[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm(""))
  const [deleteTarget, setDeleteTarget] = useState<FixedClientWithSkips | null>(
    null,
  )
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const loadClients = useCallback(async () => {
    try {
      setClients(await getFixedClients())
    } catch {
      toast.error("Erro ao carregar clientes fixos.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const barberName = (id: string) =>
    barbers.find((b) => b.id === id)?.name ?? "—"

  // Slots possíveis para o barbeiro/dia escolhidos no formulário
  const formTimeOptions = useMemo(() => {
    if (!form.barberId) return []
    return generateTimeSlots(
      form.barberId,
      sampleDayForWeekday(form.dayOfWeek),
      form.durationMinutes,
    )
  }, [form.barberId, form.dayOfWeek, form.durationMinutes])

  const openCreate = () => {
    setForm(emptyForm(barbers[0]?.id ?? ""))
    setFormOpen(true)
  }

  const openEdit = (client: FixedClientWithSkips) => {
    setForm({
      id: client.id,
      barberId: client.barberId,
      clientName: client.clientName,
      phone: client.phone ?? "",
      frequency: client.frequency as FixedFrequency,
      dayOfWeek: client.dayOfWeek,
      time: client.time,
      durationMinutes: client.durationMinutes,
      startDate: format(new Date(client.startDate), "yyyy-MM-dd"),
      notes: client.notes ?? "",
    })
    setFormOpen(true)
  }

  const handleSave = () => {
    if (!form.barberId || !form.clientName.trim() || !form.time) {
      toast.error("Preencha barbeiro, nome e horário.")
      return
    }
    startTransition(async () => {
      try {
        const payload = {
          barberId: form.barberId,
          clientName: form.clientName,
          phone: form.phone || undefined,
          frequency: form.frequency,
          dayOfWeek: form.dayOfWeek,
          time: form.time,
          durationMinutes: form.durationMinutes,
          startDate: new Date(`${form.startDate}T00:00:00`),
          notes: form.notes || undefined,
        }
        if (form.id) {
          await updateFixedClient(form.id, payload)
          toast.success("Cliente fixo atualizado!")
        } else {
          await createFixedClient(payload)
          toast.success("Cliente fixo criado!")
        }
        setFormOpen(false)
        await loadClients()
        onChanged?.()
      } catch {
        toast.error("Erro ao salvar cliente fixo.")
      }
    })
  }

  const handleToggleActive = (client: FixedClientWithSkips) => {
    startTransition(async () => {
      try {
        await setFixedClientActive(client.id, !client.active)
        toast.success(
          client.active
            ? `${client.clientName} pausado — horários liberados.`
            : `${client.clientName} reativado!`,
        )
        await loadClients()
        onChanged?.()
      } catch {
        toast.error("Erro ao atualizar cliente fixo.")
      }
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      try {
        await deleteFixedClient(deleteTarget.id)
        toast.success(`${deleteTarget.clientName} removido.`)
        setDeleteTarget(null)
        await loadClients()
        onChanged?.()
      } catch {
        toast.error("Erro ao remover cliente fixo.")
      }
    })
  }

  const handleToggleOccurrence = (
    client: FixedClientWithSkips,
    date: Date,
    isSkipped: boolean,
  ) => {
    startTransition(async () => {
      try {
        if (isSkipped) {
          await unskipFixedOccurrence(client.id, date)
          toast.success(
            `Horário de ${format(date, "dd/MM")} reativado para ${client.clientName}.`,
          )
        } else {
          await skipFixedOccurrence(client.id, date)
          toast.success(
            `${format(date, "dd/MM")} desmarcado — horário liberado para outros clientes.`,
          )
        }
        await loadClients()
        onChanged?.()
      } catch {
        toast.error("Erro ao atualizar ocorrência.")
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Horários recorrentes reservados. Eles somem da agenda dos clientes
          automaticamente.
        </p>
        <Button size="sm" className="w-full shrink-0 sm:w-auto" onClick={openCreate}>
          <Plus size={14} />
          Novo
        </Button>
      </div>

      {clients.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nenhum cliente fixo cadastrado.
        </p>
      )}

      {clients.map((client) => {
        const skipKeys = new Set(client.skips.map((s) => dayKey(s.date)))
        const occurrences = nextFixedOccurrences(client, new Date(), 4)
        const isExpanded = expandedId === client.id

        return (
          <div
            key={client.id}
            className={cn(
              "rounded-2xl border border-border/60 bg-secondary/30 p-4",
              !client.active && "opacity-60",
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold">
                  {client.clientName}{" "}
                  {!client.active && (
                    <span className="text-xs font-normal text-muted-foreground">
                      (pausado)
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {FREQUENCY_LABELS[client.frequency as FixedFrequency] ??
                    client.frequency}{" "}
                  — {DAY_OF_WEEK_LABELS[client.dayOfWeek]} às {client.time} (
                  {client.durationMinutes === 60
                    ? "1h"
                    : `${client.durationMinutes} min`}
                  ) — {barberName(client.barberId)}
                </p>
                {client.phone && (
                  <p className="text-xs text-muted-foreground">
                    📞 {client.phone}
                  </p>
                )}
                {client.notes && (
                  <p className="text-xs text-muted-foreground">
                    {client.notes}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  title="Ver próximas datas / desmarcar"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : client.id)
                  }
                >
                  <CalendarClock size={13} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  title="Editar"
                  onClick={() => openEdit(client)}
                >
                  <Pencil size={13} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  title={client.active ? "Pausar" : "Reativar"}
                  onClick={() => handleToggleActive(client)}
                  disabled={isPending}
                >
                  {client.active ? <Pause size={13} /> : <Play size={13} />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-400 hover:text-red-300"
                  title="Excluir"
                  onClick={() => setDeleteTarget(client)}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>

            {isExpanded && client.active && (
              <div className="mt-3 border-t border-border/60 pt-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Próximas datas
                </p>
                <div className="flex flex-wrap gap-2">
                  {occurrences.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma ocorrência futura.
                    </p>
                  )}
                  {occurrences.map((date) => {
                    const isSkipped = skipKeys.has(dayKey(date))
                    return (
                      <button
                        key={dayKey(date)}
                        disabled={isPending}
                        onClick={() =>
                          handleToggleOccurrence(client, date, isSkipped)
                        }
                        title={
                          isSkipped
                            ? "Desmarcado — toque para reativar"
                            : "Toque para desmarcar este dia"
                        }
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-sm capitalize transition-all",
                          isSkipped
                            ? "border-destructive/50 bg-destructive/15 text-red-400 line-through"
                            : "border-border bg-secondary/40 hover:border-primary/60",
                        )}
                      >
                        {format(date, "EEE dd/MM", { locale: ptBR })} —{" "}
                        {client.time}
                      </button>
                    )
                  })}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Desmarcar um dia libera o horário para outros clientes só
                  naquele dia.
                </p>
              </div>
            )}
          </div>
        )
      })}

      {/* FORM CRIAR/EDITAR */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-[90vw] overflow-y-auto rounded-2xl sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide">
              {form.id ? "Editar cliente fixo" : "Novo cliente fixo"}
            </DialogTitle>
            <DialogDescription>
              O horário fica reservado automaticamente conforme a recorrência.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Barbeiro
              </p>
              <Select
                value={form.barberId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, barberId: v, time: "" }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Barbeiro" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Nome do cliente
              </p>
              <input
                className={inputClass}
                value={form.clientName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, clientName: e.target.value }))
                }
                placeholder="Ex.: João da Silva"
                maxLength={100}
              />
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Telefone (opcional)
              </p>
              <input
                className={inputClass}
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="(41) 99999-9999"
                maxLength={30}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Recorrência
                </p>
                <Select
                  value={form.frequency}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, frequency: v as FixedFrequency }))
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEMANAL">Semanal</SelectItem>
                    <SelectItem value="QUINZENAL">Quinzenal</SelectItem>
                    <SelectItem value="MENSAL">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Dia da semana
                </p>
                <Select
                  value={String(form.dayOfWeek)}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, dayOfWeek: Number(v), time: "" }))
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DAY_OF_WEEK_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Duração
                </p>
                <Select
                  value={String(form.durationMinutes)}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, durationMinutes: Number(v) }))
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {form.barberId && getSlotStep(form.barberId) === 30 && (
                      <SelectItem value="30">30 min</SelectItem>
                    )}
                    <SelectItem value="60">1 hora</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Horário
                </p>
                <Select
                  value={form.time}
                  onValueChange={(v) => setForm((f) => ({ ...f, time: v }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="--:--" />
                  </SelectTrigger>
                  <SelectContent>
                    {formTimeOptions.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Início da recorrência
              </p>
              <input
                type="date"
                className={inputClass}
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Para quinzenal/mensal, define a semana/posição de referência.
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Observações (opcional)
              </p>
              <textarea
                className="w-full resize-none rounded-xl border border-input bg-secondary/50 p-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                rows={2}
                maxLength={300}
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Ex.: cliente anual do sábado 9h"
              />
            </div>

            <Button
              className="w-full font-semibold"
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : form.id ? (
                "Salvar alterações"
              ) : (
                "Criar cliente fixo"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CONFIRMAR EXCLUSÃO */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-[90vw] rounded-2xl sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide">
              Excluir cliente fixo
            </DialogTitle>
            <DialogDescription>
              Remover {deleteTarget?.clientName}? Todos os horários recorrentes
              dele serão liberados. Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Excluir"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FixedClientsPanel
