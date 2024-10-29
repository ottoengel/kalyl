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
          <AccordionTrigger>Quais serviços vocês oferecem?</AccordionTrigger>
          <AccordionContent>
            Nós oferecemos uma variedade de serviços, incluindo cortes de
            cabelo, aparo de barba, tratamento de barba, coloração, depilação e
            cuidados com a pele. Sempre buscamos atender às necessidades dos
            nossos clientes com um toque personalizado!
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-left">
            É necessário agendar horário ou posso chegar sem marcar?
          </AccordionTrigger>
          <AccordionContent>
            Recomendamos agendar um horário para garantir um atendimento mais
            rápido e eficiente. No entanto, também aceitamos clientes que chegam
            sem agendamento, embora a espera possa ser um pouco mais longa.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-3">
          <AccordionTrigger className="text-left">
            A barbearia é acessível para pessoas com mobilidade reduzida?
          </AccordionTrigger>
          <AccordionContent>
            Sim, nossa barbearia é acessível e projetada para atender a todos os
            nossos clientes, independentemente de suas necessidades de
            mobilidade. Se você tiver alguma dúvida específica, sinta-se à
            vontade para nos contatar antes da sua visita!
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default FAQ
