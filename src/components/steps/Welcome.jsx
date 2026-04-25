import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Welcome({ onStart }) {
  const [ready, setReady] = useState(false);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onMove = (e) => setMouse({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center px-6">
      {/* Fundo: gradiente radial teal + grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 80%, rgba(0,191,165,0.14) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,191,165,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,191,165,0.04) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Orb responsivo ao mouse */}
      <div
        className="absolute pointer-events-none mix-blend-screen"
        style={{
          width: 'clamp(300px, 50vw, 600px)',
          height: 'clamp(300px, 50vw, 600px)',
          left: `${mouse.x * 100}%`,
          top: `${mouse.y * 100}%`,
          transform: 'translate(-50%, -50%)',
          transition: 'left 0.8s ease, top 0.8s ease',
        }}
      >
        <div className="orb-container" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 max-w-xl mx-auto text-center">
        {/* Badge → link Numera */}
        <motion.a
          href="https://www.gruponumera.com"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 border border-white/10 bg-white/5 backdrop-blur-md text-[#00BFA5] text-[10px] font-semibold tracking-widest uppercase no-underline transition-all duration-300 hover:bg-white/10 hover:border-[#00BFA5]/40 hover:shadow-[0_0_20px_rgba(0,191,165,0.25)] hover:-translate-y-0.5 active:scale-95"
        >
          Desenvolvido por Numera
        </motion.a>

        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-3"
        >
          <span
            className="shimmer-teal font-semibold tracking-tight"
            style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', lineHeight: 1 }}
          >
            Mobi
          </span>
        </motion.div>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.42 }}
          className="text-sm md:text-base font-light text-white/35 leading-relaxed max-w-md mx-auto mb-10"
        >
          Descubra qual modal de transporte cabe melhor no seu bolso.
          Compare ônibus, aplicativos e veículo próprio com precisão financeira.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.55 }}
        >
          <button
            onClick={onStart}
            className="glass-btn glass-btn-primary flex items-center gap-2 text-sm font-medium mx-auto"
            style={{ padding: '0.8rem 2.25rem' }}
          >
            Iniciar
            <ArrowRight size={15} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
