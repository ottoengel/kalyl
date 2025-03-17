/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { signIn } from "next-auth/react"
import { useState } from "react"
import { Button } from "./ui/button"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createUser } from "../_actions/create-user"
import { checkEmail } from "../utils/verifyEmail";
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Obrigatório"),
})

const registerSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

const SignInDialog = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  async function handleLogin(values: LoginForm) {
    setError(null)
    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    })

    if (result?.error) {
      setError("E-mail ou senha inválidos!")
    }
  }

  async function handleRegister(values: RegisterForm) {
    setError(null);
    const isValidEmail = await checkEmail(values.email);
  
    if (!isValidEmail) {
      toast.error("E-mail inválido! Verifique e tente novamente.");
      return;
    }
  
    try {
      await createUser({
        name: values.name,
        email: values.email,
        password: values.password,
      });
  
      toast.success("Usuário cadastrado! Faça login para continuar.");
      setIsLogin(true);
    } catch (error: any) {
      if (error.message.includes("Unique constraint failed")) {
        toast.error("E-mail já está sendo usado! Tente outro.");
      } else {
        toast.error("Erro ao criar conta. Tente novamente.");
      }
    }
  }


  return (
    <>
      <DialogHeader>
        <DialogTitle>{isLogin ? "Faça login" : "Cadastre-se"}</DialogTitle>
        <DialogDescription>
          {isLogin ? "Entre com seu e-mail ou use outra conta" : "Crie uma conta para acessar a plataforma"}
        </DialogDescription>
      </DialogHeader>
      {isLogin ? (
  <Form {...loginForm} key="login">
    <form onSubmit={loginForm.handleSubmit(handleLogin)}>

            <FormField control={loginForm.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={loginForm.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button className="relative top-4 w-full" type="submit">
              Entrar
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...registerForm} key="register">
          <form onSubmit={registerForm.handleSubmit(handleRegister)}>
      
            <FormField control={registerForm.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input type="text" {...field} onChange={e => field.onChange(e.target.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={registerForm.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={registerForm.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button className="relative top-4 w-full" type="submit">
              Cadastrar
            </Button>
          </form>
        </Form>
      )}

      <div className="flex items-center">
        <div className="h-[1px] flex-grow bg-gray-400"></div>
        <span className="p-4 text-gray-400">ou</span>
        <div className="h-[1px] flex-grow bg-gray-400"></div>
      </div>

      {isLogin && (
        <Button variant="outline" className="gap-1 font-bold w-full" onClick={() => signIn("google")}>
          <img alt="Fazer login com Google" src="/google.svg" width={18} height={18} />
          Google
        </Button>
      )}

      <Button
        variant="link"
        className="w-full text-blue-500"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Faça login"}
      </Button>
    </>
  )
}

export default SignInDialog
