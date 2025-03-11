const Hero = () => {
  return (
    <section className="flex h-[652px] items-center overflow-x-clip bg-[radial-gradient(ellipse_150%_80%_at_bottom_left,#991b1b,#0c0a09_80%)] px-5 pb-20 pt-8 md:p-24 md:pb-10 md:pt-5">
      <div className="container mx-auto">
        <h1 className="bg-white bg-[radial-gradient(100%_100%_at_top_left,white,#ffcccc,#991b1b)] bg-clip-text text-center text-8xl font-semibold tracking-tighter text-transparent">
          Plano Mensal
        </h1>
        <p className="mt-5 text-center text-lg text-white/70">
          Com esse plano você garante até quatro agendamentos por mês e ainda
          desbloqueia vantagens especiais todos os meses na nossa barbearia.
        </p>
      </div>
    </section>
  )
}

export default Hero
