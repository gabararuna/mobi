import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Award, Bus, Car, Bike, Zap, TrendingDown } from 'lucide-react';
import {
  calcularCustoCenario,
  formatBRL,
  formatNumber,
} from '../../utils/calculations';

// ─── Ícone por tipo ───────────────────────────────────────────────────────────
function ModalIcon({ tipo, subtipo, size = 16 }) {
  const s = { color: '#00BFA5' };
  if (tipo === 'onibus')    return <Bus  size={size} style={s} />;
  if (tipo === 'uberCarro') return <Zap  size={size} style={s} />;
  if (tipo === 'uberMoto')  return <Zap  size={size} style={s} />;
  if (tipo === 'veiculo')   return subtipo === 'carro'
    ? <Car  size={size} style={s} />
    : <Bike size={size} style={s} />;
  return null;
}

// ─── Gráfico de barras horizontais ───────────────────────────────────────────
function BarChart({ resultados }) {
  const max = Math.max(...resultados.map(r => r.resultado.total), 1);

  return (
    <div className="space-y-3">
      {resultados.map((item, i) => {
        const pct     = (item.resultado.total / max) * 100;
        const isWinner = i === 0;
        return (
          <div key={item.cenario.id} className="flex items-center gap-3">
            {/* Nome */}
            <span
              className="text-xs font-light w-24 shrink-0 text-right truncate"
              style={{ color: isWinner ? 'white' : 'rgba(255,255,255,0.35)' }}
            >
              {item.cenario.nome}
            </span>

            {/* Barra */}
            <div
              className="flex-1 h-6 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="h-full rounded-full"
                style={{
                  background: isWinner
                    ? 'linear-gradient(90deg, rgba(0,191,165,0.75), rgba(0,230,199,0.45))'
                    : 'linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))',
                  boxShadow: isWinner ? '0 0 12px rgba(0,191,165,0.25)' : 'none',
                }}
              />
            </div>

            {/* Valor */}
            <span
              className="text-xs font-medium w-20 shrink-0"
              style={{ color: isWinner ? '#00BFA5' : 'rgba(255,255,255,0.45)' }}
            >
              {formatBRL(item.resultado.total)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Breakdown de custos ──────────────────────────────────────────────────────
function BreakdownList({ breakdown }) {
  const items = Object.entries(breakdown)
    .filter(([, v]) => v.valor > 0)
    .sort((a, b) => b[1].valor - a[1].valor);

  if (items.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {items.map(([key, { label, valor }]) => (
        <div key={key} className="flex items-center justify-between">
          <span className="text-xs text-white/25 font-light">{label}</span>
          <span className="text-xs text-white/45 font-light">{formatBRL(valor)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Card de resultado detalhado ──────────────────────────────────────────────
function ResultCard({ item, rank, delay }) {
  const { cenario, resultado } = item;
  const isWinner = rank === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-2xl p-4 mb-3"
      style={{
        background: isWinner
          ? 'linear-gradient(135deg, rgba(0,191,165,0.07) 0%, rgba(0,191,165,0.02) 100%)'
          : 'rgba(255,255,255,0.025)',
        border: `1px solid ${isWinner ? 'rgba(0,191,165,0.22)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      {/* Topo: ícone + nome + badge + total */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{
            background: isWinner ? 'rgba(0,191,165,0.15)' : 'rgba(255,255,255,0.05)',
            border:     `1px solid ${isWinner ? 'rgba(0,191,165,0.25)' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          <ModalIcon tipo={cenario.tipo} subtipo={cenario.subtipo} size={15} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-sm font-medium text-white truncate">{cenario.nome}</span>
            {isWinner && (
              <span
                className="flex items-center gap-1 text-[0.6rem] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full shrink-0"
                style={{ background: 'rgba(0,191,165,0.15)', color: '#00BFA5', border: '1px solid rgba(0,191,165,0.3)' }}
              >
                <Award size={9} />
                Melhor escolha
              </span>
            )}
          </div>
          <p
            className="text-xl font-light"
            style={{ color: isWinner ? '#00BFA5' : 'rgba(255,255,255,0.65)', letterSpacing: '-0.02em' }}
          >
            {formatBRL(resultado.total)}
            <span className="text-xs font-light text-white/25 ml-1">/mês</span>
          </p>
        </div>

        <span className="text-xs text-white/15 font-light shrink-0 mt-1">#{rank}</span>
      </div>

      {/* Faixa fixo / variável / depreciação */}
      {(resultado.fixo > 0 || resultado.variavel > 0) && (
        <div className="flex gap-2 mb-3">
          {resultado.fixo > 0 && (
            <div
              className="flex-1 p-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <p className="text-[0.6rem] text-white/20 uppercase tracking-wide mb-0.5">Custo Fixo</p>
              <p className="text-xs text-white/55 font-light">{formatBRL(resultado.fixo)}</p>
            </div>
          )}
          {resultado.variavel > 0 && (
            <div
              className="flex-1 p-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <p className="text-[0.6rem] text-white/20 uppercase tracking-wide mb-0.5">Custo Variável</p>
              <p className="text-xs text-white/55 font-light">{formatBRL(resultado.variavel)}</p>
            </div>
          )}
          {resultado.depreciacao > 0 && (
            <div
              className="flex-1 p-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <p className="text-[0.6rem] text-white/20 uppercase tracking-wide mb-0.5">Depreciação</p>
              <p className="text-xs text-white/55 font-light">{formatBRL(resultado.depreciacao)}</p>
            </div>
          )}
        </div>
      )}

      {/* Separador */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
        <BreakdownList breakdown={resultado.breakdown} />
      </div>

    </motion.div>
  );
}

// ─── Análise de break-even ────────────────────────────────────────────────────
function BreakevenCard({ resultados }) {
  // Compara o veículo mais barato vs o app mais barato
  const veiculos = resultados.filter(r => r.cenario.tipo === 'veiculo');
  const apps     = resultados.filter(r => r.cenario.tipo === 'uberCarro' || r.cenario.tipo === 'uberMoto');

  if (veiculos.length === 0 || apps.length === 0) return null;

  const melhorVeiculo = veiculos.reduce((a, b) => a.resultado.total < b.resultado.total ? a : b);
  const melhorApp     = apps.reduce((a, b) => a.resultado.total < b.resultado.total ? a : b);

  // Custos acumulados: veículo tem custo inicial (entrada ou valor à vista)
  const entrada    = melhorVeiculo.cenario.financiar
    ? (melhorVeiculo.cenario.entrada ?? 0)
    : (melhorVeiculo.cenario.valor   ?? 0);

  const diffMensal = melhorApp.resultado.total - melhorVeiculo.resultado.total;

  // Se veículo é mais caro que app, sem break-even
  if (diffMensal <= 0) return null;

  const meses = Math.ceil(entrada / diffMensal);
  const anos  = (meses / 12).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.55 }}
      className="rounded-2xl p-4 mb-4"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <TrendingDown size={14} style={{ color: 'rgba(0,191,165,0.6)' }} />
        <span className="text-xs text-white/35 font-medium tracking-wide uppercase">Ponto de equilíbrio</span>
      </div>
      <p className="text-sm text-white/60 font-light leading-relaxed">
        Levando em conta o custo de entrada, o{' '}
        <span className="text-white">{melhorVeiculo.cenario.nome}</span> se torna mais econômico que{' '}
        <span className="text-white">{melhorApp.cenario.nome}</span> após{' '}
        <span style={{ color: '#00BFA5' }}>{meses} meses ({anos} anos)</span>.
      </p>
    </motion.div>
  );
}

// ─── Step principal ───────────────────────────────────────────────────────────
export default function Step4Resultado({ data, onBack, onReset }) {
  const { kmMensal, cenarios } = data;

  const resultados = useMemo(() => {
    return cenarios
      .map(cenario => ({
        cenario,
        resultado: calcularCustoCenario(cenario, kmMensal),
      }))
      .sort((a, b) => a.resultado.total - b.resultado.total);
  }, [cenarios, kmMensal]);

  const winner = resultados[0];

  return (
    <div className="min-h-screen px-5 md:px-6 pt-20 pb-14">
      <div className="w-full max-w-lg mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-7"
        >
          <p className="text-xs font-medium tracking-widest uppercase text-white/25 mb-2">
            Resultado
          </p>
          <h2 className="text-2xl sm:text-3xl font-light text-white mb-1.5 leading-tight">
            Comparativo <span className="shimmer-teal font-semibold">Mensal</span>
          </h2>
          <p className="text-xs text-white/25 font-light">
            Base: {formatNumber(kmMensal, 0)} km/mês
          </p>
        </motion.div>

        {/* Gráfico de barras */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card rounded-2xl p-5 mb-4"
        >
          <p className="text-xs text-white/25 font-medium tracking-wide uppercase mb-4">
            Custo mensal comparado
          </p>
          <BarChart resultados={resultados} />
        </motion.div>

        {/* Destaque: melhor escolha */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl p-5 mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(0,191,165,0.13) 0%, rgba(0,191,165,0.04) 100%)',
            border:     '1px solid rgba(0,191,165,0.3)',
            boxShadow:  '0 4px 32px rgba(0,191,165,0.1)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(0,191,165,0.2)' }}
            >
              <Award size={18} style={{ color: '#00BFA5' }} />
            </div>
            <div className="flex-1 min-w-0">
              <span
                className="text-[0.6rem] font-semibold tracking-widest uppercase"
                style={{ color: '#00BFA5' }}
              >
                Melhor Escolha
              </span>
              <p className="text-xl font-semibold text-white mt-0.5 truncate">
                {winner.cenario.nome}
              </p>
              <p
                className="text-3xl font-light mt-1"
                style={{ color: '#00BFA5', letterSpacing: '-0.02em' }}
              >
                {formatBRL(winner.resultado.total)}
                <span className="text-sm text-white/30 font-light">/mês</span>
              </p>
            </div>
          </div>

          {resultados.length > 1 && (
            <div
              className="mt-4 pt-3 flex items-center gap-2"
              style={{ borderTop: '1px solid rgba(0,191,165,0.14)' }}
            >
              <TrendingDown size={13} style={{ color: 'rgba(0,191,165,0.6)' }} />
              <p className="text-xs text-white/35 font-light">
                <span style={{ color: '#00BFA5' }}>
                  {formatBRL(resultados[1].resultado.total - winner.resultado.total)}
                </span>
                {' '}mais barato que {resultados[1].cenario.nome}
                {' '}(
                <span style={{ color: '#00BFA5' }}>
                  {formatBRL((resultados[1].resultado.total - winner.resultado.total) * 12)}/ano
                </span>
                )
              </p>
            </div>
          )}
        </motion.div>

        {/* Break-even (só aparece quando faz sentido) */}
        <BreakevenCard resultados={resultados} />

        {/* Cards detalhados por cenário */}
        {resultados.map((item, i) => (
          <ResultCard
            key={item.cenario.id}
            item={item}
            rank={i + 1}
            delay={0.35 + i * 0.07}
          />
        ))}

        {/* Ações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex gap-3 mt-6"
        >
          <button onClick={onBack} className="glass-btn flex items-center gap-2 text-sm font-light">
            <ArrowLeft size={16} />
            Voltar
          </button>
          <button
            onClick={onReset}
            className="glass-btn glass-btn-primary flex-1 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <RotateCcw size={15} />
            Reiniciar
          </button>
        </motion.div>

      </div>
    </div>
  );
}
