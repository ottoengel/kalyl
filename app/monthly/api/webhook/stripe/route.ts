import { db } from "@/app/_lib/prisma"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export const POST = async (request: Request) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.error()
  }
  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.error()
  }
  const text = await request.text()
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  })

  const event = stripe.webhooks.constructEvent(
    text,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  )

  switch (event.type) {
    case "invoice.paid": {
      // Atualizar o usuário com o seu novo plano
      const { customer, subscription, subscription_details } = event.data.object
      const userId = subscription_details?.metadata?.user_id
      if (!userId) {
        return NextResponse.error()
      }
      await db.user.update({
        where: {
          id: userId,
        },
        data: {},
      })
      break
    }
    case "customer.subscription.deleted": {
      // Remover o plano pro do usuário
      export const subscription = await stripe.subscriptions.retrieve(
        event.data.object.id,
      )
      const clerkUserId = subscription.metadata.clerk_user_id
      if (!clerkUserId) {
        return NextResponse.error()
      }
      await clerkClient().users.updateUser(clerkUserId, {
        privateMetadata: {
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        },
        publicMetadata: {
          subscriptionPlan: null,
        },
      })
    }
  }
  return NextResponse.json({ received: true })
}
