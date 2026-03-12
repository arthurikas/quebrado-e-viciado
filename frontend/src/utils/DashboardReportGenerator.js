import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType, PageNumber } from 'docx';
import { saveAs } from 'file-saver';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export async function generateDashboardReport({
    filteredDataLength,
    appliedFilters,
    copsoqAggregated,
    aepGlobalAvg,
    aepDomainData,
    actionPlan
}) {
    // 1. Generate COPSOQ Radar Chart image
    let radarImage = null;
    if (copsoqAggregated && Object.keys(copsoqAggregated).length > 0) {
        const labels = Object.keys(copsoqAggregated);
        const dataValues = Object.values(copsoqAggregated);
        radarImage = await generateRadarChart(labels, dataValues);
    }

    // 2. Generate AEP Bar Chart image
    let barImage = null;
    if (aepDomainData && aepDomainData.length > 0) {
        const labels = aepDomainData.map(d => d.dominio);
        const dataValues = aepDomainData.map(d => d.valor);
        barImage = await generateBarChart(labels, dataValues);
    }

    const doc = new Document({
        styles: {
            default: { document: { run: { font: "Arial", size: 24 } } }
        },
        sections: [{
            properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Relatório de Dashboard - Normalizze", size: 20, color: "7F8C8D" })] })
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("Página "), new TextRun({ children: [PageNumber.CURRENT] })] })]
                })
            },
            children: [
                new Paragraph({ text: "Dashboard BI & Analítico", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
                new Paragraph({ text: `Total de avaliações processadas: ${filteredDataLength}`, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),

                // FILTERS
                createHeading1("Filtros Aplicados"),
                ...renderFilters(appliedFilters),

                // COPSOQ
                createHeading1("1. Média Psicossocial (COPSOQ II)"),
                ...(radarImage ? [
                    new Paragraph({
                        children: [new ImageRun({ data: getChartBytes(radarImage), transformation: { width: 450, height: 350 }, type: "png" })],
                        alignment: AlignmentType.CENTER
                    })
                ] : [new Paragraph("Sem dados COPSOQ para os filtros selecionados.")]),
                
                // AEP GAUGE / AVERAGE
                createHeading1("2. Conformidade Ergonômica Média (AEP)"),
                new Paragraph({
                    children: [new TextRun({ text: `Índice Global AEP: ${aepGlobalAvg}%`, bold: true, size: 28 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 }
                }),
                
                // AEP DOMAIN
                ...(barImage ? [
                    new Paragraph({
                        children: [new ImageRun({ data: getChartBytes(barImage), transformation: { width: 500, height: 250 }, type: "png" })],
                        alignment: AlignmentType.CENTER
                    })
                ] : [new Paragraph("Sem dados AEP para os filtros selecionados.")]),

                // ACTION PLAN
                createHeading1("3. Plano de Ação Imediato (AEP)"),
                new Paragraph({ text: "Itens Críticos para Correção (respondidos como 'Não' que requerem ação imediata)", italics: true, spacing: { after: 200 } }),
                ...renderActionPlan(actionPlan)
            ]
        }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Relatorio_Dashboard_${Date.now()}.docx`);
}

function getChartBytes(base64Image) {
    const cleanBase64 = base64Image.split(',')[1];
    const binaryString = window.atob(cleanBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function createHeading1(text) { 
    return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }); 
}

function renderFilters(filters) {
    const lines = [];
    const mapping = {
        assessmentType: 'Tipo de Avaliação',
        sector: 'Setor',
        role: 'Cargo',
        gender: 'Gênero',
        minTenureYears: 'Tempo de Casa (mín.)',
        startDate: 'Data Início',
        endDate: 'Data Fim'
    };

    let hasAny = false;
    for (const [key, val] of Object.entries(filters)) {
        if (val) {
            hasAny = true;
            lines.push(new Paragraph({
                children: [
                    new TextRun({ text: `${mapping[key] || key}: `, bold: true }),
                    new TextRun(val.toString())
                ]
            }));
        }
    }
    if (!hasAny) {
        lines.push(new Paragraph("Nenhum filtro específico aplicado (Todos os dados)."));
    }
    return lines;
}

function renderActionPlan(plan) {
    if (!plan || plan.length === 0) {
        return [new Paragraph({ text: "✅ Nenhuma não-conformidade crítica encontrada." })];
    }

    const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
    
    return [
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: "Setor", bold: true })], shading: { fill: "f8f9fa" }, borders: { top: border, bottom: border, left: border, right: border } }),
                        new TableCell({ children: [new Paragraph({ text: "Colaborador", bold: true })], shading: { fill: "f8f9fa" }, borders: { top: border, bottom: border, left: border, right: border } }),
                        new TableCell({ children: [new Paragraph({ text: "Categoria", bold: true })], shading: { fill: "f8f9fa" }, borders: { top: border, bottom: border, left: border, right: border } }),
                        new TableCell({ children: [new Paragraph({ text: "Não Conformidade", bold: true })], shading: { fill: "f8f9fa" }, borders: { top: border, bottom: border, left: border, right: border } }),
                    ]
                }),
                ...plan.map(action => new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph(action.sector || '')], borders: { top: border, bottom: border, left: border, right: border } }),
                        new TableCell({ children: [new Paragraph(action.personName || '')], borders: { top: border, bottom: border, left: border, right: border } }),
                        new TableCell({ children: [new Paragraph(action.category || '')], borders: { top: border, bottom: border, left: border, right: border } }),
                        new TableCell({ children: [new Paragraph(action.question || `Item #${action.itemIndex + 1}`)], borders: { top: border, bottom: border, left: border, right: border } }),
                    ]
                }))
            ]
        })
    ];
}

async function generateRadarChart(labels, data) {
    return new Promise((resolve) => {
        const width = 800;
        const height = 600; 
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Média do Grupo',
                    data: data,
                    backgroundColor: 'rgba(46, 125, 50, 0.2)',
                    borderColor: 'rgba(46, 125, 50, 1)',
                    pointBackgroundColor: 'rgba(46, 125, 50, 1)',
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

async function generateBarChart(labels, data) {
    return new Promise((resolve) => {
        const width = 800;
        const height = 400;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const colors = data.map(v => v < 60 ? '#E74C3C' : v < 80 ? '#F39C12' : '#27AE60');

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Conformidade (%)',
                    data: data,
                    backgroundColor: colors,
                }]
            },
            options: {
                animation: false,
                responsive: false,
                indexAxis: 'y',
                scales: { x: { min: 0, max: 100 } },
                plugins: {
                    legend: { display: false }
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
