"use client";
import { useSession } from "next-auth/react";
import Header from "../_components/header";
import { Avatar, AvatarImage } from "../ui/avatar";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "../_components/ui/drawer";
import { Button } from "../_components/ui/button";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../_components/ui/select"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "../ui/dialog"

const Month = () => {
    const { data } = useSession()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDialogOpen, setDialogOpen] = useState(false);

    return (
        <div className="relative min-h-[672px] overflow-hidden ">
            <Header />
            <div>
                <div className="relative isolate px-6 sm:pt-20 sm:px-12 md:px-20 lg:px-36">
                    <div className="absolute inset-x-0 -top-3 -z-10 transform-gpu blur-3xl" style={{ pointerEvents: 'none' }}>
                        <div
                            className="mx-auto aspect-[1155/678] max-w-[1155px] w-full bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
                            style={{
                                clipPath:
                                    "polygon(74.1% 64.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 52%, 80.7% 25%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 62.5% 58.3%, 45.2% 34.5%, 97.5% 6.7%, 1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 79.1%)",
                            }}
                        ></div>
                    </div>
                </div>
                <Avatar>
                    <AvatarImage src={data?.user?.image ?? ""} />
                </Avatar>
                <h2 className="text-2xl/7 font-bold text-white text-center sm:text-left sm:pl-20 sm:truncate sm:text-3xl sm:tracking-tight">
                    Nome usuario
                </h2>

                <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                    <div className="mt-2 flex items-center justify-center text-sm text-gray-500 sm:pl-20">
                        <svg className="mr-1.5 size-5 shrink-0 text-gray-200" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                            <path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" />
                        </svg>
                        Usuario desde, 9 Jan 2025
                    </div>
                </div>
            </div>
            <div className="py-10 sm:py-10">
                <div className="mx-auto max-w-8xl px-6 lg:px-8">
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4">
                        <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                            <dt className="text-base/7 text-gray-500">Total Economizado Mensalmente</dt>
                            <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">R$ 240,00</dd>
                        </div>
                        <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                            <dt className="text-base/7 text-gray-500">Tempo Total Mensalista</dt>
                            <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">365 Dias</dd>
                        </div>
                        <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                            <dt className="text-base/7 text-gray-500">Plano Atual</dt>
                            <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">Mensal Cabelo</dd>
                        </div>
                        <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                            <dt className="text-base/7 text-gray-500">Proxima Cobrança</dt>
                            <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">29/10</dd>
                        </div>
                    </dl>
                </div>
            </div>
            <div className="relative flex justify-center pt-5 bottom-6  sm:pt-10 lg:grid-cols-2 gap-2 ">
                <button onClick={() => setDialogOpen(true)} className="relative flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-500">
                    Cancelar Plano
                </button>
                <button onClick={() => setIsDrawerOpen(true)}
                    className="relative flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-500">
                    Alterar Plano
                </button>
                <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="w-[90%] rounded-xl">
                  <DialogHeader>
                    <DialogTitle>Você quer cancelar seu plano?</DialogTitle>
                    <DialogDescription>
                      Tem certeza que deseja fazer o cancelamento? Essa ação é
                      irreversível.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-row gap-3">
                    <DialogClose asChild>
                      <Button variant="secondary" className="w-full">
                        Voltar
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        variant="destructive"
                        className="w-full"
                      >
                        Confirmar
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <DrawerContent>
                        <DrawerHeader className="mx-auto justify-center">
                            <DrawerTitle>Escolha para qual plano gostaria de alterar.</DrawerTitle>
                        </DrawerHeader>
                        <div className="flex flex-row items-center justify-center gap-3">
                            <Select>
                                <SelectTrigger className="w-[210px]">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="barba">Mensalista Barba</SelectItem>
                                    <SelectItem value="cabelo">Mensalista Cabelo</SelectItem>
                                    <SelectItem value="cabeloebarba">Mensalista Cabelo e Barba</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DrawerFooter>
                            <DrawerClose className="flex justify-center gap-4">
                                <Button className="w-[160px] rounded-full" variant="destructive">
                                    Cancelar
                                </Button>
                                <Button className="w-[160px] rounded-full bg-blue-500 hover:bg-blue-600" variant="destructive">
                                    Confirmar
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    );
};

export default Month;