"use client"

import Header from "../_components/header"
import { useState } from "react"
import AquirePlanButton from "./_components/acquire-plan-button"

const Monthly = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<
    "mensalCabelo" | "mensalBarba" | "mensalCabeloeBarba" | null
  >(null)
  const [checkoutLink, setCheckoutLink] = useState<string | null>(null)

  return (
    <div className="min-h-full">
      <Header />
      <div className="items-center text-center">
        <div className="relative isolate min-h-[750px] px-6 pt-[19px] lg:px-8">
          <div
            className="absolute inset-x-0 -top-3 -z-10 transform-gpu blur-3xl"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="absolute mx-auto aspect-[1255/678] w-full max-w-[1355px] bg-gradient-to-tr from-[#ff6868] to-[#9089fc] opacity-25"
              style={{
                clipPath:
                  "polygon(94.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 75.5% 0.1%, 85.7% 20%, 92.5% 32.5%, 2.2% 62.4%, 12.4% 78.1%, 47.5% 58.3%, 25.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 20%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            ></div>
          </div>
          <div className="mx-auto max-w-4xl text-center">
            <p className="mt-2 text-5xl font-semibold tracking-tight text-indigo-600 sm:text-6xl">
              Seja um Mensalista
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-gray-200 sm:text-xl">
            Escolha um plano acessível e repleto de benefícios para cuidar do
            seu visual, garantir atendimento exclusivo e aproveitar vantagens
            especiais todos os meses na nossa barbearia.
          </p>
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-3 gap-y-6 sm:mt-20 lg:max-w-4xl lg:grid-cols-3">
            <PlanCard
              id="mensalBarba"
              title="Mensalista Barba"
              price="R$180,00"
              features={["4 Cortes de barba por mês"]}
              buttonText="Assine agora"
              link="https://buy.stripe.com/test_6oEaFv0iXelh3TyeUV"
              onClick={() => {
                setSelectedPlan("mensalBarba")
                setCheckoutLink(
                  "https://buy.stripe.com/test_6oEaFv0iXelh3TyeUV",
                )
                setIsDrawerOpen(true)
              }}
            />
            <PlanCard
              id="mensalCabelo"
              title="Mensalista Cabelo"
              price="R$240,00"
              features={["4 Cortes de cabelo por mês"]}
              buttonText="Assine agora"
              link="https://buy.stripe.com/test_fZecOw0iXfS1cAE9AB"
              dark
              onClick={() => {
                setSelectedPlan("mensalCabelo")
                setCheckoutLink(
                  "https://buy.stripe.com/test_fZecOw0iXfS1cAE9AB",
                )
                setIsDrawerOpen(true)
              }}
            />
            <PlanCard
              id="mensalCabeloeBarba"
              title="Mensalista Cabelo e Barba"
              price="R$340,00"
              features={["4 Cortes de cabelo e barba por mês"]}
              buttonText="Assine agora"
              link="https://buy.stripe.com/test_4gwbJw5cR9N2b4weUV"
              onClick={() => {
                setSelectedPlan("mensalCabeloeBarba")
                setCheckoutLink(
                  "https://buy.stripe.com/test_4gwbJw5cR9N2b4weUV",
                )
                setIsDrawerOpen(true)
              }}
            />
          </div>
        </div>
        <AquirePlanButton
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          selectedPlan={selectedPlan}
          checkoutLink={checkoutLink} // Passamos o link para ser usado no drawer
        />
      </div>
    </div>
  )
}

interface PlanCardProps {
  id: string
  title: string
  price: string
  features: string[]
  buttonText: string
  dark?: boolean
  link: string
  onClick?: () => void
}

const PlanCard: React.FC<PlanCardProps> = ({
  id,
  title,
  price,
  features,
  buttonText,
  dark = false,
  onClick,
}) => {
  return (
    <div
      className={`rounded-3xl p-8 ring-1 ${dark ? "relative bg-gray-900 text-white ring-gray-300/10 sm:bottom-12" : "relative bg-white text-gray-900 ring-gray-900/10 sm:bottom-5"}`}
    >
      <h3
        id={`tier-${id}`}
        className={`text-base font-semibold ${dark ? "text-indigo-400" : "text-indigo-600"}`}
      >
        {title}
      </h3>
      <p className="mt-4 flex items-baseline gap-x-2">
        <span className="text-5xl font-semibold tracking-tight">{price}</span>
        <span
          className={`text-base ${dark ? "text-gray-400" : "text-gray-500"}`}
        >
          /mês
        </span>
      </p>
      <ul className="mt-8 space-y-3">
        {features.map((feature, index) => (
          <li
            key={index}
            className={`flex gap-x-3 text-sm ${dark ? "text-gray-300" : "text-gray-600"}`}
          >
            {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={onClick}
        className={`mt-8 block w-full rounded-md px-3.5 py-2.5 text-center text-sm font-semibold ring-1 focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10 ${dark ? "bg-indigo-500 text-white ring-indigo-500 hover:bg-indigo-400 focus-visible:outline-indigo-500" : "text-indigo-600 ring-indigo-200 hover:ring-indigo-300 focus-visible:outline-indigo-600"}`}
      >
        {buttonText}
      </button>
    </div>
  )
}

export default Monthly
