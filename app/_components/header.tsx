import Image from "next/image"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { MenuIcon } from "lucide-react"
import { Sheet, SheetTrigger } from "./ui/sheet"
import SidebarSheet from "./sidebar-sheet"
import Link from "next/link"
import { FaInstagram } from "react-icons/fa";

const Header = () => {
  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between p-5">
        <Link href="/">
          <Image src="/logo.png" height={18} width={70} alt="Barbearia Kalyl" />
        </Link>

        <div className="mx-auto">
          <Link href="https://www.instagram.com/barbeariakalyl/">
            <FaInstagram className="hover:text-slate-300" size={30} />
          </Link>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SidebarSheet />
        </Sheet>
      </CardContent>
    </Card>
  )
}

export default Header
