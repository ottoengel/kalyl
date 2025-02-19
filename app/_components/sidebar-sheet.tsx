"use client"

import { CalendarIcon, HomeIcon, LogInIcon, LogOutIcon } from "lucide-react"
import { Button } from "./ui/button"
import { SheetClose, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
import Link from "next/link"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarImage } from "./ui/avatar"
import SignInDialog from "./sign-in-dialog"
import { useState } from "react"

const SidebarSheet = () => {
  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false)

  const { data } = useSession()

  const handleLogoutClick = () => signOut()

  const handleBookingClick = (e: { preventDefault: () => void }) => {
    if (!data?.user) {
      e.preventDefault() // Evita o redirecionamento
      setSignInDialogIsOpen(true)
    }
  }

  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="text-left">Menu</SheetTitle>
      </SheetHeader>

      <div className="flex items-center justify-between gap-3 border-b border-solid py-5">
        {data?.user ? (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={data?.user?.image ?? ""} />
            </Avatar>

            <div>
              <p className="font-bold">{data.user.name}</p>
              <p className="text-xs">{data.user.email}</p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-bold">Olá, faça seu login!</h2>
            <Dialog 
              open={signInDialogIsOpen}
              onOpenChange={(open) => setSignInDialogIsOpen(open)}
            >
              <DialogTrigger asChild>
                <Button size="icon" className="bg-[#F6484B]" variant="outline">
                  <LogInIcon />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90%] rounded-xl">
                <SignInDialog />
              </DialogContent>
            </Dialog>
          </>
        )}
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
        <Button className="justify-start gap-2" variant="ghost" asChild>
          <Link
            href={data?.user?.role === "ADMIN" ? "/dashboard" : "/bookings"}
            onClick={handleBookingClick}
          >
            <CalendarIcon size={18} />
            {data?.user?.role === "ADMIN" ? "Dashboard" : "Agendamentos"}
          </Link>
        </Button>
      </div>

      {data?.user && (
        <div className="flex flex-col gap-2 py-5">
          <Button
            variant="ghost"
            className="justify-start gap-2"
            onClick={handleLogoutClick}
          >
            <LogOutIcon size={18} />
            Sair da Conta
          </Button>
        </div>
      )}
    </SheetContent>
  )
}

export default SidebarSheet
