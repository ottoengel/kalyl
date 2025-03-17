'use client'

import { Parallax } from 'react-scroll-parallax';
import { LuCrown } from "react-icons/lu";
import { Button } from "../../ui/button"



const Hero = () => {
  return (
    <section className="flex h-[700px] items-center overflow-x-clip bg-[radial-gradient(ellipse_150%_80%_at_bottom_left,#991b1b,#0c0a09_80%)] px-5 pb-20 pt-8 md:p-24 md:pb-10 md:pt-5">
      <div className="container mx-auto relative bottom-20 sm:bottom-24">
        <Parallax speed={-12}>
          <div className='justify-items-center relative'>
            <LuCrown size={40} />
          </div>
          <h1 className="bg-white bg-[radial-gradient(100%_100%_at_top_left,white,#ffcccc,#991b1b)] bg-clip-text text-center text-8xl font-semibold tracking-tighter text-transparent">
            Plano Mensal
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-center text-lg text-white/70 md:max-w-2xl md:text-2xl">
            Parabens, você desbloqueou o plano mensalista mensal!
          </p>

          <p className='mx-auto mt-5 max-w-xl text-center text-lg text-white/70 md:max-w-2xl md:text-2xl'>
            Verifique os detalhes do seu plano abaixo
          </p>

          <div className='items-center text-center top-5 relative'>
            <Button>
              Verificar Meu Plano
            </Button>
          </div>

          <p className='mx-auto mt-5 max-w-xl text-center text-sm text-white/70 md:max-w-2xl md:text-2xl top-5 relative'>
            ou
          </p>

          <p className='mx-auto mt-5 max-w-xl text-center text-lg text-white/70 md:max-w-2xl md:text-2xl top-5 relative'>
            Faça os agendamentos logo a baixo
          </p>
        </Parallax>
      </div>
    </section>
  );
}

export default Hero;
