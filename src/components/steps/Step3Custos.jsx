import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Bus, Car, Bike, Zap, ChevronDown } from 'lucide-react';

// ─── NumericInput ─────────────────────────────────────────────────────────────
// Formata números com separador de milhar no blur (ex: 75000 → "75.000").
// Aceita vírgula como decimal; remove pontos ao parsear (são separadores de milhar).

function parseFromDisplay(str) {
  if (!str) return NaN;
  // Remove pontos (separadores de milhar) e converte vírgula decimal
  return parseFloat(str.replace(/\./g, '').replace(',', '.'));
}

function formatForDisplay(n) {
  if (n == null || isNaN(n) || n === 0) return '';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
}

function NumericInput({ number, onChange, placeholder = '0', className = '', ...rest }) {
  const [str, setStr] = useState(() => number ? formatForDisplay(number) : '');

  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9,.]/g, '');
    setStr(raw);
    const parsed = parseFromDisplay(raw);
    if (!isNaN(parsed)) onChange(parsed);
  };

  const handleBlur = () => {
    const parsed = parseFromDisplay(str);
    if (isNaN(parsed) || parsed === 0) { setStr(''); onChange(0); }
    else { setStr(formatForDisplay(parsed)); onChange(parsed); }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={str}
      placeholder={placeholder}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`bg-transparent text-sm text-white text-right outline-none placeholder-white/15 ${className}`}
      style={{ fontVariantNumeric: 'tabular-nums' }}
      {...rest}
    />
  );
}

// ─── InputRow ─────────────────────────────────────────────────────────────────
function InputRow({ label, number, onChange, suffix, prefix, hint }) {
  return (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div>
        <span className="text-xs text-white/40 font-light">{label}</span>
        {hint && <p className="text-[0.6rem] text-white/20 font-light mt-0.5">{hint}</p>}
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-4">
        {prefix && <span className="text-xs text-white/25">{prefix}</span>}
        <NumericInput number={number} onChange={onChange} className="w-20" />
        {suffix && <span className="text-xs text-white/25 w-12 text-left shrink-0">{suffix}</span>}
      </div>
    </div>
  );
}

// ─── Ícone do cenário ─────────────────────────────────────────────────────────
function CenarioIcon({ tipo, subtipo }) {
  const s = { color: '#00BFA5' };
  if (tipo === 'onibus')    return <Bus  size={16} style={s} />;
  if (tipo === 'uberCarro') return <Zap  size={16} style={s} />;
  if (tipo === 'uberMoto')  return <Zap  size={16} style={s} />;
  if (tipo === 'veiculo')   return subtipo === 'carro'
    ? <Car  size={16} style={s} />
    : <Bike size={16} style={s} />;
  return null;
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-10 h-5 rounded-full transition-all duration-300 shrink-0"
      style={{
        background: checked ? 'rgba(0,191,165,0.45)' : 'rgba(255,255,255,0.1)',
        border:     `1px solid ${checked ? 'rgba(0,191,165,0.65)' : 'rgba(255,255,255,0.15)'}`,
      }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300"
        style={{
          background: checked ? '#00BFA5' : 'rgba(255,255,255,0.3)',
          left:       checked ? 'calc(100% - 18px)' : '1px',
          boxShadow:  checked ? '0 0 6px rgba(0,191,165,0.6)' : 'none',
        }}
      />
    </button>
  );
}

// ─── Card de cenário ───────────────────────────────────────────────────────────
function CenarioCard({ cenario, onChange }) {
  const [expandido,   setExpandido]   = useState(true);
  const [showFixos,   setShowFixos]   = useState(false);

  const upd    = (field, value) => onChange({ ...cenario, [field]: value });
  const updNum = (field)        => (value) => upd(field, value);
  // Para campos que chegam em % (ex: 1.5) e devem ser guardados em decimal (0.015)
  const updPct = (field)        => (value) => upd(field, value / 100);

  return (
    <div
      className="rounded-2xl overflow-hidden mb-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header do card */}
      <button
        onClick={() => setExpandido(e => !e)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(0,191,165,0.1)', border: '1px solid rgba(0,191,165,0.18)' }}
        >
          <CenarioIcon tipo={cenario.tipo} subtipo={cenario.subtipo} />
        </div>
        <span className="text-sm font-medium text-white flex-1">{cenario.nome}</span>
        <ChevronDown
          size={15}
          style={{
            color:     'rgba(255,255,255,0.25)',
            transform: expandido ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
          }}
        />
      </button>

      {/* Corpo do card */}
      {expandido && (
        <div className="px-4 pb-4">

          {/* ── Ônibus ──────────────────────────────────────────────────── */}
          {cenario.tipo === 'onibus' && (
            <>
              <InputRow
                label="Valor da tarifa"
                prefix="R$"
                number={cenario.tarifa}
                onChange={updNum('tarifa')}
                hint="SLZ: R$ 4,00"
              />
              <InputRow
                label="Viagens por mês"
                suffix="viagens"
                number={cenario.tripsPorMes}
                onChange={updNum('tripsPorMes')}
                hint="22 dias úteis × 2 (ida+volta) = 44"
              />
            </>
          )}

          {/* ── Uber Carro / Uber Moto ───────────────────────────────────── */}
          {(cenario.tipo === 'uberCarro' || cenario.tipo === 'uberMoto') && (
            <>
              <InputRow
                label="Custo médio por km"
                prefix="R$"
                suffix="/km"
                number={cenario.custoPorKm}
                onChange={updNum('custoPorKm')}
                hint={cenario.tipo === 'uberCarro' ? 'SLZ: ~R$ 2,20/km' : 'SLZ: ~R$ 1,30/km'}
              />
            </>
          )}

          {/* ── Veículo próprio ──────────────────────────────────────────── */}
          {cenario.tipo === 'veiculo' && (
            <>
              {/* Obrigatórios */}
              <InputRow
                label="Valor do veículo"
                prefix="R$"
                number={cenario.valor}
                onChange={updNum('valor')}
                hint={cenario.subtipo === 'carro' ? 'ex: popular SLZ ~R$ 75.000' : 'ex: CG 160 SLZ ~R$ 14.000'}
              />
              <InputRow
                label="Consumo"
                suffix="km/l"
                number={cenario.consumo}
                onChange={updNum('consumo')}
                hint={cenario.subtipo === 'carro' ? 'carro popular: ~12 km/l' : 'moto popular: ~35 km/l'}
              />
              <InputRow
                label="Preço do combustível"
                prefix="R$"
                suffix="/litro"
                number={cenario.combustivel}
                onChange={updNum('combustivel')}
                hint="gasolina SLZ: ~R$ 5,89"
              />

              {/* Custos fixos opcionais (toggle) */}
              <button
                onClick={() => setShowFixos(s => !s)}
                className="flex items-center gap-1.5 text-xs mt-4 mb-1 transition-opacity hover:opacity-80"
                style={{ color: showFixos ? '#00BFA5' : 'rgba(255,255,255,0.3)' }}
              >
                <ChevronDown
                  size={12}
                  style={{
                    transform:  showFixos ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
                Custos fixos opcionais (IPVA, seguro…)
              </button>

              {showFixos && (
                <div className="mt-1">
                  <InputRow
                    label="IPVA"
                    suffix="%/ano"
                    number={parseFloat((cenario.ipvaRate * 100).toFixed(3))}
                    onChange={updPct('ipvaRate')}
                    hint={cenario.subtipo === 'carro' ? 'MA: 2,5% carros' : 'MA: 1% motos'}
                  />
                  <InputRow
                    label="Licenciamento"
                    prefix="R$"
                    suffix="/ano"
                    number={cenario.licenciamento}
                    onChange={updNum('licenciamento')}
                    hint="MA: ~R$ 120 (carro) / R$ 80 (moto)"
                  />
                  <InputRow
                    label="Manutenção"
                    prefix="R$"
                    suffix="/mês"
                    number={cenario.manutencao}
                    onChange={updNum('manutencao')}
                  />
                  <InputRow
                    label="Seguro"
                    prefix="R$"
                    suffix="/ano"
                    number={cenario.seguro}
                    onChange={updNum('seguro')}
                  />
                  <InputRow
                    label="Depreciação"
                    suffix="%/ano"
                    number={parseFloat((cenario.depreciacaoRate * 100).toFixed(1))}
                    onChange={updPct('depreciacaoRate')}
                    hint="inclusa no custo mensal total"
                  />
                </div>
              )}

              {/* Financiamento */}
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs text-white/50 font-light">Financiar veículo?</span>
                    {cenario.financiar && (
                      <p className="text-[0.6rem] text-white/20 mt-0.5 font-light">
                        Tabela Price — prestação fixa
                      </p>
                    )}
                  </div>
                  <Toggle
                    checked={cenario.financiar}
                    onChange={(v) => upd('financiar', v)}
                  />
                </div>

                {cenario.financiar && (
                  <div>
                    <InputRow
                      label="Entrada"
                      prefix="R$"
                      number={cenario.entrada}
                      onChange={updNum('entrada')}
                    />
                    <InputRow
                      label="Prazo"
                      suffix="meses"
                      number={cenario.prazo}
                      onChange={(v) => upd('prazo', Math.round(v))}
                    />
                    <InputRow
                      label="Taxa de juros"
                      suffix="%/mês"
                      number={cenario.jurosMensal}
                      onChange={updNum('jurosMensal')}
                      hint="média do mercado: 1,5% – 2,5%"
                    />
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
}

// ─── Step principal ───────────────────────────────────────────────────────────
export default function Step3Custos({ data, onNext, onBack }) {
  const [cenarios, setCenarios] = useState(data.cenarios ?? []);

  const updateCenario = (updated) => {
    setCenarios(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-5 md:px-6 pt-20 pb-12">
      <div className="w-full max-w-lg mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-xs font-medium tracking-widest uppercase text-white/25 mb-2">
            Passo 3 de 4
          </p>
          <h2 className="text-2xl sm:text-3xl font-light text-white mb-2 leading-tight">
            <span className="shimmer-teal font-semibold">Parâmetros</span> de cálculo
          </h2>
          <p className="text-sm font-light text-white/35">
            Ajuste os valores de cada tipo de transporte para a sua realidade.
          </p>
        </motion.div>

        {/* Cards de cenários */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {cenarios.map((cenario) => (
            <CenarioCard key={cenario.id} cenario={cenario} onChange={updateCenario} />
          ))}
        </motion.div>

        {/* Navegação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex gap-3"
        >
          <button onClick={onBack} className="glass-btn flex items-center gap-2 text-sm font-light">
            <ArrowLeft size={16} />
            Voltar
          </button>
          <button
            onClick={() => onNext({ cenarios })}
            className="glass-btn glass-btn-primary flex-1 flex items-center justify-center gap-2 text-sm font-medium"
          >
            Resultado
            <ArrowRight size={16} />
          </button>
        </motion.div>

      </div>
    </div>
  );
}
