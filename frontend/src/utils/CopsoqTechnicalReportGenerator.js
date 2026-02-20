import { COPSOQ_DOMAINS } from './copsoq_data.js';

/**
 * Generates a Technical COPSOQ II Report in HTML format.
 * Follows strict styling and structural requirements from user prompt.
 */
export function generateCopsoqHtmlReport(results, personData) {
    const scores = results.dominios || results; // Handle different result structures

    // Mapping internal domains to the 18 report domains requested
    const reportDomains = [
        { id: 'demandas_quantitativas', label: 'Demandas Quantitativas' },
        { id: 'demandas_cognitivas', label: 'Demandas Cognitivas' },
        { id: 'demandas_emocionais', label: 'Demandas Emocionais' },
        { id: 'influencia_trabalho', label: 'Influência no Trabalho' },
        { id: 'possibilidades_desenvolvimento', label: 'Possibilidades de Desenvolvimento' },
        { id: 'previsibilidade', label: 'Previsibilidade' },
        { id: 'clareza_papel', label: 'Transparência do Papel' },
        { id: 'reconhecimento', label: 'Recompensas' },
        { id: 'conflitos_papel', label: 'Conflitos de Papel' },
        { id: 'qualidade_lideranca', label: 'Qualidade da Liderança' },
        { id: 'apoio_colegas', label: 'Suporte Social de Colegas' },
        { id: 'apoio_chefia', label: 'Suporte Social de Superiores' },
        { id: 'compromisso_local', label: 'Comunidade Social no Trabalho' },
        { id: 'inseguranca_trabalho', label: 'Insegurança no Trabalho' },
        { id: 'satisfacao_trabalho', label: 'Satisfação no Trabalho' },
        { id: 'conflito_trabalho_familia', label: 'Conflito Trabalho-Família' },
        { id: 'saude_geral', label: 'Saúde Geral' },
        { id: 'burnout', label: 'Sintomas Depressivos' }
    ];

    const tableRowsHtml = reportDomains.map(domain => {
        const data = scores[domain.id] || { media: 0, classificacao: 'N/A', cor: '#888' };
        let obs = '';
        if (data.media < 50) obs = 'Risco elevado detectado. Requer atenção imediata.';
        else if (data.media < 75) obs = 'Nível moderado. Monitoramento sugerido.';
        else obs = 'Condição satisfatória.';

        return `
            <tr>
                <td data-label="DOMÍNIO">${domain.label}</td>
                <td data-label="ÍNDICE MÉDIO" style="text-align: center;">${data.media}</td>
                <td data-label="NÍVEL RISCO" style="background-color: ${data.cor}; color: white; font-weight: bold; text-align: center;">${data.classificacao}</td>
                <td data-label="OBSERVAÇÕES PRINCIPAIS">${obs}</td>
            </tr>
        `;
    }).join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Técnico baseado no COPSOQ II - ${personData.name || 'Empresa'}</title>
    <style>
        body {
            font-family: 'Calibri', 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #000000;
            line-height: 1.6;
        }

        .container {
            max-width: 900px;
            margin: 20px auto;
            background: white;
            padding: 40px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        header {
            text-align: center;
            margin-bottom: 30px;
        }

        header h1 {
            font-size: 24px;
            color: #3A3A3A;
            margin-bottom: 10px;
        }

        .meta-info {
            font-size: 12px;
            color: #232323;
            border-top: 1px solid #ccc;
            padding-top: 5px;
        }

        section {
            margin-bottom: 30px;
        }

        h2 {
            text-transform: uppercase;
            font-weight: bold;
            font-size: 12px;
            color: #3A3A3A;
            margin-top: 0;
            margin-bottom: 12px;
        }

        h3 {
            font-size: 14px;
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 8px;
        }

        p {
            font-size: 11px;
            text-align: justify;
            margin-bottom: 12px;
        }

        ul {
            font-size: 10.5px;
            padding-left: 20px;
            margin-bottom: 12px;
        }

        li {
            margin-bottom: 5px;
        }

        .data-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
        }

        .data-item {
            display: flex;
            justify-content: space-between;
            font-size: 10.5px;
        }

        .data-item b {
            font-weight: 600;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-top: 10px;
        }

        table th, table td {
            border: 1px solid #cccccc;
            padding: 8px;
            text-align: left;
        }

        table th {
            background-color: #f0f0f0;
            text-transform: uppercase;
        }

        .signature {
            text-align: center;
            margin-top: 60px;
            border-top: 1px solid #000;
            display: inline-block;
            width: 300px;
            margin-left: calc(50% - 150px);
            padding-top: 5px;
            font-size: 11px;
        }

        @media screen and (max-width: 768px) {
            .container { padding: 20px; }
            table { font-size: 9px; }
        }

        @media screen and (max-width: 480px) {
            .container { padding: 15px; }
            p { text-align: left; }
            .data-grid { grid-template-columns: 1fr; }
            
            table, thead, tbody, th, td, tr {
                display: block;
            }

            thead tr {
                position: absolute;
                top: -9999px;
                left: -9999px;
            }

            tr { border: 1px solid #ccc; margin-bottom: 10px; }
            
            td {
                border: none;
                border-bottom: 1px solid #eee;
                position: relative;
                padding-left: 50%;
                text-align: right !important;
                background-color: transparent !important;
                color: #000 !important;
            }

            td:before {
                position: absolute;
                top: 8px;
                left: 10px;
                width: 45%;
                padding-right: 10px;
                white-space: nowrap;
                content: attr(data-label);
                text-align: left;
                font-weight: bold;
                text-transform: uppercase;
            }
        }

        @media print {
            body { background: white; }
            .container { box-shadow: none; margin: 0; max-width: 100%; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Relatório Técnico de Riscos Psicossociais com Base na Metodologia COPSOQ II</h1>
            <div class="meta-info">
                Empresa: ${personData.company_name || personData.company || 'Não identificada'} | 
                Avaliador: ${personData.evaluator || 'Responsável Técnico'} | 
                Data: ${new Date(personData.date || Date.now()).toLocaleDateString('pt-BR')}
            </div>
        </header>

        <section>
            <h2>I. INTRODUÇÃO À AVALIAÇÃO PSICOSSOCIAL BASEADA NO COPSOQ II</h2>
            <h3>1.1 Apresentação da Metodologia COPSOQ II</h3>
            <p>
                A gestão dos riscos psicossociais é um componente fundamental da saúde ocupacional moderna. A metodologia baseada no COPSOQ II (Copenhagen Psychosocial Questionnaire) utiliza um instrumento desenvolvido pelo Instituto Nacional de Saúde Ocupacional da Dinamarca para avaliar uma gama multidimensional de fatores psicossociais no trabalho. Sua aplicação é amplamente validada internacionalmente e está em total alinhamento com as diretrizes da <b>NR-1</b> e da norma <b>ISO 45003</b>.
            </p>
            <h3>1.2 Metodologia das Ferramentas Utilizadas</h3>
            <p>
                Este relatório foi elaborado sob a orientação técnica da <b>Engenheira de Segurança do Trabalho Tatiana Coaracy</b>. A metodologia aplicada baseia-se nos pilares da <b>NR-1, ISO 45003 e nas premissas técnicas do COPSOQ II</b>. O instrumento utilizado consiste em 62 questões que cobrem diversos domínios da vida laboral, utilizando a versão brasileira adaptada por <b>Melo & Ferreira (2014)</b>.
            </p>
        </section>

        <section>
            <h2>II. OBJETIVO E ESTRUTURA DO RELATÓRIO TÉCNICO</h2>
            <p>
                Este documento tem como finalidade fornecer um diagnóstico detalhado dos fatores psicossociais que podem impactar a saúde e a produtividade dos trabalhadores. O objetivo é subsidiar a empresa com dados técnicos para a implementação de ações preventivas, garantindo o cumprimento das obrigações legais e a promoção do bem-estar organizacional.
            </p>
        </section>

        <section>
            <h2>III. COMPONENTES ESSENCIAIS DO RELATÓRIO</h2>
            <h3>Identificação da Empresa Avaliada</h3>
            <p>Dados cadastrais da unidade avaliada para correta rastreabilidade do documento.</p>
            <h3>Metodologia Utilizada</h3>
            <p>Descrição técnica do instrumento de coleta e análise estatística dos dados.</p>
            <h3>Responsável Técnico pela Avaliação</h3>
            <p>Identificação do profissional legalmente habilitado pela condução do estudo.</p>
            <h3>Resultados e Recomendações</h3>
            <p>Apresentação dos índices calculados e proposição de medidas de controle.</p>
        </section>

        <section>
            <h2>IV. IDENTIFICAÇÃO DA EMPRESA E RESPONSÁVEL TÉCNICO</h2>
            <h3>4.1 Dados da Empresa Avaliada</h3>
            <div class="data-grid">
                <div class="data-item"><b>Razão Social:</b> <span>${personData.company_name || personData.company || '---'}</span></div>
                <div class="data-item"><b>CNPJ:</b> <span>${personData.cnpj || '---'}</span></div>
                <div class="data-item"><b>Endereço:</b> <span>${personData.address || '---'}</span></div>
                <div class="data-item"><b>Data da Avaliação:</b> <span>${new Date(personData.date || Date.now()).toLocaleDateString('pt-BR')}</span></div>
                <div class="data-item"><b>Setores Avaliados:</b> <span>${personData.sector || 'Geral'}</span></div>
            </div>
            <p>A identificação precisa é vital para o enquadramento legal e histórico da gestão de SST da organização.</p>

            <h3>4.2 RESPONSÁVEL TÉCNICO PELA AVALIAÇÃO</h3>
            <div class="data-grid">
                <div class="data-item"><b>Nome:</b> <span>${personData.evaluator || 'Eng. Tatiana Coaracy'}</span></div>
                <div class="data-item"><b>Registro Profissional:</b> <span>CREA/MTE: ---</span></div>
                <div class="data-item"><b>Especialidade:</b> <span>Engenharia de Segurança do Trabalho/Saúde Ocupacional</span></div>
                <div class="data-item"><b>Contato:</b> <span>contato@normalizze.com.br</span></div>
            </div>
            <p>A avaliação dos riscos psicossociais exige competência técnica e ética, em conformidade com as atribuições dos profissionais especializados.</p>
        </section>

        <section>
            <h2>V. METODOLOGIA E PERFIL DOS PARTICIPANTES</h2>
            <h3>5.1 Metodologia Utilizada</h3>
            <p>A avaliação baseada no COPSOQ II analisa o ambiente sob a ótica de sete grandes dimensões:</p>
            <ul>
                <li>Exigências quantitativas, cognitivas e emocionais do trabalho</li>
                <li>Grau de influência e autonomia no trabalho</li>
                <li>Qualidade das relações sociais e suporte</li>
                <li>Clareza de papel e conflitos</li>
                <li>Insegurança no emprego</li>
                <li>Reconhecimento, justiça e confiança</li>
                <li>Indicadores de saúde e bem-estar</li>
            </ul>
        </section>

        <section>
            <h2>VI. RESULTADOS POR DOMÍNIO PSICOSSOCIAL</h2>
            <p>Abaixo são apresentados os resultados obtidos por meio da aplicação do instrumento. Os índices variam de 0 a 100, onde 100 representa a melhor condição possível em termos de proteção à saúde.</p>
            
            <table>
                <thead>
                    <tr>
                        <th>DOMÍNIO</th>
                        <th style="text-align: center;">ÍNDICE MÉDIO</th>
                        <th style="text-align: center;">NÍVEL RISCO</th>
                        <th>OBSERVAÇÕES PRINCIPAIS</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRowsHtml}
                </tbody>
            </table>
        </section>

        <section>
            <h2>VII. RECOMENDAÇÕES E PLANO DE AÇÃO</h2>
            <p>
                Com base nos resultados críticos (vermelhos) e moderados (amarelos) identificados na tabela acima, recomenda-se:
            </p>
            <ul>
                <li>Revisão dos fluxos de trabalho e distribuição de carga para reduzir as demandas quantitativas.</li>
                <li>Programas de treinamento para lideranças visando a melhoria da qualidade do suporte e feedback.</li>
                <li>Implementação de canais transparentes de comunicação para aumentar a previsibilidade e confiança na organização.</li>
                <li>Fortalecimento das políticas de reconhecimento e justiça interna.</li>
            </ul>
        </section>

        <section>
            <h2>VIII. CONCLUSÃO</h2>
            <p>
                A presente avaliação sintetiza o panorama atual dos riscos psicossociais na unidade avaliada. Identificou-se que a gestão adequada dos fatores apontados é crucial para a conformidade com a NR-1.
            </p>
            <p>
                As recomendações técnicas aqui propostas seguem as melhores práticas da ISO 45003, visando não apenas o cumprimento legal, mas a sustentabilidade do capital humano da empresa.
            </p>
            <p>
                Recomenda-se a revisão periódica destes indicadores em um intervalo máximo de 12 meses (anual) ou sempre que houver mudanças organizacionais significativas.
            </p>
        </section>

        <div style="margin-top: 60px; text-align: center;">
            <div class="signature">
                Linha para Assinatura<br>
                <b>${personData.evaluator || 'Eng. Tatiana Coaracy'}</b><br>
                Responsável Técnico<br>
                Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}
            </div>
        </div>

        <div class="no-print" style="margin-top: 40px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; cursor: pointer; background: #3A3A3A; color: white; border: none; border-radius: 4px;">Imprimir Relatório</button>
        </div>
    </div>
</body>
</html>
    `;

    // Open report in new window
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
        reportWindow.document.write(htmlContent);
        reportWindow.document.close();
    } else {
        alert('Por favor, permita pop-ups para visualizar o relatório.');
    }
}
