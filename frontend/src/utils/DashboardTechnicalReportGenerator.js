import { Chart, registerables } from 'chart.js';
import { COPSOQ_DOMAINS, COPSOQ_QUESTIONS } from './copsoq_data';

Chart.register(...registerables);

/**
 * DashboardTechnicalReportGenerator.js
 * 
 * Generates a BROAD Technical report for a group of people (Sector or Company).
 * Mimics the style of the individual CopsoqTechnicalReportGenerator.js.
 */
export async function generateConsolidatedTechnicalReport(evaluations, companyName, periodText) {
    const copsoqEvals = evaluations.filter(ev => ev.type === 'COPSOQ');
    if (copsoqEvals.length === 0) {
        alert("Sem dados COPSOQ para gerar o relatório.");
        return;
    }

    // 1. Aggregation Logic
    const domainStats = {}; // { domainId: { alto: 0, medio: 0, baixo: 0, soma: 0, count: 0 } }
    const questionStats = {}; // { questionId: { 'Sempre': 0, 'Frequentemente': 0, ... } }

    const labels = ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"];
    // Note: Some questions are negative, but the "answer" used in raw data is often the label index or text.
    // Let's check a raw evaluation to be sure. Assumed standard 0-4 mapping for COPSOQ.

    copsoqEvals.forEach(ev => {
        // Domain Results (already calculated per evaluation)
        if (ev.results) {
            Object.entries(ev.results).forEach(([id, res]) => {
                if (!domainStats[id]) domainStats[id] = { nome: res.nome, alto: 0, medio: 0, baixo: 0, soma: 0, count: 0 };
                domainStats[id].soma += res.media;
                domainStats[id].count++;
                if (res.media < 50) domainStats[id].alto++;
                else if (res.media < 75) domainStats[id].medio++;
                else domainStats[id].baixo++;
            });
        }

        // Question-level Raw Data
        if (ev.raw) {
            Object.entries(ev.raw).forEach(([qId, val]) => {
                // val is usually 0, 1, 2, 3, 4
                if (!questionStats[qId]) {
                    questionStats[qId] = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, total: 0 };
                }
                questionStats[qId][val]++;
                questionStats[qId].total++;
            });
        }
    });

    // 2. Generate Chart Images
    const domainCharts = {};
    for (const [id, stats] of Object.entries(domainStats)) {
        domainCharts[id] = await generatePieChart(
            ['Risco Psicossocial Elevado (0-49)', 'Risco Psicossocial Moderado (50-74)', 'Condição Satisfatória/Segura (75-100)'],
            [stats.alto, stats.medio, stats.baixo],
            ['#E74C3C', '#F39C12', '#27AE60']
        );
    }

    const questionCharts = {};
    for (const [id, stats] of Object.entries(questionStats)) {
        questionCharts[id] = await generatePieChart(
            labels,
            [stats[0], stats[1], stats[2], stats[3], stats[4]],
            ['#E74C3C', '#E67E22', '#F1C40F', '#3498DB', '#27AE60']
        );
    }

    // 3. Assemble HTML (Professional Template)
    const sectors = Array.from(new Set(copsoqEvals.map(e => e.person?.sector || 'Geral'))).join(', ');
    const dateStr = new Date().toLocaleDateString('pt-BR');

    // Abbreviate for Radar
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

    const radarLabels = Object.values(domainStats).map(s => abbreviateDomain(s.nome));
    const radarData = Object.values(domainStats).map(s => (s.soma / s.count).toFixed(1));

    function getRiskLabel(score) {
        if (score >= 75) return { label: 'Condição Satisfatória/Segura', color: '#27AE60' };
        if (score >= 50) return { label: 'Risco Psicossocial Moderado', color: '#F39C12' };
        return { label: 'Risco Psicossocial Elevado', color: '#E74C3C' };
    }

    const tableRows = Object.values(domainStats).map(domain => {
        const score = domain.soma / domain.count;
        const risk = getRiskLabel(score);
        return `
            <tr>
                <td>${domain.nome}</td>
                <td style="text-align:center;">${score.toFixed(1)}</td>
                <td style="text-align:center; background:${risk.color}; color:#fff; font-weight:bold;">${risk.label}</td>
                <td style="font-size: 9px;">${domain.alto} críticos (${((domain.alto/domain.count)*100).toFixed(0)}%)</td>
            </tr>
        `;
    }).join('');

    // HTML Sections
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório Analítico Consolidado — ${companyName}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: 'Arial', sans-serif; background: #f0f2f5; margin: 0; padding: 0; color: #333; line-height: 1.6; }
        .page { background: #fff; width: 900px; margin: 30px auto; padding: 60px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #1b4d3e; padding-bottom: 20px; margin-bottom: 40px; }
        .header h1 { color: #1b4d3e; font-size: 24px; text-transform: uppercase; margin: 0; }
        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 30px; font-size: 13px; }
        .meta b { color: #1b4d3e; }
        section { margin-bottom: 40px; }
        h2 { color: #1b4d3e; border-left: 5px solid #1b4d3e; padding-left: 10px; font-size: 18px; text-transform: uppercase; margin-bottom: 20px; }
        h3 { font-size: 16px; color: #2c3e50; margin-top: 25px; }
        p { font-size: 12px; text-align: justify; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
        th { background: #1b4d3e; color: #fff; padding: 10px; text-align: left; }
        td { border: 1px solid #ddd; padding: 8px; }
        .chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; page-break-inside: avoid; }
        .chart-box { text-align: center; border: 1px solid #eee; padding: 15px; border-radius: 8px; background: #fcfcfc; }
        .chart-box h4 { font-size: 12px; margin-top: 0; color: #1b4d3e; height: 35px; overflow: hidden; }
        .radar-box { width: 600px; margin: 0 auto 30px; }
        @media print {
            body { background: #fff; }
            .page { box-shadow: none; margin: 0; width: 100%; padding: 40px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <h1>Relatório Técnico Analítico Consolidado<br>Gerenciamento de Riscos Psicossociais (COPSOQ II)</h1>
        </div>

        <div class="meta">
            <div><b>Empresa:</b> ${companyName}</div>
            <div><b>Data do Relatório:</b> ${dateStr}</div>
            <div><b>Período Analisado:</b> ${periodText}</div>
            <div><b>Setores contemplados:</b> ${sectors}</div>
            <div><b>Total de respondentes:</b> ${copsoqEvals.length}</div>
        </div>

        <section>
            <h2>Seção I — Síntese Visual de Riscos</h2>
            <p>Este gráfico representa a média consolidada de todos os colaboradores avaliados no período. Áreas próximas à borda externa indicam situações favoráveis, enquanto quedas em direção ao centro sinalizam riscos psicossociais críticos.</p>
            <div class="radar-box">
                <canvas id="radarMain"></canvas>
            </div>
        </section>

        <section>
            <h2>Seção II — Resultados por Domínio (Agregado)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Domínio Avaliado</th>
                        <th style="text-align:center;">Índice Médio</th>
                        <th style="text-align:center;">Risco</th>
                        <th>Status da População</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </section>

        <section>
            <h2>Seção III — Distribuição de Risco por Domínio</h2>
            <p>Análise da proporção de colaboradores em cada nível de risco para cada dimensão avaliada.</p>
            <div class="chart-grid">
                ${Object.values(domainStats).map(d => `
                    <div class="chart-box">
                        <h4>${d.nome}</h4>
                        <img src="${domainCharts[Object.keys(domainStats).find(k => domainStats[k] === d)]}" style="width:100%; height:auto;" />
                    </div>
                `).join('')}
            </div>
        </section>

        <section style="page-break-before: always;">
            <h2>Seção IV — Análise Detalhada por Pergunta</h2>
            <p>Distribuição das respostas nominais dos colaboradores. Esta visão permite identificar comportamentos específicos ou lacunas na cultura organizacional.</p>
            <div class="chart-grid">
                ${COPSOQ_QUESTIONS.map(q => {
                    const chart = questionCharts[q.id];
                    if (!chart) return '';
                    return `
                        <div class="chart-box">
                            <h4>${q.text}</h4>
                            <img src="${chart}" style="width:100%; height:auto;" />
                        </div>
                    `;
                }).join('')}
            </div>
        </section>

        <section>
            <h2>Seção V — Conclusão Técnica e Próximos Passos</h2>
            <p>Com base na amostra de ${copsoqEvals.length} colaboradores, o diagnóstico global sugere que a empresa deve priorizar intervenções nos domínios classificados como <b>Risco Psicossocial Elevado</b>. Recomenda-se a elaboração de um plano de ação robusto focado em treinamentos de liderança, revisão dos processos de trabalho e canais de comunicação interna.</p>
            <p style="text-align: center; margin-top: 50px;">
                <span style="border-top: 1px solid #1b4d3e; padding-top: 5px; width: 250px; display: inline-block;">
                    Tatiana Coaracy<br>Engenheira de Seg. do Trabalho
                </span>
            </p>
        </section>

        <div class="no-print" style="text-align: center;">
             <button onclick="window.print()" style="padding:12px 25px; background:#1b4d3e; color:#fff; border:none; border-radius:5px; cursor:pointer;">
                🖨️ Imprimir / Salvar PDF
             </button>
        </div>
    </div>

    <script>
        const ctxRadar = document.getElementById('radarMain').getContext('2d');
        new Chart(ctxRadar, {
            type: 'radar',
            data: {
                labels: ${JSON.stringify(radarLabels)},
                datasets: [{
                    label: 'Média do Grupo',
                    data: ${JSON.stringify(radarData)},
                    backgroundColor: 'rgba(27, 77, 62, 0.4)',
                    borderColor: '#1b4d3e',
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    r: { min: 0, max: 100, ticks: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    </script>
</body>
</html>
    `;

    const win = window.open('', '_blank');
    if (win) {
        win.document.write(htmlContent);
        win.document.close();
    } else {
        alert("Favor habilitar pop-ups.");
    }
}

async function generatePieChart(labels, data, colors) {
    return new Promise(resolve => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                animation: false,
                plugins: {
                    legend: { position: 'right', labels: { font: { size: 10 } } }
                }
            }
        });

        setTimeout(() => {
            resolve(canvas.toDataURL('image/png'));
        }, 100);
    });
}
