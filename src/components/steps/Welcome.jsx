import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Welcome({ onStart }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
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

      {/* Orb */}
      <div
        className="absolute pointer-events-none mix-blend-screen"
        style={{
          width:     'clamp(300px, 50vw, 600px)',
          height:    'clamp(300px, 50vw, 600px)',
          top:       '50%',
          left:      '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="orb-container" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 max-w-xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
          style={{ background: 'rgba(0,191,165,0.08)', border: '1px solid rgba(0,191,165,0.18)' }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#00BFA5', boxShadow: '0 0 5px rgba(0,191,165,0.8)' }}
          />
          <span className="text-xs font-light tracking-widest uppercase text-white/40">
            Comparador de Transporte
          </span>
        </motion.div>

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
