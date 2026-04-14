import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Route } from 'lucide-react';
import { formatNumber } from '../../utils/calculations';

const QUICK_KM = [
  { label: '300 km',    value: 300  },
  { label: '500 km',    value: 500  },
  { label: '650 km',    value: 650  },
  { label: '800 km',    value: 800  },
  { label: '1.000 km',  value: 1000 },
];

// Avalia expressão com multiplicação (ex: "30*22", "30x22", "650")
// Sem eval — apenas split por * e multiplica
function parseExpr(raw) {
  const s = raw.trim()
    .replace(/[xX×\s]/g, '*')    // normaliza separadores
    .replace(/[^0-9.,*]/g, '');  // só dígitos, vírgula, ponto e *

  if (!s) return NaN;

  const parts = s.split('*').filter(Boolean);
  let result = 1;
  for (const p of parts) {
    const n = parseFloat(p.replace(',', '.'));
    if (isNaN(n)) return NaN;
    result *= n;
  }
  return result;
}

export default function Step1Habitos({ data, onNext, onBack }) {
  const initial = data.kmMensal ?? 650;
  const [expr, setExpr]         = useState(formatNumber(initial, 0));
  const [kmMensal, setKmMensal] = useState(initial);

  const isValid  = kmMensal > 0;
  const hasMulti = /[*xX×]/.test(expr); // mostra resultado se usou multiplicação

  const handleChange = (e) => {
    // Permite dígitos, vírgula, ponto, *, x, × e espaço
    const raw = e.target.value.replace(/[^0-9.,*xX× ]/g, '');
    setExpr(raw);
    const parsed = parseExpr(raw);
    if (!isNaN(parsed) && parsed > 0) setKmMensal(Math.round(parsed));
  };

  const handleBlur = () => {
    const parsed = parseExpr(expr);
    if (!isNaN(parsed) && parsed > 0) {
      const km = Math.round(parsed);
      setKmMensal(km);
      setExpr(formatNumber(km, 0)); // formata: "1000" → "1.000"
    } else {
      setExpr(formatNumber(kmMensal, 0));
    }
  };

  const setQuick = (value) => {
    setKmMensal(value);
    setExpr(formatNumber(value, 0));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start md:justify-center px-5 md:px-6 pt-20 md:pt-24 pb-8 md:pb-12">
      <div className="w-full max-w-lg mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="text-xs font-medium tracking-widest uppercase text-white/25 mb-2">
            Passo 1 de 4
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-2 leading-tight">
            Seu <span className="shimmer-teal font-semibold">deslocamento</span>
          </h2>
          <p className="text-sm font-light text-white/35 leading-relaxed">
            Quantos km você percorre por mês? Pode usar multiplicação —
            ex: <span className="text-white/50">30 × 22</span> para 30 km/dia × 22 dias.
          </p>
        </motion.div>

        {/* Input principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4"
        >
          <label className="flex items-center gap-1.5 text-xs text-white/40 font-medium tracking-wide uppercase mb-2">
            <Route size={12} style={{ color: '#00BFA5' }} />
            Km por mês
          </label>
          <div
            className="flex items-center gap-3 rounded-2xl p-4"
            style={{
              background:  isValid ? 'rgba(0,191,165,0.05)'        : 'rgba(255,255,255,0.03)',
              border:      `1px solid ${isValid ? 'rgba(0,191,165,0.3)' : 'rgba(255,255,255,0.08)'}`,
              transition:  'all 0.3s ease',
            }}
          >
            <input
              type="text"
              inputMode="decimal"
              placeholder="ex: 650 ou 30×22"
              value={expr}
              onChange={handleChange}
              onBlur={handleBlur}
              autoFocus
              className="flex-1 min-w-0 bg-transparent text-2xl font-light text-white outline-none placeholder-white/15"
              style={{ letterSpacing: '-0.02em' }}
            />
            <span className="text-sm text-white/30 font-light shrink-0">km/mês</span>
          </div>
        </motion.div>

        {/* Resultado da multiplicação */}
        {hasMulti && isValid && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 px-4 py-2.5 rounded-xl flex items-center justify-between"
            style={{ background: 'rgba(0,191,165,0.06)', border: '1px solid rgba(0,191,165,0.18)' }}
          >
            <span className="text-xs text-white/30 font-light">Resultado</span>
            <span className="text-base font-semibold" style={{ color: '#00BFA5' }}>
              = {formatNumber(kmMensal, 0)} km/mês
            </span>
          </motion.div>
        )}

        {/* Quick values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {QUICK_KM.map(({ label, value }) => {
              const active = kmMensal === value && !hasMulti;
              return (
                <button
                  key={value}
                  onClick={() => setQuick(value)}
                  className="px-3 py-2 rounded-full text-xs font-medium transition-all duration-250"
                  style={{
                    background: active ? 'rgba(0,191,165,0.15)'       : 'rgba(255,255,255,0.04)',
                    border:     `1px solid ${active ? 'rgba(0,191,165,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    color:      active ? '#00BFA5' : 'rgba(255,255,255,0.45)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Navegação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex gap-3"
        >
          <button onClick={onBack} className="glass-btn flex items-center gap-2 text-sm font-light">
            <ArrowLeft size={16} />
            Voltar
          </button>
          <button
            onClick={() => isValid && onNext({ kmMensal })}
            disabled={!isValid}
            className="glass-btn glass-btn-primary flex-1 flex items-center justify-center gap-2 text-sm font-medium"
          >
            Próximo
            <ArrowRight size={16} />
          </button>
        </motion.div>

      </div>
    </div>
  );
}
