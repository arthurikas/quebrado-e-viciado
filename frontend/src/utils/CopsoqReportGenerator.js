import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType, PageNumber, PageBreak } from 'docx';
import { saveAs } from 'file-saver';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Generates a COPSOQ II Report in DOCX format.
 * Structure:
 * 1. Identification
 * 2. Methodology (Scores 0-100, Inversion, etc.)
 * 3. Results (Radar Chart + Scoring Table)
 * 4. Risk Analysis (Interpretation of scores)
 */
export async function generateCopsoqReport(results, personData) {
    const scores = results || {};

    // Prepare Data for Chart
    const labels = Object.values(scores).map(d => d.nome);
    const dataValues = Object.values(scores).map(d => d.media);
    const chartImage = await generateRadarChart(labels, dataValues);

    const doc = new Document({
        styles: {
            default: { document: { run: { font: "Arial", size: 24 } } }
        },
        sections: [{
            properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Diagnóstico baseado no COPSOQ II", size: 20, color: "7F8C8D" })] })
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("Página "), new TextRun({ children: [PageNumber.CURRENT] })] })]
                })
            },
            children: [
                new Paragraph({ text: "Diagnóstico Psicossocial baseado no COPSOQ II", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
                new Paragraph({ text: "" }),

                // 1. IDENTIFICATION
                createHeading1("1. IDENTIFICAÇÃO"),
                createFieldLine("Nome:", personData.name || "Anônimo"),
                createFieldLine("Setor:", personData.sector || "Não informado"),
                createFieldLine("Cargo:", personData.role || "Não informado"),
                createFieldLine("Gênero:", personData.gender || "Não informado"),
                createFieldLine("Idade:", personData.age ? `${personData.age} anos` : "Não informado"),
                createFieldLine("Tempo de Empresa:", personData.tenure ? `${personData.tenure} anos` : "Não informado"),
                createFieldLine("Data da Avaliação:", new Date(personData.date || Date.now()).toLocaleDateString('pt-BR')),
                new Paragraph({ text: "" }),

                // 2. METODOLOGIA
                createHeading1("2. METODOLOGIA"),
                new Paragraph("A avaliação baseada no COPSOQ II (Versão Brasileira) analisa os riscos psicossociais no trabalho. As respostas são convertidas para uma escala de 0 a 100."),
                new Paragraph("• 0-49 (Risco Elevado - Vermelho): Situação crítica, risco à saúde."),
                new Paragraph("• 50-74 (Risco Moderado - Amarelo): Situação de alerta."),
                new Paragraph("• 75-100 (Condição Satisfatória - Verde): Situação favorável (proteção)."),
                new Paragraph({ text: "" }),

                // 3. VISÃO GERAL
                createHeading1("3. VISÃO GERAL DOS RESULTADOS"),
                new Paragraph({
                    children: [
                        new ImageRun({
                            data: chartImage,
                            transformation: { width: 500, height: 400 },
                            type: "png"
                        })
                    ],
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: "" }),

                // 4. DETALHAMENTO
                createHeading1("4. DETALHAMENTO POR DOMÍNIO"),
                createResultsTable(scores),

                new Paragraph({ text: "" }),

                // 5. DIAGNÓSTICO
                createHeading1("5. DIAGNÓSTICO E INTERPRETAÇÃO"),
                ...generateDiagnosis(scores)
            ]
        }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Diagnostico_COPSOQ_${(personData.name || 'Funcionario').replace(/\s/g, '_')}_${Date.now()}.docx`);
}

// --- Helpers ---
function createHeading1(text) { return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }); }
function createFieldLine(label, value) { return new Paragraph({ children: [new TextRun({ text: label + " ", bold: true }), new TextRun(value)] }); }

function createResultsTable(scores) {
    const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: "fixed", // Ensure columns don't collapse on mobile
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 40, type: WidthType.PERCENTAGE },
                        children: [new Paragraph({ text: "Domínio", bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER })],
                        shading: { fill: "3498DB", type: ShadingType.CLEAR },
                        borders: { top: border, bottom: border, left: border, right: border }
                    }),
                    new TableCell({
                        width: { size: 25, type: WidthType.PERCENTAGE },
                        children: [new Paragraph({ text: "Pontuação", bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER })],
                        shading: { fill: "3498DB", type: ShadingType.CLEAR },
                        borders: { top: border, bottom: border, left: border, right: border }
                    }),
                    new TableCell({
                        width: { size: 35, type: WidthType.PERCENTAGE },
                        children: [new Paragraph({ text: "Classificação", bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER })],
                        shading: { fill: "3498DB", type: ShadingType.CLEAR },
                        borders: { top: border, bottom: border, left: border, right: border }
                    })
                ]
            }),
            ...Object.values(scores).map(d => new TableRow({
                children: [
                    new TableCell({
                        width: { size: 40, type: WidthType.PERCENTAGE },
                        children: [new Paragraph(d.nome)],
                        borders: { top: border, bottom: border, left: border, right: border }
                    }),
                    new TableCell({
                        width: { size: 25, type: WidthType.PERCENTAGE },
                        children: [new Paragraph({ text: d.media.toString(), alignment: AlignmentType.CENTER })],
                        borders: { top: border, bottom: border, left: border, right: border }
                    }),
                    new TableCell({
                        width: { size: 35, type: WidthType.PERCENTAGE },
                        children: [new Paragraph({ text: d.classificacao, alignment: AlignmentType.CENTER, color: "FFFFFF", bold: true, size: 20 })], // Size reduced slightly for fit
                        shading: { fill: d.cor.replace('#', ''), type: ShadingType.CLEAR },
                        borders: { top: border, bottom: border, left: border, right: border }
                    })
                ]
            }))
        ]
    });
}

function generateDiagnosis(scores) {
    const paragraphs = [];
    const critical = Object.values(scores).filter(d => d.media < 50);

    if (critical.length > 0) {
        paragraphs.push(new Paragraph("Fatores de Atenção Prioritária (Alto Risco):"));
        critical.forEach(d => {
            paragraphs.push(new Paragraph({
                children: [
                    new TextRun({ text: `• ${d.nome} (${d.media}): `, bold: true }),
                    new TextRun("Nível crítico. Requer investigação das causas organizacionais e intervenção imediata.")
                ]
            }));
        });
    } else {
        paragraphs.push(new Paragraph("A avaliação indica um ambiente psicossocial predominantemente saudável, com a maioria dos domínios em níveis satisfatórios."));
    }
    return paragraphs;
}

async function generateRadarChart(labels, data) {
    return new Promise((resolve) => {
        const width = 800;
        const height = 600; // Taller for radar
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pontuação',
                    data: data,
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    pointBackgroundColor: 'rgba(52, 152, 219, 1)',
                }]
            },
            options: {
                animation: false,
                responsive: false,
                scales: {
                    r: { min: 0, max: 100, ticks: { stepSize: 20 } }
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
