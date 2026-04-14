/**
 * Motor de cálculo financeiro do Mobi.
 * Todas as funções são puras (sem side-effects) para facilitar testes.
 */

// ─── Utilitários de tempo ────────────────────────────────────────────────────

/** Retorna o número médio de dias úteis por mês com base nos dias/semana */
export function calcularDiasPorMes(diasPorSemana) {
  // 365 dias / 12 meses / 7 dias por semana × diasPorSemana
  return diasPorSemana * (365 / 12 / 7);
}

/** Retorna o km médio percorrido por mês */
export function calcularKmMensal(kmPorDia, diasPorSemana) {
  return kmPorDia * calcularDiasPorMes(diasPorSemana);
}

// ─── Financiamento (Tabela Price) ────────────────────────────────────────────

/**
 * Calcula a parcela mensal fixa pelo sistema Price.
 * PMT = PV × [i × (1+i)^n] / [(1+i)^n - 1]
 *
 * @param {number} valorFinanciado - Valor do bem menos a entrada (R$)
 * @param {number} taxaMensal      - Taxa de juros mensal em decimal (ex: 0.0199)
 * @param {number} prazoMeses      - Número de parcelas
 * @returns {number} Valor da parcela mensal
 */
export function calcularParcelaPrice(valorFinanciado, taxaMensal, prazoMeses) {
  if (valorFinanciado <= 0 || prazoMeses <= 0) return 0;
  if (taxaMensal <= 0) return valorFinanciado / prazoMeses;
  const fator = Math.pow(1 + taxaMensal, prazoMeses);
  return valorFinanciado * (taxaMensal * fator) / (fator - 1);
}

/** Total pago no financiamento (parcela × prazo) */
export function calcularTotalFinanciado(parcela, prazo) {
  return parcela * prazo;
}

/** Custo total de juros (total pago menos o valor financiado) */
export function calcularCustoJuros(valorFinanciado, parcela, prazo) {
  return Math.max(0, calcularTotalFinanciado(parcela, prazo) - valorFinanciado);
}

// ─── Consumo estimado (base INMETRO) ─────────────────────────────────────────

/**
 * Estima o consumo médio em km/l com base no nome do modelo FIPE.
 * Heurística por cilindrada / palavras-chave — usuário pode ajustar no Step3.
 */
export function estimarConsumoFipe(modeloNome, subtipo) {
  const n = (modeloNome || '').toUpperCase();

  if (subtipo === 'moto') {
    // Cilindrada pela presença de números no nome
    if (/\b(50|75|100|110|115|125)\b/.test(n)) return 45;
    if (/\b(150|155|160|165|170)\b/.test(n))   return 37;
    if (/\b(200|205|250|270|300)\b/.test(n))   return 27;
    if (/\b(400|450|500|600|650)\b/.test(n))   return 22;
    if (/\b(750|800|850|900|1000|1100|1200|1300|1800)\b/.test(n)) return 17;
    return 32;
  }

  // ── Carros ──
  if (/HYBRID|H[IÍ]BRIDO|PLUG.?IN|PHEV/.test(n)) return 22;
  if (/EV\b|ELÉTRI|ELECTRI/.test(n)) return 999; // elétrico — combustível = 0

  // Turbo reduz eficiência versus aspirado da mesma cilindrada
  const turbo = /TURBO|TSI|TDI|TFSI|TGDI|GTI|GTS|GTD/.test(n);

  if (/\b1\.0\b/.test(n)) return turbo ? 13 : 15;
  if (/\b1\.3\b/.test(n)) return turbo ? 12 : 14;
  if (/\b1\.4\b/.test(n)) return turbo ? 12 : 13;
  if (/\b1\.5\b/.test(n)) return turbo ? 12 : 13;
  if (/\b1\.6\b/.test(n)) return turbo ? 11 : 13;
  if (/\b1\.8\b/.test(n)) return turbo ? 11 : 12;
  if (/\b2\.0\b/.test(n)) return turbo ? 10 : 11;
  if (/\b2\.4\b|\b2\.5\b/.test(n)) return turbo ?  9 : 10;
  if (/\b3\.0\b|\b3\.2\b|\b3\.5\b/.test(n)) return turbo ?  8 :  9;
  if (/\b4\.0\b|\b4\.2\b|\b4\.4\b|\b5\.\d\b|\b6\.\d\b/.test(n)) return 7;

  return 11; // fallback
}

// ─── Depreciação ─────────────────────────────────────────────────────────────

/**
 * Retorna a taxa anual de depreciação estimada com base na idade do veículo.
 * Fonte: tabela histórica FIPE + médias de mercado BR.
 */
export function getDepreciacaoRate(anoModelo) {
  const idade = new Date().getFullYear() - anoModelo;
  if (idade <= 0) return 0.20; // 0 km / lançamento
  if (idade === 1) return 0.15;
  if (idade <= 3) return 0.12;
  if (idade <= 6) return 0.10;
  return 0.07;
}

// ─── Cálculo de custo por cenário ────────────────────────────────────────────

/**
 * Calcula o custo mensal detalhado de um cenário de transporte.
 *
 * @param {Object} cenario  - Objeto do cenário (tipo + parâmetros)
 * @param {number} kmMensal - Km por mês calculado dos hábitos
 * @returns {Object} { total, fixo, variavel, parcela, depreciacao, breakdown }
 */
export function calcularCustoCenario(cenario, kmMensal) {
  switch (cenario.tipo) {

    case 'onibus': {
      const tarifa      = cenario.tarifa      ?? 4.0;
      const tripsPorMes = cenario.tripsPorMes ?? 44;
      const custo       = tarifa * tripsPorMes;
      return {
        total:       custo,
        fixo:        0,
        variavel:    custo,
        parcela:     0,
        depreciacao: 0,
        breakdown: {
          passagem: { label: 'Passagens', valor: custo },
        },
      };
    }

    case 'uberCarro':
    case 'uberMoto': {
      const custoPorKm = cenario.custoPorKm ?? (cenario.tipo === 'uberCarro' ? 2.50 : 1.50);
      const custo      = custoPorKm * kmMensal;
      return {
        total:       custo,
        fixo:        0,
        variavel:    custo,
        parcela:     0,
        depreciacao: 0,
        breakdown: {
          corridas: {
            label: cenario.tipo === 'uberCarro' ? 'Corridas (carro)' : 'Corridas (moto)',
            valor: custo,
          },
        },
      };
    }

    case 'veiculo': {
      const valor            = cenario.valor           ?? 0;
      const consumo          = cenario.consumo         ?? 12;
      const combustivel      = cenario.combustivel     ?? 6.0;
      const ipvaRate         = cenario.ipvaRate        ?? 0;
      const licenciamento    = cenario.licenciamento   ?? 0;   // R$/ano
      const manutencao       = cenario.manutencao      ?? 0;   // R$/mês
      const seguro           = cenario.seguro          ?? 0;   // R$/ano
      const depreciacaoRate  = cenario.depreciacaoRate ?? 0;   // decimal/ano

      // Custo variável: combustível
      const custoCombustivel = consumo > 0 ? (kmMensal / consumo) * combustivel : 0;

      // Custos fixos anuais rateados mensalmente
      const ipvaMensal            = (valor * ipvaRate) / 12;
      const licenciamentoMensal   = licenciamento / 12;
      const seguroMensal          = seguro / 12;
      const manutencaoMensal      = manutencao; // já é mensal

      // Depreciação: custo econômico real incluído no total mensal
      const depreciacaoMensal     = (valor * depreciacaoRate) / 12;

      // Financiamento (Tabela Price)
      let parcela = 0;
      if (cenario.financiar) {
        const entrada     = cenario.entrada     ?? 0;
        const prazo       = cenario.prazo       ?? 60;
        const jurosMensal = cenario.jurosMensal ?? 1.99; // % ao mês
        const pv          = Math.max(0, valor - entrada);
        parcela = calcularParcelaPrice(pv, jurosMensal / 100, prazo);
      }

      const fixo  = parcela + ipvaMensal + licenciamentoMensal + seguroMensal + manutencaoMensal;
      // Inclui depreciação — é um custo real que reduz o patrimônio mensalmente
      const total = fixo + custoCombustivel + depreciacaoMensal;

      return {
        total,
        fixo,
        variavel:    custoCombustivel,
        parcela,
        depreciacao: depreciacaoMensal,
        breakdown: {
          ...(parcela > 0          && { parcela:        { label: 'Parcela financ.',    valor: parcela } }),
          ...(ipvaMensal > 0       && { ipva:           { label: 'IPVA',               valor: ipvaMensal } }),
          ...(licenciamentoMensal > 0 && { licenciamento: { label: 'Licenciamento',    valor: licenciamentoMensal } }),
          ...(seguroMensal > 0     && { seguro:         { label: 'Seguro',             valor: seguroMensal } }),
          ...(manutencaoMensal > 0 && { manutencao:     { label: 'Manutenção',         valor: manutencaoMensal } }),
          combustivel:               { label: 'Combustível',             valor: custoCombustivel },
          ...(depreciacaoMensal > 0 && { depreciacao:   { label: 'Depreciação',         valor: depreciacaoMensal } }),
        },
      };
    }

    default:
      return { total: 0, fixo: 0, variavel: 0, parcela: 0, depreciacao: 0, breakdown: {} };
  }
}

// ─── Formatação ──────────────────────────────────────────────────────────────

/** Formata valor em BRL */
export function formatBRL(value, decimals = 0) {
  const v = Number(value);
  if (isNaN(v)) return 'R$ —';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v);
}

/** Formata número com separador de milhar */
export function formatNumber(value, decimals = 0) {
  const v = Number(value);
  if (isNaN(v)) return '—';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v);
}
