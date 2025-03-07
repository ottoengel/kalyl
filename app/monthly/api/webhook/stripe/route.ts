/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { db } from "@/app/_lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Mapeamento de priceId para os papéis (roles)
const roleMap: Record<string, string> = {
  [process.env.STRIPE_PRICE_ID_CABELO!]: "MENSALISTA_CABELO",
  [process.env.STRIPE_PRICE_ID_BARBA!]: "MENSALISTA_BARBA",
  [process.env.STRIPE_PRICE_ID_CABELOBARBA!]: "MENSALISTA_CABELO_E_BARBA",
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("stripe-signature")

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)
  } catch (err: any) {
    console.error(`Erro na verificação do webhook: ${err.message}`)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const data = event.data
  const eventType = event.type

  try {
    if (eventType === "checkout.session.completed") {
      const session = data.object as Stripe.Checkout.Session

      if (!session.id) {
        console.error("Sessão do checkout inválida")
        return NextResponse.json({ error: "Sessão inválida" }, { status: 400 })
      }

      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items"],
      })

      const customerId = fullSession.customer as string
      const customer = await stripe.customers.retrieve(customerId)
      const priceId = fullSession.line_items?.data?.[0]?.price?.id ?? null

      if (!customer || !("email" in customer) || !customer.email) {
        console.error("Cliente sem e-mail encontrado")
        return NextResponse.json(
          { error: "Cliente sem e-mail" },
          { status: 400 },
        )
      }

      if (!priceId || !(priceId in roleMap)) {
        console.error("Preço inválido ou não mapeado para um role")
        return NextResponse.json(
          { error: "Preço inválido ou não mapeado" },
          { status: 400 },
        )
      }

      const userRole = roleMap[priceId] // Atribuindo o role conforme o priceId

      const user = await db.user.findUnique({
        where: { email: customer.email }, // Usando o e-mail para buscar o usuário
      })

      if (!user) {
        await db.user.create({
          data: {
            email: customer.email,
            name: customer.name as string | null,
            stripeCustomerId: customerId,
            role: userRole, // Atribuindo o role baseado no priceId
          },
        })
      } else {
        await db.user.update({
          where: { email: customer.email }, // Usando o e-mail para atualizar o usuário
          data: {
            role: userRole, // Atualizando o role com o valor correto
          },
        })
      }

      console.log(
        `✅ Acesso concedido a: ${customer.email} com o role: ${userRole}`,
      )
    }

    if (eventType === "customer.subscription.deleted") {
      const subscription = data.object as Stripe.Subscription

      if (!subscription.id) {
        console.error("Assinatura inválida")
        return NextResponse.json(
          { error: "Assinatura inválida" },
          { status: 400 },
        )
      }

      const user = await db.user.findFirst({
        where: { stripeCustomerId: subscription.customer as string }, // Usando o stripeCustomerId para buscar o usuário
      })

      if (user) {
        await db.user.update({
          where: { id: user.id }, // Atualizando o usuário pela ID
          data: {
            role: "USER", // Atribuindo um role padrão após cancelamento da assinatura
          },
        })
        console.log(`❌ Acesso revogado de: ${user.email}`)
      }
    }
  } catch (e: any) {
    console.error(
      `Erro no webhook do Stripe: ${e.message} | EVENTO: ${eventType}`,
    )
  }

  return NextResponse.json({})
}
