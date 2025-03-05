"use server"

import { db } from "@/app/_lib/prisma"
import Stripe from "stripe"

export const createStripeCheckout = async () => {
  const user = await db.user.findFirst()
  if (!user) {
    throw new Error("Unauthorized")
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe key not found")
  }

  if (!process.env.STRIPE_PRICE_ID_CABELO) {
    throw new Error("Stripe price ID not found")
  }

  if (!process.env.APP_URL) {
    throw new Error("APP_URL is not defined")
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-02-24.acacia",
  })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    success_url: process.env.APP_URL,
    cancel_url: process.env.APP_URL,
    subscription_data: {
      metadata: {
        user_id: user.id, // Corrigindo para acessar `id` do usuário
      },
    },
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID_CABELO as string, // Corrigindo variável de ambiente
        quantity: 1,
      },
    ],
  })
  return { sessionId: session.id }
}
