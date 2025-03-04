"use client"

import Image from "next/image"
import { Button } from "../_components/ui/button"
import { Card, CardContent } from "../_components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../_components/ui/drawer"

const Monthly = () => {
  return (
    <div className="h-screen items-center bg-black text-center">
      <div className="space-y-3 pt-[450px]">
        <h1 className="text-4xl">Seja um mensalista</h1>

        <Drawer>
          <DrawerTrigger>
            <Button>Assinar</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="mx-auto justify-center">
              <DrawerTitle>Escolha o seu método de pagamento.</DrawerTitle>
              <DrawerDescription>
                Aceitamos os métodos cartão e Pix
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-row items-center justify-center gap-3">
              <Card>
                <CardContent>
                  <Image
                    src="credit-card.svg"
                    alt="Cartão"
                    height={16}
                    width={16}
                    className="pt-7"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Image
                    src="pix.svg"
                    alt="Pix"
                    height={16}
                    width={16}
                    className="pt-6"
                  />
                </CardContent>
              </Card>
            </div>
            <DrawerFooter>
              <DrawerClose>
                <Button
                  className="w-[160px] rounded-full"
                  variant="destructive"
                >
                  Cancelar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}

export default Monthly
