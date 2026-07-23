import Image from "next/image"
import { Button } from "./ui/button"
import { MenuIcon } from "lucide-react"
import { Sheet, SheetTrigger } from "./ui/sheet"
import SidebarSheet from "./sidebar-sheet"
import Link from "next/link"
import { FaInstagram } from "react-icons/fa"

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" height={18} width={70} alt="Barbearia Kalyl" />
        </Link>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" asChild>
            <Link
              href="https://www.instagram.com/barbeariakalyl/"
              target="_blank"
              aria-label="Instagram da Barbearia Kalyl"
            >
              <FaInstagram className="!size-5 text-muted-foreground transition-colors hover:text-primary" />
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="border-border/80"
                aria-label="Abrir menu"
              >
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SidebarSheet />
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default Header
