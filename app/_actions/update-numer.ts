'use server'

import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"

export const updateNumber = async (formData: FormData) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error("Usuário não autenticado")
  }

  const phoneNumber = formData.get("phoneNumber")?.toString()

  if (!phoneNumber) {
    throw new Error("Número de telefone é obrigatório")
  }

  // Remove any non-digit characters except the leading '+' for international format
  const cleanPhoneNumber = phoneNumber.replace(/[^+\d]/g, '')

  // Basic validation for phone number length (adjust as needed)
  if (cleanPhoneNumber.length < 10) {
    throw new Error("Número de telefone inválido")
  }

  try {
    await db.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        number: cleanPhoneNumber,
      },
    })
    return { success: true, message: "Número de telefone atualizado com sucesso" }
  } catch (error) {
    console.error("Erro ao atualizar número:", error)
    throw new Error("Falha ao atualizar o número de telefone")
  }
}