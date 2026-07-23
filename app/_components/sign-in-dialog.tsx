/* eslint-disable @next/next/no-img-element */
import { signIn } from "next-auth/react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "./ui/button"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createUser } from "../_actions/create-user"
import { checkEmail } from "../utils/verifyEmail"
import { toast } from "sonner"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { cn } from "../_lib/utils"
import PhoneInput from "react-phone-input-2"

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Obrigatório"),
})

const registerSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  number: z
    .string()
    .refine(
      (value) => value.replace(/[^+\d]/g, "").length >= 12,
      "Preencha o número completo com DDD",
    ),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

const SignInDialog = () => {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", number: "", password: "" },
  })

  async function handleLogin(values: LoginForm) {
    setIsSubmitting(true)
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      })

      if (result?.error) {
        toast.error("E-mail ou senha inválidos!")
      } else {
        toast.success("Login realizado com sucesso!")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRegister(values: RegisterForm) {
    setIsSubmitting(true)
    try {
      const isValidEmail = await checkEmail(values.email)
      if (!isValidEmail) {
        toast.error("E-mail inválido! Verifique e tente novamente.")
        return
      }

      const result = await createUser({
        name: values.name,
        email: values.email,
        number: values.number,
        password: values.password,
      })

      if (!result.success) {
        if (result.error === "email_in_use") {
          toast.error("Este e-mail já tem cadastro com senha. Faça login.")
          setMode("login")
        } else if (result.error === "invalid_number") {
          toast.error("Número de telefone incompleto. Confira o DDD.")
        } else {
          toast.error("Dados inválidos. Confira e tente novamente.")
        }
        return
      }

      if (result.linkedToGoogle) {
        toast.success(
          "Senha adicionada à sua conta Google! Agora você pode entrar dos dois jeitos.",
        )
      }

      // Entra automaticamente após o cadastro
      const loginResult = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      })

      if (loginResult?.error) {
        toast.success("Conta criada! Faça login para continuar.")
        setMode("login")
      } else {
        toast.success("Conta criada, bem-vindo!")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar conta. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const passwordField = (
    field: {
      value: string
      onChange: React.ChangeEventHandler<HTMLInputElement>
    },
    autoComplete: string,
  ) => (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        autoComplete={autoComplete}
        className="pr-10"
        value={field.value}
        onChange={field.onChange}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShowPassword((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      <DialogHeader className="items-center space-y-2">
        <Image src="/logo.png" width={90} height={24} alt="Barbearia Kalyl" />
        <DialogTitle className="font-display text-2xl tracking-wide">
          {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
        </DialogTitle>
        <DialogDescription className="text-center">
          {mode === "login"
            ? "Entre para agendar seu horário."
            : "Leva menos de um minuto."}
        </DialogDescription>
      </DialogHeader>

      {/* GOOGLE */}
      <Button
        variant="outline"
        className="w-full gap-2 font-semibold"
        onClick={() => signIn("google")}
        disabled={isSubmitting}
      >
        <img alt="Google" src="/google.svg" width={18} height={18} />
        Continuar com Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-grow bg-border" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          ou com e-mail
        </span>
        <div className="h-px flex-grow bg-border" />
      </div>

      {/* ABAS */}
      <div className="flex rounded-full border border-border/60 p-0.5">
        {(["login", "register"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMode(tab)}
            className={cn(
              "flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              mode === tab
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab === "login" ? "Entrar" : "Criar conta"}
          </button>
        ))}
      </div>

      {mode === "login" ? (
        <Form {...loginForm} key="login">
          <form
            onSubmit={loginForm.handleSubmit(handleLogin)}
            className="space-y-3"
          >
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    {passwordField(field, "current-password")}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="!mt-5 w-full font-semibold"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...registerForm} key="register">
          <form
            onSubmit={registerForm.handleSubmit(handleRegister)}
            className="space-y-3"
          >
            <FormField
              control={registerForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input type="text" autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerForm.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <PhoneInput
                      country="br"
                      onlyCountries={["br"]}
                      disableDropdown
                      countryCodeEditable={false}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="+55 (41) 99999-9999"
                      inputProps={{ autoComplete: "tel" }}
                      containerClass="!w-full"
                      inputClass="!h-10 !w-full !rounded-md !border !border-input !bg-background !pl-12 !text-sm !text-foreground focus:!outline-none focus:!ring-2 focus:!ring-ring"
                      buttonClass="!rounded-l-md !border !border-input !bg-secondary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    {passwordField(field, "new-password")}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-xs text-muted-foreground">
              Já usa o Google com este e-mail? A senha será adicionada à mesma
              conta.
            </p>
            <Button
              className="!mt-5 w-full font-semibold"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Criar conta"
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}

export default SignInDialog
