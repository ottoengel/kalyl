"use client"
import { Barber, BarberServices } from "@prisma/client"
import Header from "../_components/header"
import Booking from "./section/booking-section"
import Hero from "./section/hero"
import { ParallaxProvider } from "react-scroll-parallax"

interface planDashboardProps {
  service: Pick<BarberServices, "name" | "price" | "id">
  barber: Pick<Barber, "name" | "id">
}

const planDashboard = ({ service, barber }: planDashboardProps) => {
  return (
    <>
      <Header />
      <ParallaxProvider>
        <Hero />
      </ParallaxProvider>
      <Booking service={service} barber={barber} />
    </>
  )
}

export default planDashboard
