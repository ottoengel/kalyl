import { CalendarIcon, HomeIcon, LogInIcon, LogOutIcon } from "lucide-react"
import { Button } from "./ui/button"
import { SheetClose, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import Image from "next/image"
import { Input } from "./ui/input"

const SidebarSheet = () => {
  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="text-left">Menu</SheetTitle>
      </SheetHeader>

      <div className="flex items-center justify-between gap-3 border-b border-solid py-5">
        <h2 className="font-bold">Olá, faça seu login!</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" className="bg-[#F6484B]" variant="outline">
              <LogInIcon />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] rounded-xl">
            <DialogHeader>
              <DialogTitle>Faça login na plataforma</DialogTitle>
              <DialogDescription>
                Entre com um email ou utilizando outra conta
              </DialogDescription>
            </DialogHeader>

            <Input placeholder="email" />
            <Input placeholder="senha" />

            <Button variant="outline" className="gap-1 bg-blue-400 font-bold">
              Login
            </Button>

            <div className="flex items-center">
              <div className="h-[1px] flex-grow bg-gray-400"></div>
              <span className="p-4 text-gray-400">ou</span>
              <div className="h-[1px] flex-grow bg-gray-400"></div>
            </div>

            <Button variant="outline" className="gap-1 font-bold">
              <Image
                alt="Fazer login com Google"
                src="/google.svg"
                width={18}
                height={18}
              />
              Google
            </Button>
            <Button variant="outline" className="gap-1 font-bold">
              <Image
                alt="Fazer login com Facebook"
                src="/facebook.png"
                width={18}
                height={18}
              />
              FaceBook
            </Button>
          </DialogContent>
        </Dialog>
        {/* <Avatar>
          <AvatarImage src="https://cdn.worldvectorlogo.com/logos/spitfire-1.svg" />
        </Avatar>

        <div>
          <p className="font-bold">Jõaozinho da Silva</p>
          <p className="text-xs">joaozinho@gmail.com</p>
        </div> */}
      </div>

      <div className="flex flex-col gap-2 border-b border-solid py-5">
        <SheetClose asChild>
          <Button className="justify-start gap-2" variant="ghost" asChild>
            <Link href="/">
              <HomeIcon size={18} />
              Início
            </Link>
          </Button>
        </SheetClose>
        <Button className="justify-start gap-2" variant="ghost">
          <CalendarIcon size={18} />
          Agendamentos
        </Button>
      </div>

      <div className="flex flex-col gap-2 py-5">
        <Button variant="ghost" className="justify-start gap-2">
          <LogOutIcon size={18} />
          Sair da Conta
        </Button>
      </div>
    </SheetContent>
  )
}

export default SidebarSheet
