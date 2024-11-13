import { getServerSession } from "next-auth"
import Header from "../_components/header"
import { notFound } from "next/navigation"
import { authOptions } from "../_lib/auth"
import { getAdminConfirmedBookings } from "../_data/get-admin-confirmed-bookings"
import { getAdminConcludedBookings } from "../_data/get-admin-concluded-bookings"
import BookingItem from "../_components/booking-item"

const Dashboard = async () => {
  const session = await getServerSession(authOptions)

  console.log("Sessão:", session)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    // Se não for administrador, redireciona ou mostra página de não encontrado
    return notFound()
  }

  // Obter agendamentos confirmados e finalizados
  const AdminConfirmedBookings = await getAdminConfirmedBookings()
  const AdminConcludedBookings = await getAdminConcludedBookings()
  // const session = await getServerSession(authOptions)
  // if (!session?.user) {
  //   // TODO: mostrar pop-up de login
  //   return notFound()
  // }
  // const AdminConfirmedBookings = await getAdminConfirmedBookings()
  // const AdminConcludedBookings = await getAdminConcludedBookings()

  return (
    <>
      <Header />
      <div className="space-y-3 p-5">
        <h1 className="text-xl font-bold">Dashboard de Agendamentos (Admin)</h1>
        {AdminConfirmedBookings.length === 0 &&
          AdminConcludedBookings.length === 0 && (
            <p className="text-gray-400">Nenhum agendamento encontrado.</p>
          )}

        {AdminConfirmedBookings.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
              Confirmados
            </h2>
            {AdminConfirmedBookings.map((booking) => (
              <BookingItem
                key={booking.id}
                booking={JSON.parse(JSON.stringify(booking))}
              />
            ))}
          </>
        )}

        {AdminConcludedBookings.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
              Finalizados
            </h2>
            {AdminConcludedBookings.map((booking) => (
              <BookingItem
                key={booking.id}
                booking={JSON.parse(JSON.stringify(booking))}
              />
            ))}
          </>
        )}
      </div>

      {/* <Header />
      <h1>Dashboard</h1>

      <div className="space-y-3 p-5">
        <h1 className="text-xl font-bold">Agendamentos</h1>
        {AdminConfirmedBookings.length === 0 &&
          AdminConcludedBookings.length === 0 && (
            <p className="text-gray-400">Você não tem agendamentos.</p>
          )}
        {AdminConfirmedBookings.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
              Confirmados
            </h2>
            {AdminConfirmedBookings.map((booking) => (
              <BookingItem
                key={booking.id}
                booking={JSON.parse(JSON.stringify(booking))}
              />
            ))}
          </>
        )}
      </div> */}
    </>
  )
}

export default Dashboard
