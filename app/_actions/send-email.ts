console.log("Arquivo send-email.ts foi carregado");

import emailjs from "@emailjs/browser";

export const sendConfirmationEmail = async (
  userEmail: string, 
  selectedDay: Date, 
  selectedTime: string
) => {
  try {
    const cleanedEmail = userEmail.trim().toLowerCase();
    const templateParams = {
      to_email: cleanedEmail, // Agora sem espaços extras
      booking_date: selectedDay.toLocaleDateString("pt-BR"),
      booking_time: selectedTime,
    };
    
    
    console.log("Tentando enviar email com os seguintes parâmetros:", templateParams);

    await emailjs.send(
      "service_1gvqecc",   // Service ID
      "template_mbbmyyv",  // Template ID
      templateParams,
      "40IxkVcO3KPJtrHD8"     // Substitua pelo seu Public Key do EmailJS
    );

    console.log("Email enviado com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar email:", error);
  }
};