"use client";

import Image from "next/image";
import { Button } from "../_components/ui/button";
import { Card, CardContent } from "../_components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../_components/ui/drawer";
import Header from "../_components/header";
import { useState } from "react";

const Monthly = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div>
      <Header />
      <div className="items-center text-center">
        <div className="relative isolate px-6 lg:px-8 overflow-hidden pt-[19px]">
          <div
            className="absolute inset-x-0 -top-3 -z-10 transform-gpu px-36 blur-3xl"
            aria-hidden="true"
          >
            <div
              className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            ></div>
          </div>
          <div className="mx-auto max-w-4xl text-center">
            <p className="mt-2 text-5xl font-semibold tracking-tight text-indigo-600 sm:text-6xl">
              Seja um Mensalista
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-gray-200 sm:text-xl">
            Escolha um plano acessível e repleto de benefícios para cuidar do seu visual,
            garantir atendimento exclusivo e aproveitar vantagens especiais todos os meses na nossa barbearia.
          </p>
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-4xl lg:grid-cols-3 gap-3">
            <PlanCard
              id="mensalBarba"
              title="Mensalista Barba"
              price="R$180,00"
              features={["4 Cortes de barba por mês"]}
              buttonText="Assine agora"
              onClick={() => setIsDrawerOpen(true)}
            />
            <PlanCard
              id="mensalCabelo"
              title="Mensalista Cabelo"
              price="R$240,00"
              features={["4 Cortes de cabelo por mês"]}
              buttonText="Assine agora"
              dark
              onClick={() => setIsDrawerOpen(true)}
            />
            <PlanCard
              id="mensalCabeloeBarba"
              title="Mensalista Cabelo e Barba"
              price="R$340,00"
              features={["4 Cortes de cabelo e barba por mês"]}
              buttonText="Assine agora"
              onClick={() => setIsDrawerOpen(true)}
            />
          </div>
        </div>
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent>
            <DrawerHeader className="mx-auto justify-center">
              <DrawerTitle>Escolha o seu método de pagamento.</DrawerTitle>
              <DrawerDescription className="mx-auto justify-center">
                Aceitamos os métodos cartão e Pix
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-row items-center justify-center gap-3">
              <Card className="hover:bg-gray-800 cursor-pointer">
                <CardContent>
                  <Image
                    src="credit-card.svg"
                    alt="Cartão"
                    height={20}
                    width={20}
                    className="pt-7 "
                  />
                </CardContent>
              </Card>
              <Card className="hover:bg-gray-800 cursor-pointer">
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
    </div>
  );
};

interface PlanCardProps {
  id: string;
  title: string;
  price: string;
  features: string[];
  buttonText: string;
  dark?: boolean;
  onClick?: () => void; // Adiciona a função onClick como opcional
}


const PlanCard: React.FC<PlanCardProps> = ({ id, title, price, features, buttonText, dark = false, onClick }) => {
  return (
    <div className={`rounded-3xl p-8 ring-1 ${dark ? 'bg-gray-900 ring-gray-300/10 text-white relative sm:bottom-12' : 'bg-white ring-gray-900/10 text-gray-900 relative sm:bottom-5'}`}>
      <h3 id={`tier-${id}`} className={`text-base font-semibold ${dark ? 'text-indigo-400' : 'text-indigo-600'}`}>{title}</h3>
      <p className="mt-4 flex items-baseline gap-x-2">
        <span className="text-5xl font-semibold tracking-tight">{price}</span>
        <span className={`text-base ${dark ? 'text-gray-400' : 'text-gray-500'}`}>/mês</span>
      </p>
      <ul className="mt-8 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className={`flex gap-x-3 text-sm ${dark ? "text-gray-300" : "text-gray-600"}`}>
            {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={onClick}
        className={`mt-8 block w-full rounded-md px-3.5 py-2.5 text-center text-sm font-semibold ring-1 focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10 ${dark ? 'bg-indigo-500 text-white hover:bg-indigo-400 ring-indigo-500 focus-visible:outline-indigo-500' : 'text-indigo-600 ring-indigo-200 hover:ring-indigo-300 focus-visible:outline-indigo-600'}`}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default Monthly;