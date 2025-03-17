'use client'
import Header from "../_components/header"
import Booking from "./section/booking-section"
import Hero from "./section/hero"
import {ParallaxProvider} from "react-scroll-parallax"

const planDashboard = () => {
  return (
    <>
      <Header />
      <ParallaxProvider>
      <Hero />
      </ParallaxProvider>
      <Booking />
    </>
  )
}

export default planDashboard
