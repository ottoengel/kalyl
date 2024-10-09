import { Button } from "@/app/_components/ui/button"
import { db } from "@/app/_lib/prisma"
import { ChevronLeftIcon, MenuIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

interface BarberPageProps {
  params: {
    id: string
  }
}

const BarbersPage = async ({ params }: BarberPageProps) => {
  //chamar o banco
  const barber = await db.barber.findUnique({
    where: {
      id: params.id,
    },
  })

  //se acessar a url passando um id inválido mostrar erro
  if (!barber) {
    return notFound()
  }

  return (
    <div>
      {/* IMAGEM */}
      <div className="relative h-[250px] w-full">
        <Image
          alt={barber?.name}
          src={barber?.imageUrl}
          fill
          className="object-cover"
        />

        <Button
          size="icon"
          variant="secondary"
          className="absolute left-4 top-4"
          asChild
        >
          <Link href="/">
            <ChevronLeftIcon />
          </Link>
        </Button>

        <Button
          size="icon"
          variant="secondary"
          className="absolute right-4 top-4"
        >
          <MenuIcon />
        </Button>
      </div>

      <div className="border-b border-solid p-5">
        <h1 className="text-xl font-bold">{barber.name}</h1>
      </div>
    </div>
  )
}

export default BarbersPage
