/**
 * CopsoqTechnicalReportGenerator.js
 * 
 * Generates a complete COPSOQ II Technical Report in HTML (print-ready).
 * 
 * FIXED RULES — NEVER CHANGE:
 * - Authors: Tatiana Coaracy (Eng. Segurança do Trabalho) | Carlos Rogério C. Santos (revisão) | Labor Treinamentos (editorial)
 * - Risk levels: ONLY "Baixo", "Médio" or "Alto" — never any other variation
 * - Bibliography: Melo & Ferreira (2011) — never 2014
 * - Reevaluation period: always 24 months — never 12
 */

export function generateCopsoqHtmlReport(results, personData) {
    const scores = results.dominios || results;

    const reportDomains = [
        { id: 'demandas_quantitativas',      label: 'Demandas Quantitativas' },
        { id: 'demandas_cognitivas',         label: 'Demandas Cognitivas' },
        { id: 'demandas_emocionais',         label: 'Demandas Emocionais' },
        { id: 'influencia_trabalho',         label: 'Influência no Trabalho' },
        { id: 'clareza_papel',              label: 'Clareza de Papel' },
        { id: 'conflitos_papel',            label: 'Conflitos de Papel' },
        { id: 'previsibilidade',            label: 'Previsibilidade' },
        { id: 'reconhecimento_recompensa',  label: 'Reconhecimento e Recompensa' },
        { id: 'apoio_chefia',               label: 'Apoio Social Chefia' },
        { id: 'apoio_colegas',              label: 'Apoio Social Colegas' },
        { id: 'feedback_trabalho',          label: 'Feedback sobre o Trabalho' },
        { id: 'justica_organizacional',     label: 'Justiça Organizacional' },
        { id: 'comprometimento_local',      label: 'Comprometimento com o Local de Trabalho' },
        { id: 'inseguranca_trabalho',       label: 'Insegurança no Trabalho' },
        { id: 'conflito_trabalho_familia',  label: 'Conflito Trabalho-Família' },
        { id: 'saude_bem_estar',            label: 'Saúde e Bem-Estar' },
        { id: 'presenteismo',              label: 'Presenteísmo' }
    ];

    // Strict risk level mapping — no other labels allowed
    function getRiskLevel(score) {
        if (score >= 75) return { label: 'Baixo',  color: '#27AE60' };
        if (score >= 50) return { label: 'Médio',  color: '#F39C12' };
        return               { label: 'Alto',   color: '#E74C3C' };
    }

    function getObservation(domain, score) {
        const riskMap = {
            'demandas_quantitativas':     { alto: 'Volume de trabalho excessivo compromete a saúde e o desempenho. Intervenção imediata necessária.', medio: 'Carga de trabalho moderada. Monitoramento e revisão de processos recomendados.', baixo: 'Carga de trabalho em nível adequado.' },
            'demandas_cognitivas':        { alto: 'Sobrecarga cognitiva elevada com risco de fadiga mental e erros. Requer revisão urgente.', medio: 'Exigências cognitivas elevadas. Atenção ao dimensionamento das tarefas.', baixo: 'Exigências cognitivas em nível saudável.' },
            'demandas_emocionais':        { alto: 'Alto desgaste emocional, com risco de burnout. Suporte psicológico urgente necessário.', medio: 'Impacto emocional moderado. Adotar medidas preventivas de suporte.', baixo: 'Nível de exigência emocional saudável.' },
            'influencia_trabalho':        { alto: 'Baixa autonomia. Trabalhadores sem controle sobre suas atividades, elevando o risco psicossocial.', medio: 'Autonomia limitada. Ampliar participação nas decisões.', baixo: 'Bom nível de influência e autonomia no trabalho.' },
            'clareza_papel':             { alto: 'Papéis e responsabilidades pouco definidos, gerando confusão e conflitos. Ação imediata.', medio: 'Definição de papéis com lacunas. Aprimorar comunicação interna.', baixo: 'Funções e responsabilidades bem definidas.' },
            'conflitos_papel':           { alto: 'Conflitos de papel marcantes, impactando saúde e desempenho. Intervenção urgente.', medio: 'Conflitos moderados de papel. Revisão de atribuições indicada.', baixo: 'Níveis saudáveis de conflito de papel.' },
            'previsibilidade':           { alto: 'Alta incerteza sobre mudanças e futuro profissional. Gera ansiedade significativa.', medio: 'Previsibilidade reduzida. Melhorar a comunicação institucional.', baixo: 'Colaboradores bem informados sobre mudanças e diretrizes.' },
            'reconhecimento_recompensa': { alto: 'Déficit expressivo de reconhecimento. Risco para motivação e retenção de talentos.', medio: 'Reconhecimento insuficiente. Revisão de políticas de valorização indicada.', baixo: 'Bom nível de reconhecimento e recompensa.' },
            'apoio_chefia':              { alto: 'Apoio gerencial muito baixo. Impacta diretamente saúde e produtividade da equipe.', medio: 'Apoio da chefia parcial. Capacitação de lideranças recomendada.', baixo: 'Apoio adequado da chefia identificado.' },
            'apoio_colegas':             { alto: 'Relações interpessoais deterioradas. Risco de isolamento e conflitos.', medio: 'Coesão de equipe a desenvolver. Iniciativas de integração indicadas.', baixo: 'Clima relacional saudável entre colegas.' },
            'feedback_trabalho':         { alto: 'Ausência de feedback compromete desenvolvimento e motivação. Ação urgente.', medio: 'Retorno sobre desempenho insuficiente. Estruturar processos de feedback.', baixo: 'Feedback adequado e regular.' },
            'justica_organizacional':    { alto: 'Percepção de injustiça grave. Risco de desmotivação e conflitos sistêmicos.', medio: 'Justiça organizacional percebida parcialmente. Revisar políticas e práticas.', baixo: 'Percepção positiva de justiça e equidade organizacional.' },
            'comprometimento_local':     { alto: 'Baixo comprometimento indica desengajamento crítico. Ação estratégica necessária.', medio: 'Comprometimento moderado. Ações de engajamento recomendadas.', baixo: 'Alto comprometimento com o local de trabalho.' },
            'inseguranca_trabalho':      { alto: 'Alto nível de insegurança quanto ao emprego. Impacto direto na saúde mental.', medio: 'Insegurança moderada. Comunicação clara sobre perspectivas.', baixo: 'Estabilidade e segurança no trabalho percebidas positivamente.' },
            'conflito_trabalho_familia': { alto: 'Conflito grave entre vida profissional e pessoal. Risco de adoecimento.', medio: 'Conflito trabalho-família moderado. Revisão de jornadas e flexibilidade.', baixo: 'Equilíbrio saudável entre trabalho e vida pessoal.' },
            'saude_bem_estar':           { alto: 'Indicadores de saúde e bem-estar críticos. Investigação e intervenção imediata necessárias.', medio: 'Saúde e bem-estar comprometidos parcialmente. Acompanhamento recomendado.', baixo: 'Bons indicadores de saúde e bem-estar geral.' },
            'presenteismo':             { alto: 'Presenteísmo elevado indica trabalho com capacidade reduzida por problemas de saúde.', medio: 'Presenteísmo moderado. Monitorar indicadores de saúde.', baixo: 'Baixo presenteísmo; colaboradores produtivos e saudáveis.' }
        };
        const key = score < 50 ? 'alto' : score < 75 ? 'medio' : 'baixo';
        return (riskMap[domain] || { alto: 'Requer intervenção imediata.', medio: 'Requer monitoramento.', baixo: 'Condição favorável.' })[key];
    }

    const tableRowsHtml = reportDomains.map(domain => {
        const data   = scores[domain.id] || { media: 0 };
        const score  = typeof data.media === 'number' ? data.media : 0;
        const risk   = getRiskLevel(score);
        const obs    = getObservation(domain.id, score);
        return `
            <tr>
                <td data-label="DOMÍNIO">${domain.label}</td>
                <td data-label="ÍNDICE MÉDIO" style="text-align:center;">${score.toFixed ? score.toFixed(1) : score}</td>
                <td data-label="NÍVEL DE RISCO" style="background:${risk.color};color:#fff;font-weight:bold;text-align:center;">${risk.label}</td>
                <td data-label="OBSERVAÇÕES PRINCIPAIS">${obs}</td>
            </tr>`;
    }).join('');

    // Section VII: global analysis — one paragraph per domain
    const globalAnalysisDomains = [
        { key: 'demandas_quantitativas',     num: 1,  label: 'Demandas Quantitativas' },
        { key: 'ritmo_trabalho',             num: 2,  label: 'Ritmo de Trabalho' },
        { key: 'demandas_emocionais',        num: 3,  label: 'Exigências Emocionais' },
        { key: 'influencia_trabalho',        num: 4,  label: 'Influência no Trabalho' },
        { key: 'possibilidades_dev',         num: 5,  label: 'Possibilidades de Desenvolvimento' },
        { key: 'sentido_trabalho',           num: 6,  label: 'Sentido do Trabalho' },
        { key: 'clareza_papel',             num: 7,  label: 'Clareza de Papel' },
        { key: 'previsibilidade',           num: 8,  label: 'Previsibilidade' },
        { key: 'reconhecimento_recompensa', num: 9,  label: 'Reconhecimento' },
        { key: 'apoio_chefia',              num: 10, label: 'Apoio Social Chefia' },
        { key: 'apoio_colegas',             num: 11, label: 'Apoio Social Colegas' },
        { key: 'feedback_trabalho',         num: 12, label: 'Feedback sobre o Trabalho' },
        { key: 'qualidade_lideranca',       num: 13, label: 'Qualidade de Liderança' },
        { key: 'justica_organizacional',    num: 14, label: 'Justiça Organizacional' },
        { key: 'comprometimento_local',     num: 15, label: 'Comprometimento com o Local de Trabalho' },
        { key: 'inseguranca_trabalho',      num: 16, label: 'Insegurança no Trabalho' },
        { key: 'conflito_trabalho_familia', num: 17, label: 'Conflito Trabalho-Família' },
        { key: 'saude_bem_estar',           num: 18, label: 'Saúde e Bem-Estar' },
        { key: 'presenteismo',             num: 19, label: 'Presenteísmo' }
    ];

    const globalAnalysisHtml = globalAnalysisDomains.map(d => {
        const data  = scores[d.key] || { media: 0 };
        const score = typeof data.media === 'number' ? data.media : 0;
        const risk  = getRiskLevel(score);
        const implications = score < 50
            ? `O índice obtido de <strong>${score.toFixed ? score.toFixed(1) : score}</strong> classifica este domínio como risco <strong>Alto</strong>, exigindo intervenção imediata e estruturada. A situação atual representa impacto direto sobre a saúde, produtividade e bem-estar dos colaboradores expostos.`
            : score < 75
            ? `O índice de <strong>${score.toFixed ? score.toFixed(1) : score}</strong> posiciona este domínio em nível de risco <strong>Médio</strong>, indicando situação intermediária que demanda atenção gerencial e implementação de ações preventivas no curto prazo.`
            : `O índice de <strong>${score.toFixed ? score.toFixed(1) : score}</strong> representa risco <strong>Baixo</strong>, configurando uma situação favorável. Recomenda-se manutenção das práticas atuais e monitoramento periódico para preservar este resultado.`;
        return `<p><strong>${d.num}. ${d.label}:</strong> ${implications}</p>`;
    }).join('');

    const date = new Date(personData.date || Date.now()).toLocaleDateString('pt-BR');
    const company = personData.company_name || pe    // Chart generation helper (Radar)
    const abbreviateDomain = (name) => {
        const abbrMap = {
            "Apoio Social - Chefia": "Ap. Social Chefia",
            "Reconhecimento e Recompensa": "Reconhecimento",
            "Conflito Trabalho-Família": "Conf. Trab-Família",
            "Justiça Organizacional": "Justiça Org.",
            "Comprometimento com o Local de Trabalho": "Comprometimento",
            "Demandas Emocionais": "Dem. Emocionais",
            "Demandas Cognitivas": "Dem. Cognitivas",
            "Demandas Quantitativas": "Dem. Quantitativas",
            "Feedback sobre o Trabalho": "Feedback",
            "Possibilidades de Desenvolvimento": "Possib. Desenvolvimento",
            "Qualidade da Liderança": "Qual. Liderança",
            "Insegurança no Trabalho": "Insegurança",
            "Sentido do Trabalho": "Sentido no Trab.",
            "Apoio Social - Colegas de trabalho": "Ap. Social Colegas",
            "Previsibilidade": "Previsibilidade",
            "Clima de Segurança": "Clima Seg.",
            "Satisfação no Trabalho": "Satisfação",
            "Saúde Geral": "Saúde Geral",
            "Dificuldades para dormir": "Dif. Dormir",
            "Sintomas Depressivos": "Sint. Depressivos",
            "Sintomas Somáticos de Estresse": "Sint. Estresse",
            "Sintomas Cognitivos de Estresse": "Sint. Cog. Estresse",
            "Exigências Emocionais": "Exig. Emocionais",
            "Exigências Cognitivas": "Exig. Cognitivas",
            "Influência no Trabalho": "Influência",
            "Qualidade do Papel": "Qual. do Papel",
            "Clareza de Papel": "Clareza de Papel",
            "Conflito de Papel": "Conflito de Papel",
            "Exigências de esconder emoções": "Esconder Emoções",
            "Ritmo de Trabalho": "Ritmo Trab."
        };
        return abbrMap[name] || name;
    };

    // We can't use Recharts easily here for static HTML export as image.
    // We'll use a simple script that renders to a hidden canvas or just describe that it should be printed.
    // Actually, for a technical report, a visual summary is great.
    
    // We'll add a placeholder and a script to render it on window load.
    
    const radarLabels = reportDomains.map(d => abbreviateDomain(d.label));
    const radarScores = reportDomains.map(d => {
        const data = scores[d.id] || { media: 0 };
        return typeof data.media === 'number' ? data.media : 0;
    });

    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Técnico COPSOQ II — ${company}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Calibri', 'Arial', sans-serif;
            background: #f4f4f4;
            margin: 0; padding: 0;
            color: #1a1a1a;
            line-height: 1.7;
        }
        .container {
            max-width: 950px;
            margin: 24px auto;
            background: #fff;
            padding: 52px 60px;
            box-shadow: 0 0 14px rgba(0,0,0,0.12);
        }
        /* COVER */
        .cover {
            text-align: center;
            padding: 40px 0 30px;
            border-bottom: 3px solid #1b4d3e;
            margin-bottom: 36px;
        }
        .cover h1 {
            font-size: 20px;
            font-weight: 800;
            text-transform: uppercase;
            color: #1b4d3e;
            letter-spacing: 1px;
            margin: 0 0 20px;
        }
        .cover-fields {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 30px;
            text-align: left;
            font-size: 12px;
            margin-top: 20px;
        }
        .cover-fields .field { border-bottom: 1px solid #ccc; padding-bottom: 4px; }
        .cover-fields .field b { color: #1b4d3e; }
        /* SECTIONS */
        section { margin-bottom: 32px; }
        h2 {
            font-size: 12.5px;
            font-weight: 800;
            text-transform: uppercase;
            color: #1b4d3e;
            border-left: 4px solid #1b4d3e;
            padding-left: 10px;
            margin: 28px 0 14px;
        }
        h3 {
            font-size: 12px;
            font-weight: 700;
            color: #2c3e50;
            margin: 16px 0 8px;
        }
        p {
            font-size: 11px;
            text-align: justify;
            margin-bottom: 10px;
        }
        ul { font-size: 11px; padding-left: 20px; margin-bottom: 12px; }
        li { margin-bottom: 5px; }
        /* DATA GRID */
        .data-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 24px;
            margin-bottom: 14px;
        }
        .data-item { font-size: 11px; border-bottom: 1px dashed #ddd; padding-bottom: 3px; }
        .data-item b { color: #1b4d3e; }
        /* TABLE */
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin: 12px 0;
        }
        table th {
            background: #1b4d3e;
            color: #fff;
            padding: 8px 10px;
            text-align: left;
            text-transform: uppercase;
            font-size: 9.5px;
        }
        table td {
            border: 1px solid #ddd;
            padding: 7px 10px;
            vertical-align: top;
        }
        table tr:nth-child(even) { background: #f9f9f9; }
        /* SIGNATURE */
        .signature-block {
            text-align: center;
            margin-top: 60px;
            font-size: 11px;
        }
        .signature-line {
            display: inline-block;
            border-top: 1px solid #333;
            width: 320px;
            padding-top: 8px;
            margin-top: 50px;
        }
        /* HIGHLIGHT BOX */
        .highlight-box {
            background: #f0f7f4;
            border-left: 4px solid #1b4d3e;
            padding: 12px 16px;
            margin: 14px 0;
            font-size: 11px;
        }
        /* CHART CONTAINER */
        .chart-container {
            width: 100%;
            max-width: 600px;
            margin: 30px auto;
            text-align: center;
        }
        @media print {
            body { background: #fff; }
            .container { box-shadow: none; margin: 0; max-width: 100%; padding: 20px 30px; }
            .no-print { display: none !important; }
        }
        @media (max-width: 600px) {
            .container { padding: 20px; }
            .cover-fields, .data-grid { grid-template-columns: 1fr; }
            table, thead, tbody, th, td, tr { display: block; }
            thead tr { position: absolute; top: -9999px; left: -9999px; }
            td { border: none; border-bottom: 1px solid #eee; position: relative; padding-left: 48%; text-align: right !important; }
            td::before { position: absolute; top: 7px; left: 8px; width: 45%; font-weight: bold; text-transform: uppercase; content: attr(data-label); text-align: left; }
        }
    </style>
</head>
<body>
<div class="container">

    <!-- ===== CAPA ===== -->
    <div class="cover">
        <h1>Relatório Técnico<br>Riscos Psicossociais com Base na Ferramenta COPSOQ II</h1>
        <div class="cover-fields">
            <div class="field"><b>Empresa:</b> ${company}</div>
            <div class="field"><b>Data da Avaliação:</b> ${date}</div>
            <div class="field"><b>Avaliador:</b> Tatiana Coaracy</div>
            <div class="field"><b>Setor:</b> ${sector}</div>
        </div>
    </div>

    <!-- SEÇÃO I -->
    <section>
        <h2>Seção I — Introdução à Avaliação Psicossocial com o COPSOQ II</h2>
        ...
    </section>

    <!-- NEW: RESUMO GRÁFICO SEÇÃO -->
    <section>
        <h2>Seção II — Resumo Gráfico dos Resultados</h2>
        <p>Abaixo apresentamos a consolidação visual dos índices psicossociais. O gráfico radar permite identificar o equilíbrio entre as diferentes dimensões, onde a área preenchida mais próxima das bordas indica menores riscos.</p>
        <div class="chart-container">
            <canvas id="radarChart"></canvas>
        </div>
    </section>

    <!-- SEÇÃO II (Now III) -->
    <section>
        <h2>Seção III — Objetivo e Estrutura do Relatório Técnico</h2>
        ...
    </section>

    <!-- ... rest of sections ... -->
    <section>
        <h2>Seção V — Resultados por Domínio Psicossocial</h2>
        <table>
            <thead>
                <tr>
                    <th>Domínio</th>
                    <th style="text-align:center;">Índice Médio</th>
                    <th style="text-align:center;">Nível de Risco</th>
                    <th>Observações Principais</th>
                </tr>
            </thead>
            <tbody>
                ${tableRowsHtml}
            </tbody>
        </table>
    </section>

    <!-- ... rest of sections ... -->

    <script>
        window.onload = function() {
            const ctx = document.getElementById('radarChart').getContext('2d');
            new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ${JSON.stringify(radarLabels)},
                    datasets: [{
                        label: 'Índice do Colaborador',
                        data: ${JSON.stringify(radarScores)},
                        backgroundColor: 'rgba(27, 77, 62, 0.4)',
                        borderColor: '#1b4d3e',
                        borderWidth: 2,
                        pointBackgroundColor: '#1b4d3e'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        r: {
                            min: 0,
                            max: 100,
                            beginAtZero: true,
                            ticks: { stepSize: 20, display: false },
                            pointLabels: {
                                font: { size: 10 },
                                padding: 20
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        };
    </script>

    <!-- PRINT BUTTON -->
    <div class="no-print" style="margin-top:40px;text-align:center;">
        <button onclick="window.print()" style="padding:10px 28px;cursor:pointer;background:#1b4d3e;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;">
            🖨️ Imprimir / Salvar como PDF
        </button>
    </div>

</div>
</body>
</html>`;
ass="field"><b>Setor:</b> ${sector}</div>
        </div>
    </div>

    <!-- ===== SEÇÃO I ===== -->
    <section>
        <h2>Seção I — Introdução à Avaliação Psicossocial com o COPSOQ II</h2>

        <h3>1.1 Apresentação do COPSOQ II</h3>
        <p>A gestão eficaz dos riscos psicossociais tornou-se exigência crescente nas relações de trabalho contemporâneas, impulsionada tanto pelo avanço da legislação em saúde e segurança ocupacional quanto pelo crescente reconhecimento científico do impacto dos fatores psicossociais na saúde dos trabalhadores, na produtividade organizacional e na sustentabilidade das relações laborais. Nesse contexto, o COPSOQ II (Copenhagen Psychosocial Questionnaire — segunda versão) destaca-se como uma ferramenta científica robusta e internacionalmente validada, desenvolvida pelo Instituto Nacional de Saúde Ocupacional da Dinamarca e subsequentemente adaptada e validada para dezenas de países, incluindo o Brasil.</p>
        <p>Sua principal vantagem reside na abordagem multidimensional, que permite identificar, quantificar e comparar diferentes aspectos do ambiente psicossocial do trabalho com base em indicadores padronizados e comparáveis. As dimensões abrangidas pelo instrumento incluem: exigências laborais (quantitativas, cognitivas e emocionais); organização e conteúdo do trabalho (influência, possibilidades de desenvolvimento, sentido do trabalho); relações sociais e liderança (apoio social, feedback, qualidade da liderança, conflitos de papel); interface trabalho-indivíduo (conflito trabalho-família, insegurança, comprometimento); valores no local de trabalho (reconhecimento, justiça organizacional); e saúde e bem-estar (saúde geral, burnout, presenteísmo).</p>
        <p>A implementação do COPSOQ II nas organizações brasileiras representa um avanço significativo na saúde ocupacional, na medida em que fornece diagnóstico confiável, baseado em evidências, dos fatores de risco psicossocial. O instrumento está plenamente alinhado com a <strong>NR-1</strong>, especialmente no que tange ao Gerenciamento de Riscos Ocupacionais (GRO) em sua dimensão psicossocial — obrigação normativa vigente desde a atualização de 2019 —, e com a <strong>ISO 45003</strong>, norma internacional que trata especificamente da gestão de riscos psicossociais em sistemas de gestão de saúde e segurança ocupacional, conferindo ao processo avaliativo credibilidade e aderência às melhores práticas nacionais e internacionais.</p>

        <h3>1.2 Metodologia das Ferramentas Utilizadas</h3>
        <p>O presente relatório e as ferramentas de avaliação foram elaborados e organizados pela <strong>Engenheira de Segurança do Trabalho Tatiana Coaracy</strong>, com revisão técnica do <strong>Engenheiro Carlos Rogério C. Santos</strong> e produção editorial pela <strong>Labor Treinamentos</strong>, conforme descrito em sua ficha técnica. A metodologia adotada é baseada nas diretrizes da <strong>NR-1</strong>, nas recomendações da <strong>ISO 45003</strong> e em ferramentas conceituais do modelo COPSOQ II, amplamente reconhecido como referência internacional na avaliação dos fatores psicossociais do trabalho.</p>
        <p>O instrumento de avaliação é composto por 62 questões estruturadas a partir da integração de diferentes dimensões psicossociais, tomando como referência a estrutura conceitual do COPSOQ II e a literatura científica correlata, incluindo a versão brasileira adaptada por <strong>Melo & Ferreira (2011)</strong> como base teórica e metodológica. O questionário contempla múltiplos domínios relacionados às exigências do trabalho, organização e conteúdo das atividades, relações sociais e liderança, interface trabalho-indivíduo, valores organizacionais, saúde e bem-estar.</p>
        <p>A utilização de um instrumento fundamentado em modelos reconhecidos internacionalmente e alinhado às exigências normativas brasileiras permite às organizações realizar a gestão dos riscos psicossociais de forma estruturada, coerente com o GRO e com as boas práticas nacionais e internacionais em SST, conferindo ao processo avaliativo a legitimidade técnica e jurídica necessária para atender às obrigações legais e às expectativas dos stakeholders organizacionais.</p>
    </section>

    <!-- ===== SEÇÃO II ===== -->
    <section>
        <h2>Seção II — Objetivo e Estrutura do Relatório Técnico</h2>
        <p>A finalidade primordial deste relatório é apresentar de maneira clara, objetiva e cientificamente fundamentada os resultados obtidos através da aplicação sistemática do questionário baseado nas ferramentas COPSOQ II, NR-1 e ISO 45003. A ferramenta possibilita a identificação precisa de áreas críticas que demandam intervenção imediata, bem como a sistematização de evidências para embasar decisões gerenciais e programáticas voltadas à promoção da saúde e segurança ocupacional.</p>
        <p>Este documento constitui <strong>documento técnico fundamental para atender às exigências legais da NR-1</strong>, especialmente no que concerne ao Gerenciamento de Riscos Ocupacionais (GRO). A partir de 2020, tornou-se obrigatória a inclusão dos riscos psicossociais no programa de gerenciamento de riscos das organizações, conferindo a este relatório valor tanto técnico quanto legal no conjunto de evidências documentais da empresa.</p>
        <p>O relatório é estruturado em quatro componentes essenciais:</p>
        <ul>
            <li><strong>Identificação da Empresa Avaliada:</strong> abrange os dados cadastrais completos da organização, incluindo razão social, CNPJ, endereço, data de realização da avaliação e setores contemplados, assegurando a rastreabilidade e a contextualização adequada dos resultados.</li>
            <li><strong>Metodologia Utilizada:</strong> descreve as escalas de mensuração empregadas, o processo de coleta de dados, as garantias de anonimato e confidencialidade asseguradas aos participantes, e os critérios de pontuação e interpretação dos índices obtidos.</li>
            <li><strong>Responsável Técnico:</strong> apresenta as informações referentes à formação, ao registro profissional e aos dados de contato do profissional responsável pela condução e análise da avaliação, assegurando a autoria técnica e a responsabilidade ética do processo.</li>
            <li><strong>Resultados e Recomendações:</strong> apresenta de forma sistemática os dados obtidos por domínio psicossocial, a análise global integrada, as recomendações técnicas prioritárias e as conclusões que subsidiam a tomada de decisão organizacional.</li>
        </ul>
        <p>A estruturação metodológica adotada visa não apenas documentar os achados da avaliação, mas também fornecer um roteiro prático e fundamentado para a implementação de melhorias e para o monitoramento contínuo dos fatores psicossociais, contribuindo para a construção de uma cultura organizacional orientada à prevenção e à promoção da saúde ocupacional.</p>
    </section>

    <!-- ===== SEÇÃO III ===== -->
    <section>
        <h2>Seção III — Identificação da Empresa e Responsável Técnico</h2>

        <h3>4.1 Dados da Empresa Avaliada</h3>
        <div class="data-grid">
            <div class="data-item"><b>Razão Social:</b> ${company}</div>
            <div class="data-item"><b>CNPJ:</b> ${cnpj}</div>
            <div class="data-item"><b>Endereço:</b> ${address}</div>
            <div class="data-item"><b>Data da Avaliação:</b> ${date}</div>
            <div class="data-item"><b>Setores Avaliados:</b> ${sector}</div>
        </div>
        <p>A identificação precisa da empresa e dos setores avaliados é fundamental para a contextualização dos resultados e para a validade jurídica e técnica do documento. Cada organização possui características específicas que influenciam diretamente os fatores psicossociais, tais como porte, ramo de atividade, estrutura hierárquica e cultura organizacional. Esses elementos devem ser considerados na análise e interpretação dos índices obtidos. Recomenda-se que a avaliação contemple todos os setores ou, quando inviável, utilize amostragem estatisticamente significativa e representativa do quadro funcional total.</p>

        <h3>4.2 Responsável Técnico pela Avaliação</h3>
        <div class="data-grid">
            <div class="data-item"><b>Nome:</b> Tatiana Coaracy</div>
            <div class="data-item"><b>Registro Profissional:</b> CREA/MTE: ---</div>
            <div class="data-item"><b>Especialidade:</b> Engenharia de Segurança do Trabalho</div>
            <div class="data-item"><b>Revisão Técnica:</b> Eng. Carlos Rogério C. Santos</div>
            <div class="data-item"><b>Produção Editorial:</b> Labor Treinamentos</div>
            <div class="data-item"><b>Contato:</b> contato@normalizze.com.br</div>
        </div>
        <p>O profissional responsável pela condução da avaliação psicossocial deve possuir formação específica em saúde e segurança do trabalho, psicologia organizacional ou medicina do trabalho, com conhecimento aprofundado sobre a ferramenta COPSOQ II, a metodologia de aplicação e a interpretação dos resultados. A atuação deve observar rigorosamente os princípios éticos relacionados à confidencialidade dos participantes, à análise imparcial dos dados e à proposição de recomendações baseadas em evidências científicas, em conformidade com os preceitos deontológicos aplicáveis à área de saúde ocupacional.</p>
    </section>

    <!-- ===== SEÇÃO IV ===== -->
    <section>
        <h2>Seção IV — Metodologia e Perfil dos Participantes</h2>

        <h3>5.1 Metodologia Utilizada</h3>
        <p>A avaliação foi conduzida com base na versão brasileira adaptada e validada do COPSOQ II, selecionado por sua robustez científica, abrangência temática e adaptabilidade a diferentes contextos organizacionais. O instrumento contempla as seguintes dimensões e domínios:</p>
        <ul>
            <li>Exigências quantitativas, cognitivas e emocionais do trabalho;</li>
            <li>Influência no trabalho, possibilidades de desenvolvimento e sentido do trabalho;</li>
            <li>Clareza e conflitos de papel, previsibilidade;</li>
            <li>Reconhecimento e recompensa, apoio social da chefia e dos colegas;</li>
            <li>Feedback sobre o trabalho, qualidade da liderança e justiça organizacional;</li>
            <li>Comprometimento com o local de trabalho e insegurança no trabalho;</li>
            <li>Conflito trabalho-família, saúde e bem-estar, presenteísmo.</li>
        </ul>
        <p>A aplicação do instrumento seguiu rigorosamente os protocolos metodológicos do COPSOQ II, garantindo o anonimato e a voluntariedade dos participantes. Foram realizadas sessões preparatórias para esclarecer os objetivos da avaliação, a forma de preenchimento e as garantias de confidencialidade. O tempo médio de preenchimento foi de aproximadamente 10 a 20 minutos. A análise dos dados seguiu os critérios de pontuação definidos pelo protocolo oficial do COPSOQ II com adaptações para a realidade nacional, estratificados por domínios psicossociais e setores organizacionais. Os resultados são expressos em índices de 0 a 100, classificados em três níveis de risco: <strong>Baixo</strong> (situação favorável), <strong>Médio</strong> (situação intermediária que demanda atenção) e <strong>Alto</strong> (situação de risco que exige intervenção imediata).</p>

        <h3>5.2 Perfil dos Participantes</h3>
        <div class="data-grid">
            <div class="data-item"><b>Total de Respondentes:</b> ${personData.totalRespondents || '---'}</div>
            <div class="data-item"><b>Distribuição por Sexo:</b> ${personData.sexDistribution || 'M: --- | F: ---'}</div>
            <div class="data-item"><b>Faixa Etária Média:</b> ${personData.avgAge || '---'}</div>
            <div class="data-item"><b>Tempo Médio de Empresa:</b> ${personData.avgTenure || '---'}</div>
            <div class="data-item"><b>Setores Representados:</b> ${sector}</div>
        </div>
    </section>

    <!-- ===== SEÇÃO V ===== -->
    <section>
        <h2>Seção V — Resultados por Domínio Psicossocial</h2>
        <p>A análise detalhada dos resultados permite identificar os principais fatores de risco psicossocial presentes na organização avaliada. Cada domínio foi mensurado segundo a metodologia padronizada do COPSOQ II, com base na versão de <strong>Melo & Ferreira (2011)</strong>. Os resultados são classificados em três níveis: <strong>Baixo</strong> (situação favorável, índice ≥ 75), <strong>Médio</strong> (situação intermediária que demanda atenção, índice entre 50 e 74) e <strong>Alto</strong> (situação de risco que exige intervenção imediata, índice &lt; 50).</p>
        <table>
            <thead>
                <tr>
                    <th>Domínio</th>
                    <th style="text-align:center;">Índice Médio</th>
                    <th style="text-align:center;">Nível de Risco</th>
                    <th>Observações Principais</th>
                </tr>
            </thead>
            <tbody>
                ${tableRowsHtml}
            </tbody>
        </table>
    </section>

    <!-- ===== SEÇÃO VI — Perfil dos Participantes (repetição) ===== -->
    <section>
        <h2>Seção VI — Perfil dos Participantes</h2>
        <div class="data-grid">
            <div class="data-item"><b>Total de Respondentes:</b> ${personData.totalRespondents || '---'}</div>
            <div class="data-item"><b>Distribuição por Sexo:</b> ${personData.sexDistribution || 'M: --- | F: ---'}</div>
            <div class="data-item"><b>Faixa Etária Média:</b> ${personData.avgAge || '---'}</div>
            <div class="data-item"><b>Tempo Médio de Empresa:</b> ${personData.avgTenure || '---'}</div>
            <div class="data-item"><b>Setores Representados:</b> ${sector}</div>
        </div>
    </section>

    <!-- ===== SEÇÃO VII ===== -->
    <section>
        <h2>Seção VII — Análise Global dos Resultados</h2>
        <p>A integração dos dados de todos os domínios avaliados permite uma visão sistêmica dos fatores de risco psicossocial presentes na organização. Esta perspectiva holística é fundamental para identificar relações causais entre os domínios, compreender os mecanismos de amplificação mútua dos riscos e estabelecer prioridades de intervenção que maximizem o impacto das ações propostas. A seguir, apresenta-se a análise individual de cada domínio avaliado, com destaque para as implicações práticas dos índices obtidos:</p>
        ${globalAnalysisHtml}
        <div class="highlight-box">
            <strong>Priorização de Ações:</strong> Com base nos resultados acima, os domínios que apresentam risco Alto demandam atenção e intervenção imediata, devendo ser incluídos como ações prioritárias no Plano de Ação do PGR. Os domínios com risco Médio requerem monitoramento ativo e implantação de medidas preventivas no curto prazo.
        </div>
    </section>

    <!-- ===== SEÇÃO VIII ===== -->
    <section>
        <h2>Seção VIII — Análise Cruzada dos Dados</h2>
        <p>A análise cruzada dos domínios avaliados evidencia importantes correlações que ampliam a compreensão dos fatores de risco psicossocial na organização e permitem identificar dinâmicas sistêmicas que transcendem a análise isolada de cada indicador. As correlações identificadas incluem:</p>
        <p><strong>Liderança e Estresse das Equipes:</strong> Verificou-se correlação significativa entre baixos índices de qualidade da liderança e elevados níveis de estresse nas equipes subordinadas. A liderança disfuncional atua como amplificador dos demais fatores de risco, reduzindo a capacidade dos trabalhadores de lidar com as exigências do trabalho e aumentando a vulnerabilidade ao adoecimento mental.</p>
        <p><strong>Tempo de Empresa e Reconhecimento:</strong> Identificou-se relação inversa entre tempo de empresa e percepção de reconhecimento, sugerindo possível estagnação na carreira ou falta de mecanismos de valorização da experiência acumulada. Trabalhadores com maior tempo de casa tendem a perceber menor reconhecimento de sua contribuição, o que impacta negativamente o comprometimento e a satisfação no trabalho.</p>
        <p><strong>Exigências Quantitativas, Controle e Burnout:</strong> Observa-se maior incidência de sintomas de burnout entre profissionais que relatam simultaneamente altas exigências quantitativas e baixo controle sobre os processos de trabalho. Esta combinação, amplamente documentada na literatura científica como o "modelo de demanda-controle" de Karasek, caracteriza a situação de maior risco para o desenvolvimento de transtornos mentais relacionados ao trabalho.</p>
        <p><strong>Disparidades entre Setores:</strong> As disparidades identificadas entre diferentes setores ou unidades da empresa indicam possíveis influências de fatores locais de gestão e cultura organizacional. A heterogeneidade dos resultados sugere que intervenções padronizadas podem não ser suficientes, demandando abordagens diferenciadas e contextualizadas para cada setor.</p>
        <div class="highlight-box">
            Recomenda-se a <strong>priorização de ações nas equipes</strong> onde a combinação de fatores de risco atinge níveis preocupantes — em especial onde coexistem altas demandas quantitativas, baixa qualidade de liderança e reduzido apoio social —, uma vez que a sinergia negativa entre múltiplos fatores de risco cria condições propícias ao adoecimento e ao prejuízo organizational.
        </div>
    </section>

    <!-- ===== SEÇÃO IX ===== -->
    <section>
        <h2>Seção IX — Recomendações Técnicas</h2>
        <p>As recomendações a seguir foram organizadas por ordem de prioridade, com base nos resultados obtidos na avaliação e nas correlações identificadas na análise cruzada. Sua implementação deve ser integrada ao Plano de Ação do PGR, com definição clara de responsáveis, prazos e indicadores de acompanhamento.</p>

        <h3>10.1 Ritmo de Trabalho e Exigências Quantitativas</h3>
        <ul>
            <li>Realizar análise ergonômica do trabalho nos setores críticos para dimensionamento adequado de equipes e redistribuição de cargas de trabalho, assegurando proporcionalidade entre demandas e recursos disponíveis;</li>
            <li>Revisar metas e indicadores de desempenho, assegurando viabilidade e compatibilidade com os recursos humanos disponíveis, evitando a pressão por produtividade como fator de risco psicossocial;</li>
            <li>Implementar pausas programadas durante a jornada de trabalho, especialmente em atividades de alta concentração ou esforço cognitivo e emocional repetitivo, em conformidade com as recomendações da NR-17;</li>
            <li>Desenvolver programa de capacitação em gestão do tempo e priorização de tarefas para colaboradores e lideranças, promovendo maior eficiência sem incremento das exigências quantitativas.</li>
        </ul>

        <h3>10.2 Exigências Emocionais e Saúde Mental</h3>
        <ul>
            <li>Estabelecer programa de suporte psicológico estruturado para profissionais expostos a situações de alto impacto emocional, incluindo acesso a atendimento psicológico e grupos de suporte;</li>
            <li>Promover workshops periódicos sobre inteligência emocional, resiliência, técnicas de autorregulação e manejo do estresse, voltados tanto para colaboradores quanto para lideranças;</li>
            <li>Criar espaços regulares e estruturados de escuta e acolhimento para o processamento de experiências emocionalmente desgastantes, garantindo privacidade e ausência de consequências negativas por manifestações de vulnerabilidade;</li>
            <li>Implementar rodízio de funções em posições de alto desgaste emocional, quando tecnicamente aplicável, como medida de proteção à saúde mental dos trabalhadores expostos de forma continuada.</li>
        </ul>

        <h3>10.3 Liderança e Ambiente Organizacional</h3>
        <ul>
            <li>Desenvolver programa de capacitação continuada para lideranças, com foco em gestão de pessoas, comunicação eficaz, feedback construtivo, gestão de conflitos e promoção de bem-estar nas equipes;</li>
            <li>Revisar políticas de reconhecimento e recompensas, incluindo critérios transparentes, meritocráticos e acessíveis de progressão de carreira, valorização da experiência acumulada e reconhecimento de contribuições;</li>
            <li>Implementar práticas de gestão participativa que ampliem a influência dos colaboradores sobre seus processos de trabalho, decisões operacionais e condições de execução das tarefas;</li>
            <li>Fortalecer canais de escuta ativa e comunicação bidirecional entre lideranças e equipes, assegurando que as demandas, preocupações e sugestões dos trabalhadores sejam sistematicamente consideradas nas decisões organizacionais.</li>
        </ul>
    </section>

    <!-- ===== SEÇÃO X ===== -->
    <section>
        <h2>Seção X — Recomendações Técnicas e Conclusões</h2>
        <p>As medidas propostas neste relatório devem ser integradas ao <strong>Plano de Ação do PGR</strong>, conforme exigido pela NR-1, com definição clara de responsáveis, prazos, recursos necessários e indicadores de acompanhamento. A implementação deve ser conduzida de forma participativa, envolvendo representantes de diferentes níveis hierárquicos da organização, assegurando legitimidade, adesão e eficácia das intervenções.</p>
        <p>Indica-se que a <strong>reavaliação dos fatores psicossociais</strong> seja realizada em intervalos de <strong>24 meses</strong>, conforme o ciclo regular do GRO, permitindo a atualização do diagnóstico e a verificação da efetividade das ações implementadas.</p>
        <div class="highlight-box">
            <strong>Monitoramento e Reaplicação Antecipada:</strong> Recomenda-se monitorar continuamente indicadores internos, como absenteísmo, rotatividade, afastamentos por transtornos mentais (CID F) e produtividade, para identificar a necessidade de reaplicação do instrumento fora do ciclo padrão de 24 meses. As seguintes condições justificam reaplicação antecipada:
            <ul style="margin-top:8px;">
                <li>Reestruturações organizacionais significativas (fusões, aquisições, mudanças estruturais);</li>
                <li>Demissões em massa ou processos de downsizing;</li>
                <li>Implantação de novos processos, tecnologias ou sistemas de trabalho;</li>
                <li>Mudança de gestão com impacto relevante na cultura organizacional;</li>
                <li>Aumento expressivo de adoecimentos por transtornos mentais ou absenteísmo por CID F.</li>
            </ul>
        </div>
    </section>

    <!-- ===== SEÇÃO XI ===== -->
    <section>
        <h2>Seção XI — Conclusão</h2>
        <p>Os resultados evidenciados neste relatório sinalizam pontos de atenção significativos quanto aos fatores de risco psicossocial no ambiente organizacional avaliado. A predominância de riscos relacionados ao ritmo de trabalho, às exigências quantitativas e emocionais, e aos aspectos relacionais e de liderança demanda uma abordagem sistemática e integrada, contemplando simultaneamente aspectos organizacionais e individuais, de curto e longo prazo, de caráter preventivo e corretivo.</p>
        <p>A gestão eficaz desses fatores não apenas contribui para o cumprimento das exigências legais da <strong>NR-1</strong> e da <strong>ISO 45003</strong>, mas representa um investimento estratégico na saúde e no bem-estar dos colaboradores, com impactos positivos e mensuráveis na produtividade, qualidade dos processos, retenção de talentos, redução do absenteísmo e melhoria do clima organizacional. A literatura científica, fundamentada na versão brasileira do COPSOQ II por <strong>Melo & Ferreira (2011)</strong>, aponta consistentemente que organizações que investem na gestão dos riscos psicossociais obtêm resultados superiores de desempenho e sustentabilidade.</p>
        <p>A atuação preventiva baseada nos dados deste relatório possibilita a construção de um ambiente de trabalho mais saudável, equilibrado e propício ao desenvolvimento humano e organizacional. O diagnóstico ora apresentado representa o ponto de partida de um ciclo contínuo de avaliação e melhoria, a ser incorporado à cultura e às práticas de gestão da organização, promovendo progressivamente a qualidade de vida no trabalho e a excelência organizacional em saúde e segurança ocupacional.</p>

        <div class="signature-block">
            <div class="signature-line">
                Tatiana Coaracy<br>
                <b>Engenheira de Segurança do Trabalho</b><br>
                Registro Profissional: CREA/MTE: ---<br>
                Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}
            </div>
            <br><br>
            <div style="font-size:10px; color:#666; margin-top:16px;">
                Revisão Técnica: Eng. Carlos Rogério C. Santos | Produção Editorial: Labor Treinamentos<br>
                Referência: Melo & Ferreira (2011) — Versão Brasileira COPSOQ II
            </div>
        </div>
    </section>

    <!-- PRINT BUTTON -->
    <div class="no-print" style="margin-top:40px;text-align:center;">
        <button onclick="window.print()" style="padding:10px 28px;cursor:pointer;background:#1b4d3e;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;">
            🖨️ Imprimir / Salvar como PDF
        </button>
    </div>

</div>
</body>
</html>`;

    const w = window.open('', '_blank');
    if (w) {
        w.document.write(htmlContent);
        w.document.close();
    } else {
        alert('Por favor, permita pop-ups para visualizar o relatório técnico.');
    }
}
