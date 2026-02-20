import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType, PageNumber, PageBreak } from 'docx';
import { saveAs } from 'file-saver';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Generates a comprehensive AEP Report in DOCX format.
 * Matches the strict structure: 1. Objective, 2. Methodology, 3. Categories, 4. Consolidation, 5. Risks, 6. Recommendations...
 * @param {Object} data - { scores: {}, raw: {} }
 * @param {Object} info - { nomeEmpresa, avaliador, setor, dataAvaliacao }
 */
import { AEP_DATA } from './aep_data_v2';

// Helper to look up title across both types
const getCategoryTitle = (id) => {
    // Search in Administrative
    let cat = AEP_DATA.administrativo.categories.find(c => c.id === id);
    if (cat) return cat.title;
    // Search in Operational
    cat = AEP_DATA.operacional.categories.find(c => c.id === id);
    if (cat) return cat.title;
    return id; // Fallback
};

export async function generateAepReport(data, info) {
    const scores = data.scores || {};
    const images = data.images || {};
    const inputScores = data.scores.categoryScores || data.scores;

    const categoryRows = Object.entries(inputScores)
        .filter(([key, val]) => typeof val === 'number')
        .map(([key, value]) => {
            let color = "27AE60";
            let level = "ADEQUADO";
            if (value < 60) { color = "E74C3C"; level = "CRÍTICO"; }
            else if (value < 80) { color = "F39C12"; level = "ATENÇÃO"; }
            return { id: key, name: getCategoryTitle(key), score: value, level, color };
        });

    const chartScores = {};
    categoryRows.forEach(r => chartScores[r.name] = r.score);
    const chartImageBase64 = await generateChart(chartScores);
    const chartCleanBase64 = chartImageBase64.split(',')[1];
    const chartBinaryString = window.atob(chartCleanBase64);
    const chartLen = chartBinaryString.length;
    const chartBytes = new Uint8Array(chartLen);
    for (let i = 0; i < chartLen; i++) {
        chartBytes[i] = chartBinaryString.charCodeAt(i);
    }

    // Prepare dynamic sections including photos
    const reportSections = [
        createHeading1("3. CATEGORIAS DE AVALIAÇÃO"),
        new Paragraph({ text: "A avaliação contemplou os seguintes aspectos, conforme preconizado pela NR-17:" }),
        new Paragraph({ text: "" }),
        createCategoriesTable(),
        new Paragraph({ text: "" }),

        createHeading1("4. CONSOLIDAÇÃO DE RESULTADOS POR SETOR"),
        new Paragraph({ text: "Os dados coletados foram tabulados e analisados, permitindo a identificação das áreas com maior número de não-conformidades ergonômicas." }),
        new Paragraph({ text: "" }),
        new Paragraph({
            children: [
                new ImageRun({
                    data: chartBytes,
                    transformation: { width: 500, height: 300 },
                    type: "png"
                })
            ],
            alignment: AlignmentType.CENTER
        }),
        new Paragraph({ text: "" }),
        createResultsTable(categoryRows),
        new Paragraph({ text: "" }),

        createHeading1("5. ANÁLISE DETALHADA E EVIDÊNCIAS FOTOGRÁFICAS"),
        ...generateDetailedAnalysisWithImages(categoryRows, images),

        createHeading1("6. RECOMENDAÇÕES PARA ADEQUAÇÃO"),
        ...generateRecommendations(categoryRows),

        createHeading1("7. CONCLUSÃO E PRÓXIMOS PASSOS"),
        new Paragraph({ text: "Conclui-se que há oportunidades de melhoria ergonômica. Recomenda-se a implementação imediata das ações listadas e reavaliação periódica." }),
        new Paragraph({ text: "" }),

        // RESPONSÁVEL
        new Paragraph({ text: "" }),
        new Paragraph({ text: "" }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "________________________________________" })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: info.avaliador || "Responsável Técnico", bold: true }),
            ]
        }),
    ];

    const doc = new Document({
        styles: {
            default: { document: { run: { font: "Arial", size: 24 } } },
            paragraphStyles: [
                {
                    id: "Heading1",
                    name: "Heading 1",
                    run: { size: 32, bold: true, font: "Arial", color: "2C3E50" },
                    paragraph: { spacing: { before: 240, after: 120 } }
                }
            ]
        },
        sections: [{
            properties: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                                new TextRun({ text: "Relatório Técnico: Análise Ergonômica Preliminar (AEP)", size: 20, color: "7F8C8D" })
                            ]
                        })
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new TextRun("Página "), new TextRun({ children: [PageNumber.CURRENT] })]
                        })
                    ]
                })
            },
            children: [
                new Paragraph({
                    text: "Relatório Técnico: Análise Ergonômica Preliminar (AEP)",
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: "" }),
                createFieldLine("Empresa:", info.nomeEmpresa || "[Nome da Empresa]"),
                createFieldLine("Avaliador:", info.avaliador || "[Nome do Avaliador]"),
                createFieldLine("Data da Avaliação:", info.dataAvaliacao || new Date().toLocaleDateString('pt-BR')),
                createFieldLine("Setor Avaliado:", info.setor || "Geral"),
                new Paragraph({ text: "" }),

                createHeading1("1. OBJETIVO"),
                new Paragraph({
                    text: "Este relatório apresenta a consolidação dos dados obtidos nas análises ergonômicas preliminares realizadas conforme a NR-17."
                }),
                new Paragraph({ text: "" }),

                createHeading1("2. METODOLOGIA"),
                new Paragraph({ text: "Checklist estruturado, observação direta e critérios da NR-17." }),
                new Paragraph({ text: "" }),

                ...reportSections
            ]
        }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Relatorio_AEP_${(info.nomeEmpresa || 'Relatorio').replace(/\s/g, '_')}.docx`);
}

// --- Helpers ---

function createHeading1(text) {
    return new Paragraph({
        text,
        heading: HeadingLevel.HEADING_1
    });
}
function createHeading2(text) {
    return new Paragraph({
        text,
        heading: HeadingLevel.HEADING_2
    });
}
function createFieldLine(label, value) {
    return new Paragraph({
        children: [
            new TextRun({ text: label + " ", bold: true }),
            new TextRun(value)
        ]
    });
}

function createCategoriesTable() {
    const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: "fixed", // Ensure columns don't collapse
        rows: [
            new TableRow({
                children: [
                    createtHeaderCell("Mobiliário", 33),
                    createtHeaderCell("Equipamentos", 33),
                    createtHeaderCell("Ambiente", 34)
                ]
            }),
            new TableRow({
                children: [
                    // Pass width to cells
                    createCellList(["Altura da mesa", "Ajuste de cadeiras", "Apoio pés/punhos"], 33),
                    createCellList(["Monitor/Teclado", "Suportes", "Headsets"], 33),
                    createCellList(["Iluminação", "Ruído", "Temperatura"], 34)
                ]
            })
        ]
    });
}

function createtHeaderCell(text, widthPercent) {
    const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
    return new TableCell({
        width: { size: widthPercent, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
        shading: { fill: "3498DB", type: ShadingType.CLEAR },
        borders: { top: border, bottom: border, left: border, right: border }
    });
}

function createCellList(items, widthPercent) {
    const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
    return new TableCell({
        width: { size: widthPercent, type: WidthType.PERCENTAGE },
        children: items.map(i => new Paragraph("• " + i)),
        borders: { top: border, bottom: border, left: border, right: border }
    });
}

function createResultsTable(rows) {
    const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: "fixed",
        rows: [
            new TableRow({
                children: [
                    createtHeaderCell("Categoria Avaliada", 40),
                    createtHeaderCell("Conformidade", 30),
                    createtHeaderCell("Classificação", 30)
                ]
            }),
            ...rows.map(row =>
                new TableRow({
                    children: [
                        new TableCell({
                            width: { size: 40, type: WidthType.PERCENTAGE },
                            children: [new Paragraph(row.name)],
                            borders: { top: border, bottom: border, left: border, right: border }
                        }),
                        new TableCell({
                            width: { size: 30, type: WidthType.PERCENTAGE },
                            children: [new Paragraph({ text: row.score.toFixed(1) + "%", alignment: AlignmentType.CENTER })],
                            borders: { top: border, bottom: border, left: border, right: border }
                        }),
                        new TableCell({
                            width: { size: 30, type: WidthType.PERCENTAGE },
                            children: [new Paragraph({ text: row.level, alignment: AlignmentType.CENTER, run: { color: "FFFFFF", bold: true } })],
                            shading: { fill: row.color, type: ShadingType.CLEAR },
                            borders: { top: border, bottom: border, left: border, right: border }
                        })
                    ]
                })
            )
        ]
    });
}

function generateDetailedAnalysisWithImages(rows, images) {
    const analysis = [];
    rows.forEach(r => {
        analysis.push(createHeading2(r.name));
        analysis.push(new Paragraph({
            children: [
                new TextRun({ text: "Pontuação: ", bold: true }),
                new TextRun({ text: `${r.score.toFixed(1)}% - Classificação: `, color: r.color }),
                new TextRun({ text: r.level, bold: true, color: r.color })
            ]
        }));

        // Risk Text
        if (r.score < 80) {
            analysis.push(new Paragraph({
                text: "A conformidade neste item está abaixo do nível desejado (>80%). Recomenda-se revisão imediata das condições ergonômicas.",
                italics: true
            }));
        }

        // Add Images if any
        if (images[r.id] && images[r.id].length > 0) {
            analysis.push(new Paragraph({ text: "Evidências Fotográficas:", bold: true, spacing: { before: 120 } }));

            images[r.id].forEach((imgBase64) => {
                try {
                    // Ensure base64 is clean
                    const cleanBase64 = imgBase64.includes(',') ? imgBase64.split(',')[1] : imgBase64;

                    // Convert Base64 to Uint8Array (Browser compatible)
                    const binaryString = window.atob(cleanBase64);
                    const len = binaryString.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }

                    analysis.push(new Paragraph({
                        children: [
                            new ImageRun({
                                data: bytes,
                                transformation: { width: 400, height: 250 },
                                type: "png"
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200, after: 200 }
                    }));
                } catch (err) {
                    console.error("Erro ao processar imagem para o relatório:", err);
                    analysis.push(new Paragraph({ text: "[Erro ao carregar imagem]", color: "red" }));
                }
            });
        }
        analysis.push(new Paragraph({ text: "" }));
    });
    return analysis;
}

function generateRecommendations(rows) {
    const recs = [];
    const critical = rows.filter(r => r.score < 80);

    if (critical.length > 0) {
        critical.forEach(r => {
            recs.push(createHeading2("Adequação de " + r.name));
            recs.push(new Paragraph("• Realizar análise detalhada dos postos de trabalho."));
            recs.push(new Paragraph("• Adquirir/Ajustar equipamentos conforme especificações da NR-17."));
            recs.push(new Paragraph("• Promover capacitação sobre ajustes ergonômicos."));
            recs.push(new Paragraph({ text: "" }));
        });
    } else {
        recs.push(new Paragraph("• Manter o monitoramento periódico das condições ergonômicas."));
        recs.push(new Paragraph("• Realizar treinamentos de reciclagem anuais."));
    }
    return recs;
}

async function generateChart(scores) {
    return new Promise((resolve) => {
        const width = 800;
        const height = 400;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const labels = Object.keys(scores);
        const data = Object.values(scores);
        const colors = data.map(v => v < 60 ? '#E74C3C' : v < 80 ? '#F39C12' : '#27AE60');

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Conformidade (%)',
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                animation: false,
                responsive: false,
                indexAxis: 'y',
                scales: { x: { min: 0, max: 100 } },
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Percentual de Conformidade', font: { size: 18 } }
                }
            }
        });
        setTimeout(() => {
            const base64 = canvas.toDataURL('image/png');
            chart.destroy();
            resolve(base64);
        }, 100);
    });
}
