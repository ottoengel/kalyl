import { addDays, differenceInCalendarWeeks, startOfDay } from "date-fns"

export type FixedFrequency = "SEMANAL" | "QUINZENAL" | "MENSAL"

export const FREQUENCY_LABELS: Record<FixedFrequency, string> = {
  SEMANAL: "Semanal",
  QUINZENAL: "Quinzenal",
  MENSAL: "Mensal",
}

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
}

export interface FixedRule {
  frequency: string
  dayOfWeek: number
  startDate: Date | string
}

/** Índice da ocorrência do dia da semana dentro do mês (1º sábado, 2º sábado...) */
const weekdayIndexInMonth = (date: Date) => Math.ceil(date.getDate() / 7)

/**
 * Verifica se a regra do cliente fixo tem ocorrência no dia informado.
 * - SEMANAL: todo `dayOfWeek`;
 * - QUINZENAL: `dayOfWeek` em semanas alternadas a partir de `startDate`;
 * - MENSAL: mesma posição do dia da semana no mês da `startDate` (ex.: 1º sábado).
 */
export const fixedRuleOccursOn = (rule: FixedRule, day: Date): boolean => {
  if (day.getDay() !== rule.dayOfWeek) return false
  const anchor = startOfDay(new Date(rule.startDate))
  const target = startOfDay(day)
  if (target < anchor) return false

  const frequency = rule.frequency as FixedFrequency
  if (frequency === "SEMANAL") return true
  if (frequency === "QUINZENAL") {
    return (
      differenceInCalendarWeeks(target, anchor, { weekStartsOn: 1 }) % 2 === 0
    )
  }
  // MENSAL
  return weekdayIndexInMonth(target) === weekdayIndexInMonth(anchor)
}

/** Próximas `count` ocorrências da regra a partir de `from` (inclusive). */
export const nextFixedOccurrences = (
  rule: FixedRule,
  from: Date,
  count: number,
): Date[] => {
  const occurrences: Date[] = []
  let cursor = startOfDay(from)
  const anchor = startOfDay(new Date(rule.startDate))
  if (cursor < anchor) cursor = anchor

  // limite de segurança: 1 ano de varredura
  for (let i = 0; i < 366 && occurrences.length < count; i++) {
    if (fixedRuleOccursOn(rule, cursor)) occurrences.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return occurrences
}
