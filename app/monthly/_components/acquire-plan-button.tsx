import { loadStripe } from "@stripe/stripe-js"
import { createStripeCheckout } from "../_actions/create-stripe-checkout"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/app/_components/ui/drawer"
import { Card, CardContent } from "@/app/_components/ui/card"
import Image from "next/image"
import { Button } from "@/app/_components/ui/button"

interface AquirePlanButtonProps {
  open: boolean
  // eslint-disable-next-line no-unused-vars
  onOpenChange: (open: boolean) => void // Agora aceita uma função
  link: string
}

const AquirePlanButton = ({ link, open, onOpenChange }: AquirePlanButtonProps) => {
  const handleAqcuirePlan = async () => {
    console.log("Redirecionado para" + link)
    const { sessionId } = await createStripeCheckout()
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      throw new Error("Sem publishbbble")
    }
    if (link) {
      setTimeout(() => {
        window.location.href = link
      }, 10000) // Delay de 10 segundos
    }
    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    )
    if (!stripe) {
      throw new Error("Stripe not found")
    }
    await stripe.redirectToCheckout({ sessionId })
  }
  return (
    <div>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="mx-auto justify-center">
            <DrawerTitle>Escolha o seu método de pagamento.</DrawerTitle>
            <DrawerDescription className="mx-auto justify-center">
              Aceitamos os métodos cartão e Pix
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-row items-center justify-center gap-3">
            <Card className="cursor-pointer hover:bg-gray-800">
              <CardContent>
                <Image
                  src="credit-card.svg"
                  alt="Cartão"
                  height={20}
                  width={20}
                  className="pt-7"
                  onClick={handleAqcuirePlan}
                />
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-gray-800">
              <CardContent>
                <Image
                  src="pix.svg"
                  alt="Pix"
                  height={20}
                  width={20}
                  className="pt-6"
                />
              </CardContent>
            </Card>
          </div>
          <DrawerFooter>
            <DrawerClose>
              <Button className="w-[160px] rounded-full" variant="destructive">
                Cancelar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default AquirePlanButton
