/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "../_components/header";
import { notFound } from "next/navigation";
import { getAdminConfirmedBookings } from "../_data/get-admin-confirmed-bookings";
import { getAdminConcludedBookings } from "../_data/get-admin-concluded-bookings";
import BookingItem from "../_components/booking-item";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/app/_lib/utils";
import { buttonVariants } from "@/app/_components/ui/button";
import { toast } from "sonner";
import { Block } from "@prisma/client";
import { getBlock } from "../_actions/get-block";
import { createBlock } from "../_actions/create-block";
import { useRouter } from "next/navigation";
import { isPast, isToday, set } from "date-fns";
import { deleteBlock } from "../_actions/delete-block";


const Dashboard = () => {
  const [adminConfirmedBlock, setAdminConfirmedBookings] = useState<Block[]>([]);
  const [adminConcludedBlock, setAdminConcludedBookings] = useState<Block[]>([]);

  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const [selectedDay, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedHour, setSelectedHour] = useState<string | undefined>(undefined);

  const [dayBlock, setDayBlock] = useState<Block[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const session = await fetch("/api/auth/session").then((res) => res.json());

      if (!session?.user || session.user.role !== "ADMIN") {
        notFound();
        return;
      }

      setIsAdmin(true);
      const confirmedBlock = await getAdminConfirmedBookings();
      const concludedBlock = await getAdminConcludedBookings();

      setAdminConfirmedBookings(confirmedBlock);
      setAdminConcludedBookings(concludedBlock);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      if (!selectedDay) return
      const blockings = await getBlock({
        date: selectedDay,
      })
      setDayBlock(blockings)
    }
    fetch()
  }, [selectedDay])

  interface GetTimeListProps {
    block: Block[]
    selectedDay: Date
  }

  const getTimeList = ({ block, selectedDay }: GetTimeListProps) => {
    return hours.filter((time) => {
      const hour = Number(time.split(":")[0])
      const minutes = Number(time.split(":")[1])

      const timeIsOnThePast = isPast(set(new Date(), { hours: hour, minutes }))
      if (timeIsOnThePast && isToday(selectedDay)) {
        return false
      }

      const hasBookingOnCurrentTime = block.some(
        (block) =>
          block.date.getHours() === hour &&
          block.date.getMinutes() === minutes,
      )
      // if (hasBookingOnCurrentTime) {
      //   return false
      // }
      return true
    })
  }

  const hours = Array.from({ length: 20 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const minutes = i % 2 === 0 ? "00" : "30";
    return `${hour}:${minutes}`;
  });

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedHour) return
    return set(selectedDay, {
      hours: Number(selectedHour?.split(":")[0]),
      minutes: Number(selectedHour?.split(":")[1]),
    })
  }, [selectedDay, selectedHour])

  interface HasBlock {
    id: string;
    userId: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
  }
  const handleToggleAvailability = async (hasBlock: HasBlock | undefined) => {
    try {
      if (hasBlock) {

        await handleCancelBlock(hasBlock.id);
      } else if (selectedDate) {

        await createBlock({
          date: selectedDate,
        });
        toast.success("Horario bloqueado com Sucesso!", {
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar ou cancelar reserva!");
    }
  };

  const handleCancelBlock = async (block: string) => {
    try {
      await deleteBlock(block)
      toast.success("Horario desbloqueado com sucesso!")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao cancelar reserva. Tente novamente.")
    }
  }

  const timeList = useMemo(() => {
    if (!selectedDay) return []
    return getTimeList({
      block: dayBlock,
      selectedDay,
    })
  }, [dayBlock, selectedDay])

  if (!isAdmin) {
    return null;
  }

  const blockteste = () => dayBlock.find(
    (block) => {
      if (!selectedDate) return
      return new Date(block.date).toISOString() ===
        new Date(selectedDate).toISOString()
    }
  )

  return (
    <>
      <Header />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
        <div className="sm:order-1">
          <div className="p-5 text-white rounded-lg shadow-lg">
            {/* <button
              onClick={() => { console.log("TESTE", selectedDay, dayBlock )}}
            >Teste</button> */}
            <h2 className="text-2xl font-bold mb-4">Calendário</h2>
            <DayPicker
              showOutsideDays
              mode="single"
              selected={selectedDay}
              onSelect={setSelectedDate}
              className="p-3"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  buttonVariants({ variant: "outline" }),
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                  "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative",
                day: cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                ),
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
              }}
              components={{
                IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                IconRight: () => <ChevronRight className="h-4 w-4" />,
              }}
            />

          </div>

          {selectedDay && (
            <div>
              <h3 className="text-lg font-semibold mt-4 mb-2 text-center">
                Horários para {selectedDay.toLocaleDateString()}
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {timeList.map((hour) => (
                  <button
                    key={hour}
                    className={`p-3 rounded-lg text-center transition-colors duration-200 ${selectedHour === hour
                      ? "bg-blue-500 text-white"
                      : "bg-gray-800 hover:bg-gray-700"
                      }`}
                    onClick={() => setSelectedHour(hour)}
                  >
                    {hour}
                  </button>
                ))}
              </div>

              {selectedHour && (
                <div className="mt-6 text-center">
                  <p className="mb-4">Horário selecionado: {selectedHour}</p>

                  <button
                    //onClick={handleToggleAvailability}
                    onClick={() => handleToggleAvailability(dayBlock.find(
                      (block) => {
                        if (!selectedDate) return
                        return new Date(block.date).toISOString() ===
                          new Date(selectedDate).toISOString()
                      }
                    ))}
                    className={`px-4 py-2 rounded-lg ${dayBlock.some(
                      (block) => {
                        if (!selectedDate) return
                        return new Date(block.date).toISOString() ===
                          new Date(selectedDate).toISOString()
                      }
                    )
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                  >
                    {dayBlock.some(
                      (block) => {
                        if (!selectedDate) return
                        return new Date(block.date).toISOString() ===
                          new Date(selectedDate).toISOString()
                      }
                    )
                      ? "Desbloquear Horário"
                      : "Bloquear Horário"}
                  </button>

                </div>
              )}
            </div>
          )}
        </div>
        <div className="space-y-3 sm:order-2">
          <h1 className="text-xl font-bold">Agendamentos</h1>

          {adminConfirmedBlock.length === 0 &&
            adminConcludedBlock.length === 0 && (
              <p className="text-gray-400">Nenhum agendamento encontrado.</p>
            )}

          {adminConfirmedBlock.length > 0 && (
            <>
              <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
                Confirmados
              </h2>
              {adminConfirmedBlock.map((booking) => (
                <BookingItem
                  key={booking.id}
                  booking={JSON.parse(JSON.stringify(booking))}
                  isAdmin={true} // Define como admin
                />
              ))}
            </>
          )}
          {adminConcludedBlock.length > 0 && (
            <>
              <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
                Finalizados
              </h2>
              {adminConcludedBlock.map((booking) => (
                <BookingItem
                  key={booking.id}
                  booking={JSON.parse(JSON.stringify(booking))}
                  isAdmin={true} // Define como admin
                />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

interface CalendarProps {
  adminConfirmedBlock: Array<{
    id: string;
    date: string;
  }>;
}

//const Calendar: React.FC<CalendarProps> = ({ adminConfirmedBlock }) => {
// const [selectedDate, setSelectedDate] = useState<Date | null>(null);
// const [selectedHour, setSelectedHour] = useState<string | null>(null);

// const hours = Array.from({ length: 20 }, (_, i) => {
//   const hour = 9 + Math.floor(i / 2);
//   const minutes = i % 2 === 0 ? "00" : "30";
//   return `${hour}:${minutes}`;
// });

// const handleToggleAvailability = async () => {
//   try {
//     if (!selectedDate) {
//       return
//     }
//     await createBlock({
//       date: selectedDate,
//     })
//     toast.success("Reserva criada com sucesso!", {
//       action: {
//         label: "Ver Agendamentos",
//         onClick: () => router.push("/block"),
//       },
//     })
//   } catch (error) {
//     console.error(error)
//     toast.error("Erro ao criar reserva!")
//   }
// };

{/* {selectedDate && (
        <div>
          <h3 className="text-lg font-semibold mt-4 mb-2 text-center">
            Horários para {selectedDate.toLocaleDateString()}
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {hours.map((hour) => (
              <button
                key={hour}
                className={`p-3 rounded-lg text-center transition-colors duration-200 ${selectedHour === hour
                    ? "bg-blue-500 text-white"
                    : "bg-gray-800 hover:bg-gray-700"
                  }`}
                onClick={() => setSelectedHour(hour)}
              >
                {hour}
              </button>
            ))}
          </div>

          {selectedHour && (
            <div className="mt-6 text-center">
              <p className="mb-4">Horário selecionado: {selectedHour}</p>
              <button
                onClick={handleToggleAvailability}
                className={`px-4 py-2 rounded-lg ${adminConfirmedBookings.some(
                  (booking) =>
                    new Date(booking.date).toISOString() ===
                    new Date(selectedDate).toISOString()
                )
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
              >
                {adminConfirmedBookings.some(
                  (booking) =>
                    new Date(booking.date).toISOString() ===
                    new Date(selectedDate).toISOString()
                )
                  ? "Desbloquear Horário"
                  : "Bloquear Horário"}
              </button>

            </div>
          )}
        </div>
      )} */}
//};

export default Dashboard;
