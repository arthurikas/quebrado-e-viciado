import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, Header, Footer, AlignmentType, HeadingLevel, PageNumber, BorderStyle, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export async function generateGeneralAnalyticalReport(evaluations, companyName) {
    // 1. Filter and group by Sector
    const copsoqEvals = evaluations.filter(ev => ev.type === 'COPSOQ' && ev.results);
    
    if (copsoqEvals.length === 0) {
        alert("Não há avaliações COPSOQ suficientes para gerar este relatório.");
        return;
    }

    const sectorsMap = {};
    copsoqEvals.forEach(ev => {
        const sector = (ev.person?.sector || 'Sem Setor cadastrado').trim();
        if (!sectorsMap[sector]) sectorsMap[sector] = { evals: [] };
        sectorsMap[sector].evals.push(ev);
    });

    const processedSectors = [];

    // 2. Process data per sector
    for (const [sectorName, sectorData] of Object.entries(sectorsMap)) {
        const evals = sectorData.evals;
        const totalRespondents = evals.length;
        const domainCounts = {};

        evals.forEach(ev => {
            Object.entries(ev.results).forEach(([domainKey, domainResult]) => {
                if (!domainCounts[domainKey]) {
                    domainCounts[domainKey] = {
                        nome: domainResult.nome,
                        alto: 0,
                        medio: 0,
                        baixo: 0,
                        soma: 0,
                        total: 0
                    };
                }
                
                domainCounts[domainKey].soma += domainResult.media;
                domainCounts[domainKey].total += 1;

                if (domainResult.media < 50) {
                    domainCounts[domainKey].alto += 1;
                } else if (domainResult.media < 75) {
                    domainCounts[domainKey].medio += 1;
                } else {
                    domainCounts[domainKey].baixo += 1;
                }
            });
        });

        // Generate pie charts for each domain in this sector
        const domainsArray = Object.values(domainCounts).sort((a,b) => a.nome.localeCompare(b.nome));
        for (const domain of domainsArray) {
            if (domain.total > 0) {
                domain.mediaFinal = (domain.soma / domain.total).toFixed(1);
                const data = [domain.alto, domain.medio, domain.baixo];
                domain.chartImage = await generatePieChart(
                    ['Risco Alto (0-49)', 'Risco Médio (50-74)', 'Baixo Risco (75-100)'], 
                    data,
                    ['#E74C3C', '#F39C12', '#27AE60']
                );
            }
        }

        processedSectors.push({
            sectorName,
            totalRespondents,
            domains: domainsArray
        });
    }

    // Sort sectors alphabetically
    processedSectors.sort((a, b) => a.sectorName.localeCompare(b.sectorName));

    // 3. Assemble DOCX
    const docChildren = [
        new Paragraph({ text: "Relatório Analítico Geral de Riscos Psicossociais", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: `Empresa: ${companyName || 'Não identificada'}`, heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
        new Paragraph({ text: `Total de avaliações processadas globais: ${copsoqEvals.length}`, alignment: AlignmentType.CENTER, spacing: { after: 600 } }),
    ];

    for (const sector of processedSectors) {
        // Sector Header
        docChildren.push(
            new Paragraph({ text: `Setor: ${sector.sectorName.toUpperCase()}`, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
            new Paragraph({ text: `${sector.totalRespondents} respostas contabilizadas.`, italics: true, spacing: { after: 200 } })
        );

        // We will render domains in a 2-column table to save space if possible, or just sequentially.
        // Let's do sequentially to ensure large charts are visible.
        for (const domain of sector.domains) {
            docChildren.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `${domain.nome} `, bold: true, size: 28 }),
                        new TextRun({ text: `(Média do Setor: ${domain.mediaFinal})`, size: 24, color: "555555" })
                    ],
                    spacing: { before: 200, after: 100 }
                })
            );

            if (domain.chartImage) {
                docChildren.push(
                    new Paragraph({
                        children: [new ImageRun({ data: getChartBytes(domain.chartImage), transformation: { width: 400, height: 250 }, type: "png" })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 300 }
                    })
                );
            }
        }
        
        // Add a page break after each sector except the last one could be nice, 
        // but let's just use standard spacing so it flows naturally.
        docChildren.push(new Paragraph({ text: "", spacing: { after: 600 } }));
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
                        new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Relatório Geral - Normalizze", size: 20, color: "7F8C8D" })] })
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("Página "), new TextRun({ children: [PageNumber.CURRENT] })] })]
                })
            },
            children: docChildren
        }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Relatorio_Geral_${companyName ? companyName.replace(/\s+/g, '_') : 'Empresa'}_${Date.now()}.docx`);
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

async function generatePieChart(labels, data, colors) {
    return new Promise((resolve) => {
        const width = 800;
        const height = 500; 
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                animation: false,
                responsive: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: { size: 24 } // Larger font for DOCX readability
                        }
                    }
                }
            }
        });
        
        // Ensure rendering is fully complete
        setTimeout(() => {
            const base64 = canvas.toDataURL('image/png');
            chart.destroy();
            resolve(base64);
        }, 100);
    });
}
