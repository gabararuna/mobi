import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { formatBRL, getDepreciacaoRate, estimarConsumoFipe } from '../utils/calculations';

const FIPE_BASE = 'https://parallelum.com.br/fipe/api/v1';

async function fipeGet(path) {
  const r = await fetch(`${FIPE_BASE}${path}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function parseFipeValor(str) {
  return parseFloat(
    (str || '0').replace('R$', '').trim().replace(/\./g, '').replace(',', '.')
  );
}

// ─── Lista de itens filtrada e rolável ───────────────────────────────────────
function ItemList({ items, onSelect, keyField = 'codigo', labelField = 'nome', max = 100 }) {
  const visible = items.slice(0, max);
  if (visible.length === 0) {
    return <p className="text-xs text-white/20 text-center py-4">Nenhum resultado</p>;
  }
  return (
    <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1">
      {visible.map(item => (
        <button
          key={item[keyField]}
          onClick={() => onSelect(item)}
          className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-150"
          style={{ color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.025)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,191,165,0.07)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
        >
          {item[labelField]}
        </button>
      ))}
    </div>
  );
}

// ─── Input de busca ───────────────────────────────────────────────────────────
function SearchInput({ inputRef, value, onChange, placeholder }) {
  return (
    <div className="relative mb-3">
      <Search
        size={12}
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'rgba(255,255,255,0.2)' }}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm text-white outline-none placeholder-white/20"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        autoFocus
      />
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
/**
 * @param {{ subtipo: 'carro'|'moto', onConfirm: Function, onManual: Function, onCancel: Function }} props
 * onConfirm(vehicleData) — chamado com os dados FIPE + defaults São Luís
 * onManual()             — usuário escolhe adicionar sem FIPE
 * onCancel()             — fecha o painel
 */
export default function FipeSearch({ subtipo, onConfirm, onManual, onCancel }) {
  const tipo = subtipo === 'carro' ? 'carros' : 'motos';

  const [phase, setPhase]       = useState('brand');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const [brands, setBrands]     = useState([]);
  const [brandQ, setBrandQ]     = useState('');
  const [brand, setBrand]       = useState(null);

  const [models, setModels]     = useState([]);
  const [modelQ, setModelQ]     = useState('');
  const [model, setModel]       = useState(null);

  const [anos, setAnos]         = useState([]);
  const [fipe, setFipe]         = useState(null);

  const inputRef = useRef(null);

  // Carrega marcas ao montar
  useEffect(() => {
    setLoading(true);
    fipeGet(`/${tipo}/marcas`)
      .then(d => { setBrands(d); setLoading(false); })
      .catch(() => { setError('Sem conexão com a API FIPE. Use o modo manual.'); setLoading(false); });
  }, [tipo]);

  // Foca no input ao mudar de fase
  useEffect(() => { inputRef.current?.focus(); }, [phase]);

  const filteredBrands = brands.filter(b =>
    b.nome.toLowerCase().includes(brandQ.toLowerCase())
  );
  const filteredModels = models.filter(m =>
    m.nome.toLowerCase().includes(modelQ.toLowerCase())
  );

  async function selectBrand(b) {
    setBrand(b);
    setLoading(true);
    setError(null);
    try {
      const d = await fipeGet(`/${tipo}/marcas/${b.codigo}/modelos`);
      setModels(d.modelos);
      setPhase('model');
    } catch { setError('Erro ao carregar modelos.'); }
    finally   { setLoading(false); }
  }

  async function selectModel(m) {
    setModel(m);
    setLoading(true);
    setError(null);
    try {
      const d = await fipeGet(`/${tipo}/marcas/${brand.codigo}/modelos/${m.codigo}/anos`);
      // Normaliza o código FIPE "32000" que representa veículo "0 km" (Zero KM)
      const anosNorm = d.map(a => ({
        ...a,
        nome: a.nome.replace(/^32000\b/, 'Veículo Novo'),
      }));
      setAnos(anosNorm);
      setPhase('year');
    } catch { setError('Erro ao carregar anos.'); }
    finally   { setLoading(false); }
  }

  async function selectAno(a) {
    setLoading(true);
    setError(null);
    try {
      const d = await fipeGet(`/${tipo}/marcas/${brand.codigo}/modelos/${model.codigo}/anos/${a.codigo}`);
      setFipe(d);
      setPhase('confirm');
    } catch { setError('Erro ao carregar preço FIPE.'); }
    finally   { setLoading(false); }
  }

  function goBack() {
    setError(null);
    if (phase === 'model')   { setPhase('brand'); setModel(null); setModelQ(''); }
    if (phase === 'year')    { setPhase('model'); setAnos([]); }
    if (phase === 'confirm') { setPhase('year'); setFipe(null); }
  }

  function calcIpvaRate(subtipo, modeloNome, anoModelo) {
    // MA: motos até 170cc → isentas
    if (subtipo === 'moto') {
      const n = (modeloNome || '').toUpperCase();
      if (/\b(50|75|100|110|115|125|150|155|160|165|170)\b/.test(n)) return 0;
      return 0.01;
    }
    // MA: carros com mais de 15 anos → isentos
    const idade = new Date().getFullYear() - anoModelo;
    if (idade > 15) return 0;
    return 0.025;
  }

  function confirm() {
    const valor           = parseFipeValor(fipe.Valor);
    const anoModelo       = fipe.AnoModelo;
    const depreciacaoRate = getDepreciacaoRate(anoModelo);
    const isCarro         = subtipo === 'carro';
    const consumoEstimado = estimarConsumoFipe(fipe.Modelo, subtipo);
    const ipvaRate        = calcIpvaRate(subtipo, fipe.Modelo, anoModelo);

    onConfirm({
      nome:           `${fipe.Marca} ${fipe.Modelo}`.slice(0, 45),
      anoModelo,
      codigoFipe:     fipe.CodigoFipe,
      fipeValor:      fipe.Valor,
      valor,
      depreciacaoRate,
      // defaults ajustáveis no Step3 (referências São Luís - MA)
      consumo:         consumoEstimado,
      combustivel:     5.89,
      ipvaRate,
      licenciamento:   isCarro ? 120   : 80,
      manutencao:      isCarro ? 300   : 120,
      seguro:          isCarro ? 2_200 : 700,
      financiar:       false,
      entrada:         0,
      prazo:           60,
      jurosMensal:     1.99,
    });
  }

  // ─── Títulos de fase ─────────────────────────────────────────────────────
  const phaseTitle = {
    brand:   `Selecione a marca`,
    model:   brand?.nome ?? '',
    year:    (model?.nome ?? '').slice(0, 32),
    confirm: 'Confirmar veículo',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl p-4 mb-3"
      style={{ background: 'rgba(0,191,165,0.04)', border: '1px solid rgba(0,191,165,0.2)' }}
    >
      {/* ── Cabeçalho ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4">
        {phase !== 'brand' && (
          <button
            onClick={goBack}
            className="w-6 h-6 flex items-center justify-center shrink-0"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[0.6rem] text-white/20 uppercase tracking-widest font-medium">
            FIPE — {subtipo === 'carro' ? 'Automóveis' : 'Motocicletas'}
          </p>
          <p className="text-xs text-white/55 truncate">{phaseTitle[phase]}</p>
        </div>
        <button onClick={onCancel} style={{ color: 'rgba(255,255,255,0.2)' }}>
          <X size={14} />
        </button>
      </div>

      {/* ── Erro ───────────────────────────────────────────────────────── */}
      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl mb-3"
          style={{ background: 'rgba(255,80,80,0.07)', border: '1px solid rgba(255,80,80,0.15)' }}
        >
          <AlertCircle size={13} style={{ color: 'rgba(255,120,120,0.7)' }} />
          <span className="text-xs text-white/35">{error}</span>
        </div>
      )}

      {/* ── Loading ────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin" style={{ color: '#00BFA5' }} />
        </div>
      )}

      {/* ── Fase: Marca ───────────────────────────────────────────────── */}
      {!loading && phase === 'brand' && (
        <>
          <SearchInput
            inputRef={inputRef}
            value={brandQ}
            onChange={setBrandQ}
            placeholder="Buscar marca..."
          />
          <ItemList items={filteredBrands} onSelect={selectBrand} />
        </>
      )}

      {/* ── Fase: Modelo ──────────────────────────────────────────────── */}
      {!loading && phase === 'model' && (
        <>
          <SearchInput
            inputRef={inputRef}
            value={modelQ}
            onChange={setModelQ}
            placeholder="Buscar modelo..."
          />
          <ItemList items={filteredModels} onSelect={selectModel} />
        </>
      )}

      {/* ── Fase: Ano ─────────────────────────────────────────────────── */}
      {!loading && phase === 'year' && (
        <ItemList items={anos} onSelect={selectAno} />
      )}

      {/* ── Fase: Confirmar ───────────────────────────────────────────── */}
      {!loading && phase === 'confirm' && fipe && (() => {
        const valor           = parseFipeValor(fipe.Valor);
        const ipvaRate        = calcIpvaRate(subtipo, fipe.Modelo, fipe.AnoModelo);
        const depreciacaoRate = getDepreciacaoRate(fipe.AnoModelo);
        const ipvaMensal      = (valor * ipvaRate) / 12;
        const depMensal       = (valor * depreciacaoRate) / 12;
        const idadeVei        = new Date().getFullYear() - fipe.AnoModelo;
        const consumoEst      = estimarConsumoFipe(fipe.Modelo, subtipo);
        const ipvaIsento      = ipvaRate === 0;

        return (
          <>
            <div
              className="p-4 rounded-xl mb-4"
              style={{ background: 'rgba(0,191,165,0.07)', border: '1px solid rgba(0,191,165,0.2)' }}
            >
              {/* Nome e metadados */}
              <p className="text-sm font-medium text-white leading-snug mb-0.5">
                {fipe.Marca} {fipe.Modelo}
              </p>
              <p className="text-xs text-white/35 mb-3">
                {fipe.AnoModelo} · {fipe.Combustivel} · Cód. {fipe.CodigoFipe}
              </p>

              {/* Valor FIPE */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40">Valor FIPE</span>
                <span className="text-lg font-semibold" style={{ color: '#00BFA5' }}>
                  {fipe.Valor}
                </span>
              </div>

              {/* Auto-calculados */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.6rem' }}>
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-white/30">
                    IPVA ({ipvaIsento ? 'isento' : `${(ipvaRate * 100).toFixed(1)}%/ano`} · MA)
                  </span>
                  <span className="text-xs font-medium" style={{ color: ipvaIsento ? 'rgba(0,191,165,0.7)' : 'rgba(255,255,255,0.6)' }}>
                    {ipvaIsento ? 'R$ 0' : `${formatBRL(ipvaMensal)}/mês`}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-white/30">
                    Depreciação ({(depreciacaoRate * 100).toFixed(0)}%/ano
                    · {idadeVei <= 0 ? '0 km' : `${idadeVei} ano${idadeVei > 1 ? 's' : ''}`})
                  </span>
                  <span className="text-xs font-medium text-white/60">{formatBRL(depMensal)}/mês</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-white/30">
                    Consumo estimado (INMETRO)
                  </span>
                  <span className="text-xs font-medium text-white/60">
                    {consumoEst >= 999 ? '— elétrico' : `${consumoEst} km/l`}
                  </span>
                </div>
              </div>

              <p className="text-[0.6rem] text-white/18 mt-3 font-light">
                Todos os valores são ajustáveis no próximo passo.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onManual}
                className="flex-1 px-3 py-2.5 rounded-xl text-xs transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)' }}
              >
                Ajustar valores manualmente
              </button>
              <button
                onClick={confirm}
                className="flex-1 px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                style={{ background: 'rgba(0,191,165,0.18)', border: '1px solid rgba(0,191,165,0.35)', color: '#00BFA5' }}
              >
                <Check size={12} />
                Confirmar
              </button>
            </div>
          </>
        );
      })()}

      {/* ── Link manual (fases que não são confirm) ───────────────────── */}
      {!loading && phase !== 'confirm' && (
        <div
          className="mt-3 pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <button
            onClick={onManual}
            className="text-xs transition-colors"
            style={{ color: 'rgba(255,255,255,0.18)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.18)'; }}
          >
            Adicionar {subtipo} manualmente sem busca FIPE →
          </button>
        </div>
      )}
    </motion.div>
  );
}
