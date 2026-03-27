import {
    Document, Packer, Paragraph, TextRun, ImageRun,
    Header, Footer, AlignmentType, PageNumber, PageBreak,
    WidthType, Table, TableRow, TableCell, BorderStyle
} from 'docx';
import { saveAs } from 'file-saver';
import { Chart, registerables } from 'chart.js';
import { COPSOQ_QUESTIONS } from './copsoq_data.js';

Chart.register(...registerables);

// 17 domínios com as 62 perguntas (IDs 3–64)
const DOMAIN_MAP = [
    { nome: "Demandas Quantitativas",           qs: [3, 4, 5, 6] },
    { nome: "Demandas Cognitivas",               qs: [7, 8, 9, 10] },
    { nome: "Demandas Emocionais",               qs: [11, 12, 13] },
    { nome: "Influência no Trabalho",            qs: [14, 15, 16] },
    { nome: "Possibilidades de Desenvolvimento", qs: [17, 18, 19] },
    { nome: "Significado do Trabalho",           qs: [20, 21, 22] },
    { nome: "Clareza de Papel",                  qs: [23, 24, 25] },
    { nome: "Conflitos de Papel",                qs: [26, 27, 28] },
    { nome: "Previsibilidade",                   qs: [29, 30, 31] },
    { nome: "Reconhecimento",                    qs: [32, 33, 34] },
    { nome: "Apoio Social - Chefia",             qs: [35, 36, 37] },
    { nome: "Apoio Social - Colegas",            qs: [38, 39, 40] },
    { nome: "Feedback",                          qs: [41, 42, 43] },
    { nome: "Qualidade da Liderança",            qs: [44, 45, 46] },
    { nome: "Justiça e Respeito",                qs: [47, 48, 49] },
    { nome: "Comprometimento com a Empresa",     qs: [50, 51, 52] },
    { nome: "Insegurança no Trabalho",           qs: [53, 54, 55] },
    { nome: "Conflito Trabalho-Família",         qs: [56, 57, 58] },
    { nome: "Burnout",                           qs: [59, 60, 61] },
    { nome: "Presenteísmo",                      qs: [62, 63, 64] },
];

// Opções COPSOQ — cores fixas conforme especificação
const OPTIONS = [
    { label: "Quase Nunca/Nunca",            color: "#4472C4" },
    { label: "Poucas Vezes",                 color: "#E05A2B" },
    { label: "Algumas Vezes",                color: "#F5A623" },
    { label: "Frequentemente",               color: "#5DAE5D" },
    { label: "Muito Frequentemente/Sempre",  color: "#8E44AD" },
];

// Cores de risco
const RISK_COLORS = { Alto: '#E74C3C', Médio: '#F39C12', Baixo: '#27AE60' };

function getRiskLevel(score) {
    if (score >= 75) return 'Baixo';
    if (score >= 50) return 'Médio';
    return 'Alto';
}

// Converte valor COPSOQ (1–5) em índice 0–100
function responseToIndex(val) {
    return ((val - 1) / 4) * 100;
}

// Plugin: percentuais em branco negrito dentro das fatias
const innerPercentPlugin = {
    id: 'innerPercent',
    afterDatasetDraw(chart, args, pluginOptions) {
        const { ctx, data } = chart;
        const meta = args.meta;
        const total = pluginOptions.total || 1;

        ctx.save();
        ctx.font = 'bold 22px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        meta.data.forEach((element, index) => {
            const value = data.datasets[0].data[index];
            const pct = (value / total) * 100;
            if (pct >= 5) {
                const pos = element.tooltipPosition();
                ctx.fillText(`${Math.round(pct)}%`, pos.x, pos.y);
            }
        });
        ctx.restore();
    }
};

async function renderPieChart(labels, data, colors, total) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 900;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');

        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                }]
            },
            options: {
                animation: false,
                responsive: false,
                layout: { padding: { top: 10, bottom: 10, left: 10, right: 10 } },
                plugins: {
                    legend: {
                        position: 'right',
                        align: 'center',
                        labels: {
                            font: { size: 22, family: 'Arial' },
                            padding: 18,
                            boxWidth: 28,
                        }
                    },
                    innerPercent: { total }
                }
            },
            plugins: [innerPercentPlugin]
        });

        setTimeout(() => {
            const base64 = canvas.toDataURL('image/png');
            chart.destroy();
            resolve(base64);
        }, 120);
    });
}

function b64ToBytes(base64) {
    const clean = base64.split(',')[1];
    const binary = window.atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function buildQuestionBlock(q) {
    const titlePara = new Paragraph({
        children: [new TextRun({ text: `Q${q.id}. ${q.text}`, bold: true, size: 22 })],
        spacing: { before: 160, after: 40 },
        keepNext: true,
        keepLines: true,
    });

    const respondentsPara = new Paragraph({
        children: [new TextRun({ text: `Total de respondentes: ${q.respondents}`, size: 18, color: '7F7F7F' })],
        spacing: { after: 60 },
        keepNext: true,
        keepLines: true,
    });

    const imagePara = new Paragraph({
        children: [
            new ImageRun({
                data: b64ToBytes(q.chartImage),
                transformation: { width: 450, height: 180 },
                type: 'png',
            })
        ],
        spacing: { after: 200 },
        keepLines: true,
    });

    return [titlePara, respondentsPara, imagePara];
}

function buildRiskDomainBlock(domainName, riskCounts, totalInSector, avgScore, riskChartImage) {
    const riskLevel = getRiskLevel(avgScore);
    const riskColor = riskLevel === 'Alto' ? 'C0392B' : riskLevel === 'Médio' ? 'D68910' : '1E8449';

    const domainTitle = new Paragraph({
        children: [new TextRun({ text: `📊 ${domainName}`, bold: true, size: 26, color: '1F4E79' })],
        spacing: { before: 300, after: 60 },
        keepNext: true,
        keepLines: true,
    });

    const riskSummary = new Paragraph({
        children: [
            new TextRun({ text: `Índice Médio do Setor: `, size: 20 }),
            new TextRun({ text: `${avgScore.toFixed(1)}`, bold: true, size: 20 }),
            new TextRun({ text: `   |   Nível de Risco: `, size: 20 }),
            new TextRun({ text: riskLevel, bold: true, size: 20, color: riskColor }),
            new TextRun({ text: `   |   Alto: ${riskCounts.Alto}p  Médio: ${riskCounts.Médio}p  Baixo: ${riskCounts.Baixo}p`, size: 18, color: '595959' }),
        ],
        spacing: { after: 60 },
        keepNext: true,
        keepLines: true,
    });

    const riskImagePara = new Paragraph({
        children: [
            new ImageRun({
                data: b64ToBytes(riskChartImage),
                transformation: { width: 380, height: 152 },
                type: 'png',
            })
        ],
        spacing: { after: 160 },
        keepLines: true,
    });

    return [domainTitle, riskSummary, riskImagePara];
}

export async function generateGeneralAnalyticalReport(evaluations, companyName) {
    const copsoqEvals = evaluations.filter(ev => ev.type === 'COPSOQ' && ev.responses);

    if (copsoqEvals.length === 0) {
        alert('Não há avaliações COPSOQ com respostas para gerar este relatório.');
        return;
    }

    const totalRespondents = copsoqEvals.length;

    // ── 1. Agrupar avaliações por setor ───────────────────────────────────────
    const sectorMap = {};
    copsoqEvals.forEach(ev => {
        const sector = (ev.person?.sector || 'Setor não informado').trim();
        if (!sectorMap[sector]) sectorMap[sector] = [];
        sectorMap[sector].push(ev);
    });

    // ── 2. Processar dados por setor ──────────────────────────────────────────
    const sectorsData = [];

    for (const [sectorName, sectorEvals] of Object.entries(sectorMap)) {
        const n = sectorEvals.length;
        const domains = [];

        for (const dom of DOMAIN_MAP) {
            // Calcular índice médio por pessoa e classificar risco
            const riskCounts = { Alto: 0, Médio: 0, Baixo: 0 };
            let domainScoreSum = 0;
            let domainScoreCount = 0;

            sectorEvals.forEach(ev => {
                const personScores = dom.qs.map(qId => {
                    const resp = ev.responses[qId];
                    if (resp !== undefined && resp !== null) {
                        const val = parseInt(resp, 10);
                        if (!isNaN(val) && val >= 1 && val <= 5) return responseToIndex(val);
                    }
                    return null;
                }).filter(s => s !== null);

                if (personScores.length > 0) {
                    const personAvg = personScores.reduce((a, b) => a + b, 0) / personScores.length;
                    domainScoreSum += personAvg;
                    domainScoreCount++;
                    riskCounts[getRiskLevel(personAvg)]++;
                }
            });

            const avgScore = domainScoreCount > 0 ? domainScoreSum / domainScoreCount : 0;

            // Gráfico Nível 1: pizza tricolor de risco
            const riskLabels = [], riskData = [], riskColors = [];
            ['Alto', 'Médio', 'Baixo'].forEach(level => {
                if (riskCounts[level] > 0) {
                    riskLabels.push(`${level} (${riskCounts[level]}p)`);
                    riskData.push(riskCounts[level]);
                    riskColors.push(RISK_COLORS[level]);
                }
            });

            const totalRiskRespondents = riskCounts.Alto + riskCounts.Médio + riskCounts.Baixo;
            const riskChartImage = totalRiskRespondents > 0
                ? await renderPieChart(riskLabels, riskData, riskColors, totalRiskRespondents)
                : null;

            // Gráfico Nível 2: frequência por pergunta (filtrado pelo setor)
            const questions = [];
            for (const qId of dom.qs) {
                const qDef = COPSOQ_QUESTIONS.find(q => q.id === qId);
                const qText = qDef ? qDef.text : `Pergunta ${qId}`;
                const counts = [0, 0, 0, 0, 0];
                let respondentsForQ = 0;

                sectorEvals.forEach(ev => {
                    const resp = ev.responses[qId];
                    if (resp !== undefined && resp !== null) {
                        const val = parseInt(resp, 10);
                        if (!isNaN(val) && val >= 1 && val <= 5) {
                            counts[val - 1]++;
                            respondentsForQ++;
                        }
                    }
                });

                if (respondentsForQ > 0) {
                    const labels = [], data = [], colors = [];
                    for (let i = 0; i < 5; i++) {
                        if (counts[i] > 0) {
                            labels.push(OPTIONS[i].label);
                            data.push(counts[i]);
                            colors.push(OPTIONS[i].color);
                        }
                    }
                    const chartImage = await renderPieChart(labels, data, colors, respondentsForQ);
                    questions.push({ id: qId, text: qText, respondents: respondentsForQ, chartImage });
                }
            }

            if (totalRiskRespondents > 0 || questions.length > 0) {
                domains.push({ nome: dom.nome, avgScore, riskCounts, riskChartImage, questions });
            }
        }

        if (domains.length > 0) {
            sectorsData.push({ name: sectorName, n, domains });
        }
    }

    // ── 3. Construir documento DOCX ───────────────────────────────────────────
    const docChildren = [];

    // Capa
    docChildren.push(
        new Paragraph({
            children: [new TextRun({ text: 'Relatório Analítico Geral por Setor', bold: true, size: 40, color: '1F4E79' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 200 },
        }),
        new Paragraph({
            children: [new TextRun({ text: `Empresa: ${companyName || 'Não identificada'}`, size: 28, color: '2E4057' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
        }),
        new Paragraph({
            children: [new TextRun({ text: `Total Geral de Avaliações: ${totalRespondents}`, size: 22, color: '595959' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
        }),
        new Paragraph({
            children: [new TextRun({ text: `Setores avaliados: ${sectorsData.length}`, size: 22, color: '595959' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
        }),
    );

    for (const sector of sectorsData) {
        // Quebra de página antes de cada setor (exceto o primeiro)
        if (docChildren.length > 4) {
            docChildren.push(new Paragraph({ children: [new PageBreak()] }));
        }

        // Cabeçalho do setor
        docChildren.push(
            new Paragraph({
                children: [new TextRun({ text: `SETOR: ${sector.name.toUpperCase()}`, bold: true, size: 36, color: '1B4D3E' })],
                spacing: { before: 200, after: 80 },
                keepNext: true,
            }),
            new Paragraph({
                children: [new TextRun({ text: `N = ${sector.n} respondente${sector.n !== 1 ? 's' : ''}`, size: 22, color: '7F7F7F', italics: true })],
                spacing: { after: 300 },
            }),
        );

        for (const dom of sector.domains) {
            // Nível 1: cabeçalho do domínio + gráfico de risco
            if (dom.riskChartImage) {
                const riskBlocks = buildRiskDomainBlock(
                    dom.nome, dom.riskCounts,
                    dom.riskCounts.Alto + dom.riskCounts.Médio + dom.riskCounts.Baixo,
                    dom.avgScore,
                    dom.riskChartImage
                );
                docChildren.push(...riskBlocks);
            }

            // Nível 2: perguntas do domínio filtradas pelo setor
            for (const q of dom.questions) {
                docChildren.push(...buildQuestionBlock(q));
            }
        }
    }

    // ── 4. Montar Document ────────────────────────────────────────────────────
    const doc = new Document({
        styles: {
            default: {
                document: { run: { font: 'Arial', size: 22 } }
            }
        },
        sections: [{
            properties: {
                page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } }
            },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [new TextRun({ text: 'Relatório Geral — Normalizze', size: 18, color: '7F8C8D' })]
                        })
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({ text: 'Página ', size: 18, color: '7F8C8D' }),
                                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '7F8C8D' }),
                                new TextRun({ text: ' de ', size: 18, color: '7F8C8D' }),
                                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: '7F8C8D' }),
                            ]
                        })
                    ]
                })
            },
            children: docChildren,
        }]
    });

    const blob = await Packer.toBlob(doc);
    const safeName = (companyName || 'Empresa').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '');
    saveAs(blob, `Relatorio_Geral_${safeName}_${Date.now()}.docx`);
}
