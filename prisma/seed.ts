// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function seedDatabase() {
  try {
    const images = [
      "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fillustrations%2Fuser-profile&psig=AOvVaw0aI7itwSsZIUrflX0z3O-9&ust=1727813160210000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCJDLrN-764gDFQAAAAAdAAAAABAJ",
      // Adicione mais URLs se necessário
    ]

    // Nomes dos barbeiros
    const barberNames = ["Lucas", "Kalyl"]

    // Serviços disponíveis
    const services = [
      {
        name: "Corte de Cabelo",
        description: "Estilo personalizado com as últimas tendências.",
        price: 60.0,
        imageUrl:
          "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
      },
      {
        name: "Barba",
        description: "Modelagem completa para destacar sua masculinidade.",
        price: 40.0,
        imageUrl:
          "https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png",
      },
      {
        name: "Cabelo e Barba",
        description: "Corte e barba alinhados com estilo e precisão.",
        price: 90.0,
        imageUrl:
          "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      },
      {
        name: "Pigmentação",
        description:
          "Preenchimento de falhas para barba e cabelo mais uniformes.",
        price: 10.0,
        imageUrl:
          "https://utfs.io/f/178da6b6-6f9a-424a-be9d-a2feb476eb36-16t.png",
      },
      {
        name: "Alinhamento Barba",
        description:
          "Barba modelada com precisão para um visual limpo e estiloso.",
        price: 15.0,
        imageUrl:
          "https://utfs.io/f/45331760-899c-4b4b-910e-e00babb6ed81-16q.png",
      },
    ]

    // Criar barbeiros e seus serviços
    for (let i = 0; i < barberNames.length; i++) {
      const name = barberNames[i]
      const imageUrl = images[i % images.length] // Usa a imagem correspondente ao barbeiro

      const barber = await prisma.barber.create({
        data: {
          name,
          imageUrl,
          phones: ["(41) 99237-1997", "(41) 99237-1997"],
        },
      })

      for (const service of services) {
        await prisma.barberServices.create({
          data: {
            name: service.name,
            description: service.description,
            price: service.price,
            barber: {
              connect: { id: barber.id },
            },
            imageUrl: service.imageUrl,
          },
        })
      }
    }

    console.log("Barbeiros e serviços criados com sucesso!")
  } catch (error) {
    console.error("Erro ao criar as barbearias:", error)
  } finally {
    await prisma.$disconnect() // Garante que a conexão será fechada
  }
}

seedDatabase()
