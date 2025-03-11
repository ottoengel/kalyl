"use client"

import { Calendar } from "@/app/_components/ui/calendar"
import { ptBR } from "date-fns/locale"
import { useState } from "react"

const Booking = () => {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date)
  }
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return (
    <section className="bg-black py-20">
      <div className="container mx-auto">
        <h2 className="text-center text-5xl font-medium tracking-tighter">
          Faça seu agendamento
        </h2>
        <p className="mt-5 text-center text-lg tracking-tight text-white/70">
          Faça até 4 agendamentos no mês
        </p>
        <div className="mt-10 flex flex-row justify-center gap-3">
          <Calendar
            mode="single"
            locale={ptBR}
            selected={selectedDay}
            onSelect={handleDateSelect}
            fromDate={firstDayOfMonth} // Define o primeiro dia do mês
            toDate={lastDayOfMonth} // Define o último dia do mês
            disabled={(date) => date.getDay() === 0}
          />
        </div>
      </div>
    </section>
  )
}

export default Booking
