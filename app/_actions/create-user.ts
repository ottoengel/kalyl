"use server"

import bcrypt from "bcrypt"
import { db } from "../_lib/prisma"

interface CreateUserProps {
  name: string
  email: string
  password: string
  number: string
}

export type CreateUserResult =
  | { success: true; linkedToGoogle: boolean }
  | { success: false; error: "email_in_use" | "invalid" | "invalid_number" }

/**
 * Cadastro por e-mail e senha (com telefone).
 * Se o e-mail já pertence a uma conta Google (sem senha), a senha é
 * adicionada à MESMA conta — assim a pessoa consegue entrar dos dois jeitos.
 */
export const createUser = async ({
  name,
  email,
  password,
  number,
}: CreateUserProps): Promise<CreateUserResult> => {
  const cleanEmail = email.trim().toLowerCase()
  const cleanName = name.trim()
  // Mesmo formato usado em /phone-number: apenas dígitos com DDI (ex.: 5541999999999)
  const cleanNumber = number.replace(/[^+\d]/g, "")

  if (!cleanEmail || !cleanName || password.length < 6) {
    return { success: false, error: "invalid" }
  }
  if (cleanNumber.length < 12) {
    return { success: false, error: "invalid_number" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const existingUser = await db.user.findUnique({
    where: { email: cleanEmail },
    select: { id: true, password: true },
  })

  if (existingUser) {
    if (existingUser.password) {
      return { success: false, error: "email_in_use" }
    }
    // Conta criada pelo Google: adiciona a senha (e o telefone) à mesma conta
    await db.user.update({
      where: { id: existingUser.id },
      data: { password: hashedPassword, number: cleanNumber },
    })
    return { success: true, linkedToGoogle: true }
  }

  await db.user.create({
    data: {
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      number: cleanNumber,
    },
  })
  return { success: true, linkedToGoogle: false }
}
