import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Bus, Car, Bike, Plus, X, Zap } from 'lucide-react';
import FipeSearch from '../FipeSearch';

// Referências: São Luís - MA
const FIXED_MODAIS = [
  {
    id:        'onibus',
    tipo:      'onibus',
    nome:      'Ônibus',
    descricao: 'Transporte Público',
    Icon:      Bus,
    defaults:  { tarifa: 4.0, tripsPorMes: 44 },
  },
  {
    id:        'uberCarro',
    tipo:      'uberCarro',
    nome:      'Aplicativo Carro',
    descricao: 'Corridas Privadas de Carro',
    Icon:      Zap,
    defaults:  { custoPorKm: 2.20 },
  },
  {
    id:        'uberMoto',
    tipo:      'uberMoto',
    nome:      'Aplicativo Moto',
    descricao: 'Corridas Privadas de Moto',
    Icon:      Zap,
    defaults:  { custoPorKm: 1.30 },
  },
];

let _uid = 1;
function uid() { return `v_${_uid++}_${Date.now()}`; }

// Defaults manuais para São Luís - MA (sem busca FIPE)
function veiculoDefault(subtipo) {
  const isCarro = subtipo === 'carro';
  return {
    id:              uid(),
    tipo:            'veiculo',
    subtipo,
    nome:            isCarro ? 'Meu Carro' : 'Minha Moto',
    valor:           isCarro ? 75_000 : 14_000,
    consumo:         isCarro ? 12     : 35,
    combustivel:     5.89,
    ipvaRate:        isCarro ? 0.025  : 0.01,
    licenciamento:   isCarro ? 120    : 80,
    manutencao:      isCarro ? 300    : 120,
    seguro:          isCarro ? 2_200  : 700,
    depreciacaoRate: isCarro ? 0.12   : 0.10,
    financiar:       false,
    entrada:         0,
    prazo:           60,
    jurosMensal:     1.99,
  };
}

export default function Step2Modais({ data, onNext, onBack }) {
  const [cenarios, setCenarios] = useState(() => data.cenarios ?? []);

  // null = fechado; 'carro' | 'moto' = buscando FIPE para esse subtipo
  const [fipeOpen, setFipeOpen] = useState(null);

  // ── Modais fixos (toggle) ──────────────────────────────────────────────────
  const isSelected = (id) => cenarios.some(c => c.id === id);

  const toggleFixed = (modal) => {
    if (isSelected(modal.id)) {
      setCenarios(prev => prev.filter(c => c.id !== modal.id));
    } else {
      setCenarios(prev => [...prev, { id: modal.id, tipo: modal.tipo, nome: modal.nome, ...modal.defaults }]);
    }
  };

  // ── Veículos próprios (FIPE) ───────────────────────────────────────────────
  const handleFipeConfirm = (vehicleData) => {
    setCenarios(prev => [
      ...prev,
      { id: uid(), tipo: 'veiculo', subtipo: fipeOpen, ...vehicleData },
    ]);
    setFipeOpen(null);
  };

  const handleFipeManual = () => {
    setCenarios(prev => [...prev, veiculoDefault(fipeOpen)]);
    setFipeOpen(null);
  };

  const removeVeiculo = (id) => setCenarios(prev => prev.filter(c => c.id !== id));

  const renameVeiculo = (id, nome) =>
    setCenarios(prev => prev.map(c => c.id === id ? { ...c, nome } : c));

  const veiculos = cenarios.filter(c => c.tipo === 'veiculo');
  const isValid  = cenarios.length >= 2;

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
            Passo 2 de 4
          </p>
          <h2 className="text-2xl sm:text-3xl font-light text-white mb-2 leading-tight">
            Selecione os <span className="shimmer-teal font-semibold">cenários</span>
          </h2>
          <p className="text-sm font-light text-white/35">
            Escolha pelo menos 2 opções. Veículos próprios são buscados na tabela FIPE para
            valores, IPVA e depreciação precisos.
          </p>
        </motion.div>

        {/* Modais fixos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <p className="text-xs text-white/25 font-medium tracking-wide uppercase mb-3">
            Transporte Público & Apps
          </p>
          <div className="grid grid-cols-3 gap-2">
            {FIXED_MODAIS.map(({ id, nome, descricao, Icon, ...rest }) => {
              const selected = isSelected(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleFixed({ id, nome, descricao, Icon, ...rest })}
                  className="p-3.5 rounded-2xl text-left transition-all duration-300 flex flex-col gap-2.5"
                  style={{
                    background: selected ? 'rgba(0,191,165,0.1)'  : 'rgba(255,255,255,0.03)',
                    border:     `1px solid ${selected ? 'rgba(0,191,165,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow:  selected ? '0 4px 20px rgba(0,191,165,0.12)' : 'none',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: selected ? 'rgba(0,191,165,0.2)' : 'rgba(255,255,255,0.06)' }}
                  >
                    <Icon size={15} style={{ color: selected ? '#00BFA5' : 'rgba(255,255,255,0.4)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: selected ? 'white' : 'rgba(255,255,255,0.65)' }}>
                      {nome}
                    </p>
                    <p className="text-[0.6rem] text-white/25 font-light mt-0.5">{descricao}</p>
                  </div>
                  {selected && (
                    <div
                      className="w-1.5 h-1.5 rounded-full self-end ml-auto"
                      style={{ background: '#00BFA5', boxShadow: '0 0 5px rgba(0,191,165,0.7)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Veículos próprios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          {/* Header da seção */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/25 font-medium tracking-wide uppercase">
              Veículo Próprio
            </p>
            {!fipeOpen && (
              <div className="flex gap-1.5">
                <button
                  onClick={() => setFipeOpen('carro')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.45)' }}
                >
                  <Plus size={11} />
                  <Car size={11} />
                  Carro
                </button>
                <button
                  onClick={() => setFipeOpen('moto')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.45)' }}
                >
                  <Plus size={11} />
                  <Bike size={11} />
                  Moto
                </button>
              </div>
            )}
          </div>

          {/* Painel de busca FIPE */}
          <AnimatePresence>
            {fipeOpen && (
              <FipeSearch
                key={fipeOpen}
                subtipo={fipeOpen}
                onConfirm={handleFipeConfirm}
                onManual={handleFipeManual}
                onCancel={() => setFipeOpen(null)}
              />
            )}
          </AnimatePresence>

          {/* Lista de veículos adicionados */}
          <AnimatePresence>
            {veiculos.map(v => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 p-3 rounded-xl mb-2"
                style={{ background: 'rgba(0,191,165,0.06)', border: '1px solid rgba(0,191,165,0.18)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(0,191,165,0.15)' }}
                >
                  {v.subtipo === 'carro'
                    ? <Car  size={14} style={{ color: '#00BFA5' }} />
                    : <Bike size={14} style={{ color: '#00BFA5' }} />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={v.nome}
                    onChange={e => renameVeiculo(v.id, e.target.value)}
                    className="w-full bg-transparent text-sm text-white outline-none"
                    placeholder="Nome do veículo"
                  />
                  {v.codigoFipe && (
                    <p className="text-[0.6rem] text-white/25 font-light mt-0.5">
                      FIPE {v.codigoFipe} · {v.fipeValor} · {v.anoModelo}
                    </p>
                  )}
                  {!v.codigoFipe && (
                    <p className="text-[0.6rem] text-white/20 font-light mt-0.5">
                      Manual · ajuste os valores no próximo passo
                    </p>
                  )}
                </div>

                <button
                  onClick={() => removeVeiculo(v.id)}
                  className="w-6 h-6 flex items-center justify-center shrink-0"
                  style={{ color: 'rgba(255,255,255,0.2)' }}
                >
                  <X size={13} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Estado vazio */}
          {veiculos.length === 0 && !fipeOpen && (
            <div
              className="p-4 rounded-xl text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)' }}
            >
              <p className="text-xs text-white/18 font-light">
                Clique em + Carro ou + Moto para buscar na tabela FIPE
              </p>
            </div>
          )}
        </motion.div>

        {/* Hint mínimo 2 */}
        <AnimatePresence>
          {!isValid && cenarios.length > 0 && !fipeOpen && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-white/18 text-center mb-5"
            >
              Selecione pelo menos 2 opções para comparar
            </motion.p>
          )}
        </AnimatePresence>

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
            onClick={() => isValid && !fipeOpen && onNext({ cenarios })}
            disabled={!isValid || !!fipeOpen}
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
