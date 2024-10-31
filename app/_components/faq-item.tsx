import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"

const FAQ = () => {
  return (
    <div>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>FAQ</AccordionTrigger>
          <AccordionContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  Quais serviços estão disponíveis na barbearia?
                </AccordionTrigger>
                <AccordionContent>
                  Oferecemos cortes de cabelo, aparo de barba, aparo de
                  sobrancelha, pigmentação e alinhamento de barba
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Preciso agendar um horário ou aceitam clientes por ordem de
                  chegada?
                </AccordionTrigger>
                <AccordionContent>
                  Aceitamos clientes apenas com horário marcado para evitar
                  espera e garantir que você seja atendido no horário desejado.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Como posso agendar um horário?
                </AccordionTrigger>
                <AccordionContent>
                  Você pode agendar diretamente pelo nosso site. Após o
                  agendamento, você receberá uma confirmação do horário
                  reservado.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Os produtos usados durante o atendimento estão incluídos no
                  valor do serviço?
                </AccordionTrigger>
                <AccordionContent>
                  Sim, todos os produtos utilizados durante o atendimento fazem
                  parte do valor do serviço.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  Vocês fazem atendimento para crianças e idosos?
                </AccordionTrigger>
                <AccordionContent>
                  Sim, atendemos todas as faixas etárias, inclusive crianças e
                  idosos. Nossos barbeiros têm experiência para proporcionar um
                  atendimento seguro e confortável para todos.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  Quanto tempo dura, em média, cada atendimento?
                </AccordionTrigger>
                <AccordionContent>
                  O tempo de cada atendimento varia conforme o serviço. Cortes
                  de cabelo duram em média 30-45 minutos, enquanto apara de
                  barba e outros serviços combinados podem durar até uma hora ou
                  mais.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-7">
                <AccordionTrigger className="text-left">
                  Vocês seguem protocolos de higiene e segurança?
                </AccordionTrigger>
                <AccordionContent>
                  Seguimos protocolos de higiene e segurança, incluindo a
                  esterilização de todos os instrumentos. A saúde e o bem-estar
                  dos nossos clientes são nossa prioridade.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-8">
                <AccordionTrigger className="text-left">
                  Vocês oferecem sugestões de corte?
                </AccordionTrigger>
                <AccordionContent>
                  Sim, nossos barbeiros estão disponíveis para ajudar você a
                  escolher o melhor corte e estilo de barba de acordo com seu
                  tipo de rosto e preferência pessoal.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default FAQ
