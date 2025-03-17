import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Recebendo requisição com body:", body);

    const { email } = body;
    if (!email) {
      return NextResponse.json({ valid: false, message: "E-mail obrigatório" }, { status: 400 });
    }

    const apiKey = process.env.HUNTER_API_KEY;
    console.log("API Key carregada:", apiKey ? "Sim" : "Não");

    if (!apiKey) {
      return NextResponse.json({ valid: false, message: "API Key não configurada" }, { status: 500 });
    }

    const response = await fetch(
      `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${apiKey}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na API do Hunter:", errorText);
      return NextResponse.json({ valid: false, message: "Erro na API do Hunter", error: errorText }, { status: 500 });
    }

    const data = await response.json();
    console.log("Resposta da API Hunter:", data);

    return NextResponse.json({
      valid: data.data.result === "deliverable",
      data: data.data,
      message: data.data.result === "deliverable" ? "E-mail válido" : "E-mail inválido",
    });
  } catch (error) {
    console.error("Erro geral:", error);
    return NextResponse.json({ valid: false, message: "Erro ao verificar o e-mail", error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use uma requisição POST com um e-mail" }, { status: 200 });
}
