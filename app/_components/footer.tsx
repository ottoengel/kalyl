import Image from "next/image"
import Link from "next/link"
import { FaInstagram, FaWhatsapp } from "react-icons/fa"
import { MapPin } from "lucide-react"

const Footer = () => {
  return (
    <footer className="mt-12 border-t border-border/60 bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Image src="/logo.png" height={18} width={80} alt="Barbearia Kalyl" />
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={14} className="text-primary" />
            R. Augusto Stresser, 725 — Curitiba
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="https://www.instagram.com/barbeariakalyl/"
            target="_blank"
            aria-label="Instagram"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            <FaInstagram size={22} />
          </Link>
          <Link
            href="https://wa.me/5541992371997"
            target="_blank"
            aria-label="WhatsApp"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            <FaWhatsapp size={22} />
          </Link>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © 2025 <span className="font-semibold text-foreground">Barbearia Kalyl</span> — Estilo, tradição e qualidade.
      </div>
    </footer>
  )
}

export default Footer
