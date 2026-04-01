import {
    Document, Packer, Paragraph, TextRun, ImageRun,
    Header, Footer, AlignmentType, PageNumber, PageBreak,
    WidthType, Table, TableRow, TableCell, BorderStyle, VerticalAlign
} from 'docx';
import { saveAs } from 'file-saver';
import { Chart, registerables } from 'chart.js';
import { COPSOQ_QUESTIONS } from './copsoq_data.js';
import { buildTechnicalReportIntro } from './ReportIntroGenerator.js';

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

async function renderHorizontalBarChart(labels, data) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 350;
        const ctx = canvas.getContext('2d');

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: '#3D3D3D',
                    barThickness: 24,
                }]
            },
            options: {
                animation: false,
                responsive: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        min: 0,
                        max: 90,
                        ticks: {
                            stepSize: 30,
                            font: { size: 18, family: 'Arial', weight: 'bold' },
                            color: '#000'
                        },
                        grid: { color: '#E0E0E0' }
                    },
                    y: {
                        ticks: {
                            font: { size: 18, family: 'Arial', weight: 'bold' },
                            color: '#000'
                        },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
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
                transformation: { width: 360, height: 144 },
                type: 'png',
            })
        ],
        spacing: { after: 80 },
        keepLines: true,
    });

    return [titlePara, respondentsPara, imagePara];
}

function buildRiskDomainBlock(domainName, riskCounts, totalRespondents, avgScore, riskChartImage, typeLabel = 'Global') {
    const riskLevel = getRiskLevel(avgScore);
    const riskColor = riskLevel === 'Alto' ? '#C0392B' : riskLevel === 'Médio' ? '#D68910' : '#1E8449';

    const domainTitle = new Paragraph({
        children: [new TextRun({ text: `📊 ${domainName}`, bold: true, size: 26, color: '1F4E79' })],
        spacing: { before: 300, after: 60 },
        keepNext: true,
        keepLines: true,
    });

    const riskSummary = new Paragraph({
        children: [
            new TextRun({ text: `Índice Médio (${typeLabel}): `, size: 20 }),
            new TextRun({ text: `${avgScore.toFixed(1)}`, bold: true, size: 20 }),
            new TextRun({ text: `   |   Nível de Risco: `, size: 20 }),
            new TextRun({ text: riskLevel, bold: true, size: 20, color: riskColor.replace('#','') }),
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

function buildSectorTable(sectorBreakdown) {
    if (!sectorBreakdown || sectorBreakdown.length === 0) return [];
    
    sectorBreakdown.sort((a, b) => a.sector.localeCompare(b.sector));

    const rows = [
        new TableRow({
            children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Setor', bold: true, color: 'FFFFFF' })], alignment: AlignmentType.CENTER })], shading: { fill: '1F4E79' } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Índice Médio', bold: true, color: 'FFFFFF' })], alignment: AlignmentType.CENTER })], shading: { fill: '1F4E79' } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Nível de Risco', bold: true, color: 'FFFFFF' })], alignment: AlignmentType.CENTER })], shading: { fill: '1F4E79' } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Respondentes', bold: true, color: 'FFFFFF' })], alignment: AlignmentType.CENTER })], shading: { fill: '1F4E79' } }),
            ],
            tableHeader: true,
        })
    ];

    for (const s of sectorBreakdown) {
        const riskColor = s.riskLevel === 'Alto' ? 'C0392B' : s.riskLevel === 'Médio' ? 'D68910' : '1E8449';
        
        rows.push(new TableRow({
            children: [
                new TableCell({ children: [new Paragraph({ text: s.sector })] }),
                new TableCell({ children: [new Paragraph({ text: s.avgScore.toFixed(1), alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.riskLevel, bold: true, color: riskColor })], alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: `${s.n}`, alignment: AlignmentType.CENTER })] }),
            ]
        }));
    }

    const table = new Table({
        rows: rows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "EFEFEF" },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "EFEFEF" },
        },
    });

    return [
        new Paragraph({
             children: [new TextRun({ text: 'Detalhamento por Setor:', bold: true, size: 20, color: '2E4057' })],
             spacing: { before: 80, after: 80 },
             keepNext: true,
        }),
        table,
        new Paragraph({ spacing: { after: 200 } })
    ];
}

export async function generateGeneralAnalyticalReport(evaluations, companyName) {
    if (!evaluations || evaluations.length === 0) return;
    const copsoqEvals = evaluations.filter(ev => ev.type === 'COPSOQ' && ev.responses);
    if (!copsoqEvals || copsoqEvals.length === 0) {
        alert('Não há avaliações COPSOQ com respostas para gerar este relatório.');
        return;
    }

    let logoBuffer = null;
    try {
        const response = await fetch('/assets/normalizze-logo.png');
        if (response.ok) {
            const buffer = await response.arrayBuffer();
            const view = new Uint8Array(buffer);
            // Verifica assinatura do PNG para evitar crash se o servidor retornar HTML (fallback)
            if (view.length > 8 && view[0] === 137 && view[1] === 80 && view[2] === 78 && view[3] === 71) {
                logoBuffer = buffer;
            } else {
                console.warn("Logo invalido ou nao encontrado (fallback HTML suspeito).");
            }
        }
    } catch (e) {
        console.error("Erro ao carregar logo:", e);
    }

    const totalRespondents = copsoqEvals.length;

    if (copsoqEvals.length === 0) {
        alert('Não há avaliações COPSOQ com respostas para gerar este relatório.');
        return;
    }


    let countM = 0, countF = 0;
    let sumAge = 0, countAge = 0, minAge = 999, maxAge = 0;
    let sumTime = 0, countTime = 0, minTime = 999, maxTime = 0;

    const normalizeSector = (s) => {
        if (!s) return 'Setor não informado';
        const t = s.trim();
        if (!t) return 'Setor não informado';
        return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    };

    // ── 1. Agrupar avaliações por setor para a tabela ─────────────────────────
    const sectorMap = {};
    copsoqEvals.forEach(ev => {
        const sector = normalizeSector(ev.person?.sector);
        if (!sectorMap[sector]) sectorMap[sector] = [];
        sectorMap[sector].push(ev);

        if (ev.person) {
            const g = (ev.person.gender || '').toLowerCase();
            if (g.startsWith('m')) countM++;
            else if (g.startsWith('f')) countF++;

            const a = Number(ev.person.age);
            if (!isNaN(a) && a > 0) {
                sumAge += a; countAge++;
                if (a < minAge) minAge = a;
                if (a > maxAge) maxAge = a;
            }

            const t = Number(ev.person.tenure);
            if (!isNaN(t) && t >= 0) {
                sumTime += t; countTime++;
                if (t < minTime) minTime = t;
                if (t > maxTime) maxTime = t;
            }
        }
    });

    const pctM = totalRespondents ? Math.round((countM/totalRespondents)*100) : 0;
    const pctF = totalRespondents ? Math.round((countF/totalRespondents)*100) : 0;
    const avgAge = countAge ? Math.round(sumAge/countAge) : 0;
    const avgTime = countTime ? (sumTime/countTime).toFixed(1) : 0;

    const demographicData = {
        totalRespondents,
        pctM, pctF,
        avgAge, minAge: minAge===999 ? 0 : minAge, maxAge,
        avgTime, minTime: minTime===999 ? 0 : minTime, maxTime
    };

    const sectorNames = Object.keys(sectorMap).sort();

    // ── 2. Processar dados por Domínio (Visão Global) ─────────────────────────
    const domainsData = [];

    for (const dom of DOMAIN_MAP) {
        // A) Risco GLOBAL do domínio
        const globalRiskCounts = { Alto: 0, Médio: 0, Baixo: 0 };
        let globalDomainScoreSum = 0;
        let globalDomainScoreCount = 0;

        copsoqEvals.forEach(ev => {
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
                globalDomainScoreSum += personAvg;
                globalDomainScoreCount++;
                globalRiskCounts[getRiskLevel(personAvg)]++;
            }
        });

        const globalAvgScore = globalDomainScoreCount > 0 ? globalDomainScoreSum / globalDomainScoreCount : 0;

        const riskLabels = [], riskData = [], riskColors = [];
        ['Alto', 'Médio', 'Baixo'].forEach(level => {
            if (globalRiskCounts[level] > 0) {
                riskLabels.push(`${level} (${globalRiskCounts[level]}p)`);
                riskData.push(globalRiskCounts[level]);
                riskColors.push(RISK_COLORS[level]);
            }
        });

        const totalGlobalRespondents = globalRiskCounts.Alto + globalRiskCounts.Médio + globalRiskCounts.Baixo;
        const globalRiskChartImage = totalGlobalRespondents > 0
            ? await renderPieChart(riskLabels, riskData, riskColors, totalGlobalRespondents)
            : null;

        // B) Risco POR SETOR (Para a tabela)
        const sectorBreakdown = [];
        for (const sector of sectorNames) {
            const evals = sectorMap[sector];
            let sectDomainSum = 0;
            let sectDomainCount = 0;

            evals.forEach(ev => {
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
                    sectDomainSum += personAvg;
                    sectDomainCount++;
                }
            });

            if (sectDomainCount > 0) {
                const sectAvg = sectDomainSum / sectDomainCount;
                sectorBreakdown.push({
                    sector,
                    n: sectDomainCount,
                    avgScore: sectAvg,
                    riskLevel: getRiskLevel(sectAvg)
                });
            }
        }

        // C) Gráficos de Perguntas (GLOBAL)
        const questions = [];
        for (const qId of dom.qs) {
            const qDef = COPSOQ_QUESTIONS.find(q => q.id === qId);
            const qText = qDef ? qDef.text : `Pergunta ${qId}`;
            const counts = [0, 0, 0, 0, 0];
            let respondentsForQ = 0;

            copsoqEvals.forEach(ev => {
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

        if (totalGlobalRespondents > 0 || questions.length > 0) {
            domainsData.push({
                nome: dom.nome,
                avgScore: globalAvgScore,
                riskCounts: globalRiskCounts,
                totalRespondents: totalGlobalRespondents,
                riskChartImage: globalRiskChartImage,
                sectorBreakdown,
                questions
            });
        }
    }

    // ── 3. Construir documento DOCX ───────────────────────────────────────────
    const docChildren = [];

    const getDomainScore = (nomeBusca) => {
        const d = domainsData.find(dm => dm.nome.toLowerCase().includes(nomeBusca.toLowerCase()));
        return d ? d.avgScore : 0;
    };
    
    const hBarLabels = [
        "Exigências Quantitativas",
        "Ritmo de Trabalho",
        "Exigências Emocionais",
        "Influência no Trabalho",
        "Previsibilidade",
        "Reconhecimento",
        "Apoio Social",
        "Qualidade da Liderança"
    ];
    
    const hBarData = hBarLabels.map(l => {
        if (l === "Exigências Quantitativas") return getDomainScore("Demandas Quantitativas");
        if (l === "Ritmo de Trabalho") return getDomainScore("Cognitivas");
        if (l === "Exigências Emocionais") return getDomainScore("Emocionais");
        if (l === "Apoio Social") {
            const d1 = getDomainScore("Chefia");
            const d2 = getDomainScore("Colegas");
            return (d1 + d2) / ((d1>0?1:0) + (d2>0?1:0) || 1);
        }
        return getDomainScore(l);
    });
    
    const globalBarChartImage = await renderHorizontalBarChart(hBarLabels, hBarData);

    const introBlocks = buildTechnicalReportIntro(companyName, demographicData, domainsData, sectorMap, globalBarChartImage);
    docChildren.push(...introBlocks);

    docChildren.push(new Paragraph({ children: [new PageBreak()] }));
    docChildren.push(
        new Paragraph({
            children: [new TextRun({ text: 'ANEXO I - DETALHAMENTO DE GRÁFICOS', bold: true, size: 36, color: '1F4E79' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 800, after: 400 },
        })
    );

    for (const dom of domainsData) {
        // Substituído PageBreak fixo por espaçamento natural para otimizar páginas
        docChildren.push(new Paragraph({ spacing: { before: 400 } }));

        // Nível 1: Cabeçalho do Domínio + Gráfico Global
        if (dom.riskChartImage) {
            const riskBlocks = buildRiskDomainBlock(
                dom.nome, dom.riskCounts,
                dom.totalRespondents,
                dom.avgScore,
                dom.riskChartImage,
                "Global"
            );
            docChildren.push(...riskBlocks);
        }

        // Nível 2: Tabela de Setores comparativa
        if (dom.sectorBreakdown && dom.sectorBreakdown.length > 0) {
            const tableBlocks = buildSectorTable(dom.sectorBreakdown);
            docChildren.push(...tableBlocks);
        }

        // Nível 3: Gráficos Globais das Perguntas
        if (dom.questions.length > 0) {
            docChildren.push(new Paragraph({
                children: [new TextRun({ text: `Distribuição das Respostas nas Perguntas:`, bold: true, size: 22, color: '1F4E79' })],
                spacing: { before: 160, after: 40 },
                keepNext: true,
            }));
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
                page: { margin: { top: 1800, right: 1134, bottom: 1800, left: 1134 } }
            },
            headers: {
                default: new Header({
                    children: [
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: {
                                top: { style: BorderStyle.SINGLE, size: 6, color: "111111" },
                                bottom: { style: BorderStyle.SINGLE, size: 6, color: "111111" },
                                left: { style: BorderStyle.SINGLE, size: 6, color: "111111" },
                                right: { style: BorderStyle.SINGLE, size: 6, color: "111111" },
                                insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "111111" },
                                insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }
                            },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: { size: 30, type: WidthType.PERCENTAGE },
                                            verticalAlign: VerticalAlign.CENTER,
                                            margins: { top: 150, bottom: 150, left: 150, right: 150 },
                                            children: [
                                                new Paragraph({
                                                    alignment: AlignmentType.CENTER,
                                                    children: logoBuffer ? [
                                                        new ImageRun({
                                                            data: logoBuffer,
                                                            transformation: { width: 140, height: 45 },
                                                            type: "png"
                                                        })
                                                    ] : [
                                                        new TextRun({ text: "NORMALIZZE", bold: true, size: 24, color: "54A446" })
                                                    ]
                                                })
                                            ]
                                        }),
                                        new TableCell({
                                            width: { size: 70, type: WidthType.PERCENTAGE },
                                            verticalAlign: VerticalAlign.CENTER,
                                            margins: { top: 150, bottom: 150, left: 150, right: 150 },
                                            children: [
                                                new Paragraph({
                                                    alignment: AlignmentType.CENTER,
                                                    children: [new TextRun({ text: "AVALIAÇÃO PSICOSSOCIAL", size: 32, color: "7F8C8D" })]
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        new Paragraph({ text: "", spacing: { after: 700 } }) // Espaço forçado para não colar o texto no Word/Docs
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({ text: "", spacing: { before: 500 } }), // Espaço forçado para manter o conteúdo afastado do rodapé
                        new Paragraph({
                            border: { top: { color: "CCCCCC", space: 1, style: BorderStyle.SINGLE, size: 6 } },
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 200, after: 100 },
                            children: [
                                new TextRun({ text: 'Relatório Técnico de Avaliação Psicossocial | ', size: 18, color: '7F8C8D' }),
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
    saveAs(blob, `Relatorio_Geral_Consolidado_${safeName}_${Date.now()}.docx`);
}
