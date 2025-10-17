'use client'

import { useState } from 'react'
import { Button } from "../../app/_components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../app/_components/ui/card"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "../../app/_components/ui/field"
import Image from "next/image"
import Header from '../_components/header'
import { updateNumber } from '@/app/_actions/update-numer'
import PhoneInput from 'react-phone-input-2'
import { toast } from "sonner"
import { Loader2 } from "lucide-react" // Import do Loader2
import { useRouter } from "next/navigation"


export default function Phone() {
    const router = useRouter()
    const [phoneNumber, setPhoneNumber] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        setIsLoading(true)
        e.preventDefault()

        const cleanPhoneNumber = phoneNumber.replace(/[^+\d]/g, '')

        if (cleanPhoneNumber.length < 13) {
            setIsLoading(false)
            toast.error("Por favor, preencha o número de telefone completamente.")
            return
        }

        const formData = new FormData()
        formData.append('phoneNumber', phoneNumber)

        try {
            const response = await updateNumber(formData)
            toast.success(response.message)
            setTimeout(() => {
                router.push("/")
            }, 400)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setIsLoading(false)
            toast.error("Ocorreu um erro ao atualizar o número")
        }
    }

    return (
        <div>
            <Header />
            <div className="absolute lg:relative text-center text-gray-300 font-medium leading-relaxed px-4 mt-2">
                <p>Olá, pessoal! 👋</p>
                <p>
                    Atualizamos nossa <span className="text-white font-semibold">política do site</span> e agora é necessário informar o número de celular para continuar.
                </p>
                <p className="mt-1 text-gray-400/80 text-sm">
                    Essa medida ajuda a manter sua conta mais segura e facilitar nosso contato com você. 📱
                </p>
            </div>

            <div className="flex items-center justify-center p-4 pt-[220px] lg:pt-28">
                <div className="relative w-full max-w-md">
                    <div className="absolute top-[-50px] left-[-17px] w-36 lg:w-[200px] lg:top-[-110px] lg:left-[-135px]">
                        <Image src="/desenho2.png" width={500} height={200} alt="Character" />
                    </div>
                    <Card className="max-w-md w-full lg:mx-auto">
                        <CardHeader>
                            <CardTitle className="pl-28 lg:pl-10">Insira seu Número de Telefone!</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-[105px] lg:pl-0">
                            <form onSubmit={handleSubmit}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel className="pl-[60px] lg:pl-[140px]" htmlFor="phoneNumber">
                                            Número de Telefone
                                        </FieldLabel>
                                        <PhoneInput
                                            country={'br'} // Define o país padrão como Brasil (+55)
                                            value={phoneNumber}
                                            onChange={setPhoneNumber}
                                            inputProps={{
                                                id: 'phoneNumber',
                                                required: true,
                                            }}
                                            containerClass="flex-1"
                                            inputClass="w-full rounded-md border border-gray-300 text-black p-2"
                                            buttonClass="border-gray-300"
                                            dropdownClass="border-gray-300"
                                            enableSearch
                                            searchPlaceholder="Buscar país..."
                                            placeholder="Insira o DDI primeiro"
                                        />
                                    </Field>
                                    <Field>
                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Confirmando...</span>
                                                </div>
                                            ) : (
                                                "Confirmar"
                                            )}
                                        </Button>
                                    </Field>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}