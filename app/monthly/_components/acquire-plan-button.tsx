/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

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
import { useSession } from "next-auth/react"

interface AquirePlanButtonProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPlan: "mensalCabelo" | "mensalBarba" | "mensalCabeloeBarba" | null
  checkoutLink: string | null
}

const AquirePlanButton = ({
  open,
  onOpenChange,
  selectedPlan,
}: AquirePlanButtonProps) => {
  const { data: session } = useSession()
  const plans = {
    mensalCabelo: "https://buy.stripe.com/test_4gw3d32r5dhd9dS6oo",
    mensalBarba: "https://buy.stripe.com/test_6oEaFv0iXelh3TyeUV",
    mensalCabeloeBarba: "https://buy.stripe.com/test_3csbJz9TxelhgGkcMO",
  } as const

  // Apenas abre o drawer
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAqcuirePlan = () => {
    if (selectedPlan) {
      onOpenChange(true) // Agora só abre o drawer
    }
  }

  // Faz o redirecionamento ao Stripe
  const handleCheckout = () => {
    if (selectedPlan && plans[selectedPlan]) {
      let checkoutUrl: string = plans[selectedPlan]

      // Adiciona o e-mail do usuário ao link de checkout, se disponível
      if (session?.user?.email) {
        checkoutUrl = `${checkoutUrl}?prefilled_email=${session.user.email}`
      }

      window.location.href = checkoutUrl // Redireciona para o checkout correto
    }
  }

  return (
    <>
      {/* Drawer de pagamento */}
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="mx-auto justify-center">
            <DrawerTitle>Escolha o seu método de pagamento.</DrawerTitle>
            <DrawerDescription className="mx-auto justify-center">
              Aceitamos os métodos cartão e Pix
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-row items-center justify-center gap-3">
            {/* Cartão de crédito */}
            <Card
              className="cursor-pointer hover:bg-gray-800"
              onClick={handleCheckout}
            >
              <CardContent>
                <Image
                  src="credit-card.svg"
                  alt="Cartão"
                  height={20}
                  width={20}
                  className="pt-7"
                />
              </CardContent>
            </Card>

            {/* Pix */}
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
    </>
  )
}

export default AquirePlanButton
