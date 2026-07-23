import { getServerSession } from "next-auth"
import Header from "../_components/header"
import { authOptions } from "../_lib/auth"
import { notFound } from "next/navigation"
import BookingItem from "../_components/booking-item"
import { getConfirmedBookings } from "../_data/get-confirmed-bookings"
import { getConcludedBookings } from "../_data/get-concluded-bookings"
import { CalendarX2 } from "lucide-react"

const Bookings = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return notFound()
  }

  const [confirmedBookings, concludedBookings] = await Promise.all([
    getConfirmedBookings(),
    getConcludedBookings(),
  ])

  return (
    <>
      <Header />
      <div className="mx-auto max-w-4xl space-y-3 px-5 py-8">
        <h1 className="font-display text-3xl tracking-wide">
          Meus <span className="text-primary">agendamentos</span>
        </h1>

        {confirmedBookings.length === 0 && concludedBookings.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
            <CalendarX2 className="text-muted-foreground" size={36} />
            <p className="text-muted-foreground">
              Você ainda não tem agendamentos.
            </p>
          </div>
        )}

        {confirmedBookings.length > 0 && (
          <section>
            <h2 className="mb-3 mt-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Confirmados
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {confirmedBookings.map((booking) => (
                <BookingItem
                  key={booking.id}
                  booking={JSON.parse(JSON.stringify(booking))}
                />
              ))}
            </div>
          </section>
        )}

        {concludedBookings.length > 0 && (
          <section>
            <h2 className="mb-3 mt-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Finalizados
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {concludedBookings.map((booking) => (
                <BookingItem
                  key={booking.id}
                  booking={JSON.parse(JSON.stringify(booking))}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

export default Bookings
