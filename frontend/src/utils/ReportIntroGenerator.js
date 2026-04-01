import { Paragraph, TextRun, AlignmentType, PageBreak, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun } from 'docx';

function b64ToBytes(base64) {
    const clean = base64.split(',')[1];
    const binary = window.atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

export function buildTechnicalReportIntro(companyName, demographicData, domainsData, sectorMap, globalBarChartImage) {
    const blocks = [];

    const P = (runs, o = {}) => {
        blocks.push(new Paragraph({
            children: runs.map(r => new TextRun({ text: r.t, bold: r.b, size: o.s || 22, color: o.c || '000000' })),
            alignment: o.align || AlignmentType.LEFT,
            spacing: { before: o.before !== undefined ? o.before : 120, after: o.after !== undefined ? o.after : 120 },
            keepNext: o.keepNext,
            keepLines: o.keepLines
        }));
    };

    const T = (text, bold = false) => ({ t: text, b: bold });

    const todayDate = new Date().toLocaleDateString('pt-BR');

    // Capa
    P([T('Relatório Técnico Riscos Psicossociais com Base na Ferramenta COPSOQ II', true)], { s: 36, align: AlignmentType.CENTER, before: 1200, after: 800 });
    P([T(`Empresa: `, true), T(companyName || '[Nome da Empresa]'), T(`   Avaliador: `, true), T(`[Nome do Avaliador]`), T(`   Data da Avaliação: `, true), T(`${todayDate}`)], { align: AlignmentType.CENTER, after: 1200 });

    blocks.push(new Paragraph({ children: [new PageBreak()] }));

    // 1. INTRODUÇÃO
    P([T('1. INTRODUÇÃO AVALIAÇÃO PSICOSSOCIAL COM O COPSOQ II', true)], { s: 28, before: 240, after: 160 });
    P([T('1.1 Apresentação do COPSOQ II', true)], { s: 24, before: 160, after: 120 });
    P([T('A gestão eficaz dos riscos psicossociais no ambiente laboral tornou-se uma exigência crescente no contexto atual das relações de trabalho. O COPSOQ II (Copenhagen Psychosocial Questionnaire) representa uma ferramenta científica robusta e internacionalmente validada para a avaliação sistemática dos fatores que impactam diretamente o bem-estar psicológico e a saúde mental dos trabalhadores.')]);
    P([T('Este instrumento foi desenvolvido pelo Instituto Nacional de Saúde Ocupacional da Dinamarca e tem sido adaptado para diversos países, incluindo o Brasil. Sua principal vantagem reside na abordagem multidimensional que permite identificar, quantificar e comparar diferentes aspectos do ambiente psicossocial do trabalho, possibilitando intervenções precisas e fundamentadas em evidências científicas.')]);
    P([T('A metodologia COPSOQ II contempla diversas dimensões do trabalho, incluindo exigências laborais, organização e conteúdo do trabalho, relações sociais e liderança, interface trabalho- indivíduo, valores no local de trabalho, personalidade, saúde e bem-estar. Esta estrutura abrangente permite uma análise holística dos fatores que podem contribuir para o adoecimento ou para a promoção da saúde mental no ambiente laboral.')]);
    P([T('A implementação do COPSOQ II nas organizações brasileiras representa um avanço significativo na promoção da saúde ocupacional, permitindo o cumprimento das diretrizes estabelecidas pela Norma Regulamentadora n° 1 (NR-1), especialmente no que tange ao Gerenciamento de Riscos Ocupacionais (GRO) em sua dimensão psicossocial, além de estar alinhada com as recomendações da ISO 45003, que trata especificamente da gestão de riscos psicossociais em sistemas de gestão de saúde e segurança ocupacional.')]);

    P([T('1.2 Metodologia das Ferramentas utilizadas', true)], { s: 24, before: 240, after: 120 });
    P([T('O presente relatório e ferramentas de Avaliação dos Riscos Psicossociais foi elaborado e organizado pela “Engenheira de Segurança do Trabalho Tatiana Coaracy, com revisão técnica do Engenheiro Carlos Rogério C. Santos, e produção editorial pela Labor Treinamentos, conforme descrito em sua ficha técnica”.')]);
    P([T('“A metodologia adotada é baseada nas diretrizes da Norma Regulamentadora nº 1 (NR-1), nas recomendações da ISO 45003 e em ferramentas conceituais do modelo COPSOQ II (Copenhagen Psychosocial Questionnaire)”, amplamente reconhecido como referência internacional na avaliação dos fatores psicossociais do trabalho.')]);
    P([T('O instrumento de avaliação aplicado, composto por 62 questões, foi estruturado no âmbito deste material, a partir da integração de diferentes dimensões psicossociais do trabalho, tomando como referência a estrutura conceitual do COPSOQ II e a literatura científica correlata, incluindo a “versão brasileira atribuída a Melo & Ferreira (2011) como base teórica”.')]);
    P([T('O questionário contempla múltiplos domínios relacionados às exigências do trabalho, organização e conteúdo das atividades, relações sociais e liderança, interface trabalho–indivíduo, valores organizacionais, saúde e bem-estar, possibilitando uma avaliação sistematizada dos fatores psicossociais presentes no ambiente laboral.')]);
    P([T('A utilização de um instrumento próprio, fundamentado em modelos reconhecidos e alinhado às exigências normativas brasileiras, permite às organizações realizar a gestão dos riscos psicossociais de forma estruturada, coerente com o Gerenciamento de Riscos Ocupacionais (GRO) e com as boas práticas nacionais e internacionais em Saúde e Segurança do Trabalho.')]);

    // 2. OBJETIVO
    P([T('2. OBJETIVO E ESTRUTURA DO RELATÓRIO TÉCNICO', true)], { s: 28, before: 360, after: 160 });
    P([T('O presente relatório técnico tem como finalidade primordial apresentar, de maneira clara, objetiva e cientificamente fundamentada, os resultados obtidos através da aplicação sistemática do “questionário basedado nas ferramentas COPSOQ II, NR01 e ISO 45003 em ambientes organizacionais”. Esta ferramenta possibilita a identificação precisa de áreas críticas que demandam intervenção imediata, permitindo o desenvolvimento de estratégias eficazes para a mitigação dos riscos psicossociais identificados.')]);
    P([T('Além de seu valor diagnóstico, este relatório constitui um documento técnico fundamental para atender às exigências legais estabelecidas pela Norma Regulamentadora n° 1 (NR-1), particularmente no que concerne ao Gerenciamento de Riscos Ocupacionais (GRO). A partir de 2020, com a atualização desta norma, tornou-se obrigatória a inclusão dos riscos psicossociais no programa de gerenciamento de riscos das organizações, elevando significativamente a importância de instrumentos como o COPSOQ II no contexto da saúde e segurança ocupacional brasileira.')]);

    // 3. COMPONENTES
    P([T('3. COMPONENTES ESSENCIAIS DO RELATÓRIO', true)], { s: 28, before: 360, after: 160 });
    P([T('Identificação da Empresa Avaliada', true)]);
    P([T('Seção contendo dados cadastrais completos, incluindo razão social, CNPJ, endereço, data da avaliação e detalhamento dos setores submetidos ao processo avaliativo.')]);
    
    P([T('Metodologia Utilizada', true)]);
    P([T('Descrição detalhada baseada nas diretrizes da Norma Regulamentadora nº 1 (NR-1), nas recomendações da ISO 45003 e em ferramentas conceituais do modelo COPSOQ (Copenhagen Psychosocial Questionnaire) aplicada, incluindo as escalas utilizadas, processo de coleta de dados, garantias de anonimato e confidencialidade, além dos critérios de pontuação adotados.')]);
    
    P([T('Responsável Técnico pela Avaliação', true)]);
    P([T('Informações sobre o profissional que conduziu o processo, incluindo formação, registro profissional, especialidade e dados para contato, garantindo a rastreabilidade e responsabilidade técnica.')]);
    
    P([T('Resultados e Recomendações', true)]);
    P([T('Apresentação sistemática dos dados obtidos por domínio psicossocial, análise global dos resultados, recomendações técnicas específicas e conclusões que orientarão as intervenções necessárias.')]);
    
    P([T('A estruturação metodológica deste relatório visa não apenas documentar os achados da avaliação, mas também fornecer um roteiro prático para a implementação de melhorias, monitoramento continuo e reavaliações periódicas, consolidando um ciclo de melhoria contínua na gestão dos riscos psicossociais organizacionais.')]);

    // 4. IDENTIFICAÇÃO E SETORES
    const sectorPercents = [];
    for (const [name, arr] of Object.entries(sectorMap)) {
        const pct = ((arr.length / demographicData.totalRespondents) * 100).toFixed(1);
        sectorPercents.push(`${name} (${pct}%)`);
    }

    P([T('4. IDENTIFICAÇÃO DA EMPRESA E RESPONSÁVEL TÉCNICO', true)], { s: 28, before: 240, after: 160 });
    P([T('4.1 Dados da Empresa Avaliada', true)], { s: 24, before: 160, after: 120 });
    
    P([T('Razão Social: ', true), T(companyName || '[Nome da Empresa]')]);
    P([T('CNPJ: ', true), T('[XX.XXX.XXX/0001-XX]')]);
    P([T('Endereço: ', true), T('[Rua, n°, Bairro, Cidade/UF]')]);
    P([T('Data da Avaliação: ', true), T(`${todayDate}`)]);
    P([T('Setores Avaliados: ', true), T(Object.keys(sectorMap).join(', ') || '[Setores]')]);
    
    P([T('A identificação precisa da empresa e dos setores avaliados é fundamental para a contextualização adequada dos resultados obtidos. Cada organização possui características específicas que influenciam diretamente os fatores psicossociais presentes em seu ambiente, como porte, ramo de atividade, estrutura hierárquica e cultura organizacional. Estas informações permitem uma análise mais acurada dos dados e a proposição de intervenções alinhadas com a realidade específica da instituição.')]);
    P([T('Recomenda-se que a avaliação seja conduzida contemplando todos os setores da organização ou, quando isso não for viável, utilizando uma amostragem estatisticamente significativa que represente adequadamente a diversidade de funções, cargos e ambientes de trabalho existentes. Esta abordagem abrangente possibilita a identificação de problemas específicos de determinados setores, bem como questões sistêmicas que permeiam toda a organização.')]);

    P([T('4.2 RESPONSÁVEL TÉCNICO PELO AVALIAÇÃO', true)], { s: 24, before: 240, after: 120 });
    P([T('Nome: ', true), T('[Nome Completo]')]);
    P([T('Registro Profissional: ', true), T('[Conselho e número]')]);
    P([T('Especialidade: ', true), T('[Segurança do Trabalho / Psicologia / Medicina do Trabalho]')]);
    P([T('Contato: ', true), T('[E-mail / Telefone]')]);

    P([T('O profissional responsável pela aplicação e análise do questionario baseado COPSOQ II deve possuir formação específica em áreas relacionadas à saúde e segurança do trabalho, psicologia organizacional ou medicina do trabalho. É fundamental que este profissional tenha conhecimento aprofundado sobre a ferramenta, sua metodologia de aplicação e interpretação dos resultados, para garantir a validade científica e a relevância prática das conclusões apresentadas.')]);
    P([T('A atuação do responsável técnico deve observar rigorosamente os princípios éticos relacionados à confidencialidade dos participantes, à análise imparcial dos dados e à proposição de recomendações baseadas em evidências. Este profissional desempenha papel crucial na condução de todo o processo, desde o planejamento da aplicação até a elaboração do relatório final e acompanhamento das intervenções implementadas.')]);

    // 5. METODOLOGIA
    P([T('5. METODOLOGIA E PERFIL DOS PARTICIPANTES', true)], { s: 28, before: 240, after: 160 });
    P([T('5.1 Metodologia Utilizada', true)], { s: 24, before: 160, after: 120 });
    P([T('A avaliação dos fatores psicossociais foi conduzida com base na versão brasileira adaptada e validada do Copenhagen Psychosocial Questionnaire (COPSOQ II). Este instrumento foi selecionado por sua robustez científica, abrangência temática e adaptabilidade a diferentes contextos organizacionais, características que o tornam particularmente adequado para o cenário laboral brasileiro.')]);
    P([T('O questionário com base no COPSOO II abrange múltiplas dimensões psicossociais através de escalas específicas que contemplam aspectos como:')]);
    P([T('• Exigências quantitativas, cognitivas e emocionais do trabalho')]);
    P([T('• Influência no trabalho, possibilidades de desenvolvimento, sentido do trabalho')]);
    P([T('• Clareza e conflitos de papel, previsibilidade')]);
    P([T('• Reconhecimento e recompensa, apoio-social chefia, colegas')]);
    P([T('• Feedback sobre o trabalho, Qualidade liderança, justiça organizacional')]);
    P([T('• Comprometimento com o local de trabalho, insegurança no trabalho')]);
    P([T('• Conflito trabalho-família, Saúde bem-estar, presenteísmo')]);
    P([T('A aplicação do questionário seguiu rigorosamente os protocolos metodológicos estabelecidos, garantindo o anonimato e a voluntariedade dos respondentes. Foram realizadas sessões preparatórias para esclarecer os objetivos da avaliação, a importância da participação sincera e o compromisso com a confidencialidade das respostas individuais.')]);
    P([T('A coleta de dados foi realizada em formato digital, em período previamente acordado com a gestão da empresa para minimizar interferências nas atividades regulares. O tempo médio estimado para preenchimento completo do questionário foi de aproximadamente 10 a 20 minutos.')]);
    P([T('A análise dos dados seguiu os critérios de pontuação definidos pelo protocolo oficial com base no COPSOQ ll, com as devidas adaptações para a realidade nacional brasileira. Os resultados foram estratificados por domínios psicossociais e setores organizacionais, permitindo uma visualização clara dos pontos críticos que demandam intervenção prioritária.')]);

    P([T('5.2 Perfil dos Participantes', true)], { s: 24, before: 240, after: 120 });
    P([T('Total de Respondentes: ', true), T(`${demographicData.totalRespondents} (100% da amostra coletada)`)]);
    P([T('Distribuição por Sexo: ', true), T(`Masculino: ${demographicData.pctM}% | Feminino: ${demographicData.pctF}%`)]);
    P([T('Faixa Etária Média: ', true), T(`${demographicData.avgAge || 0} anos (variando de ${demographicData.minAge || 0} a ${demographicData.maxAge || 0} anos)`)]);
    P([T('Tempo Médio de Empresa: ', true), T(`${demographicData.avgTime || 0} anos (variando de ${demographicData.minTime || 0} a ${demographicData.maxTime || 0} anos)`)]);
    P([T('Setores Representados: ', true), T(`${sectorPercents.join(', ')}`)]);

    // 6. RESULTADOS POR DOMINIO PSICOSSOCIAL
    P([T('6. RESULTADOS POR DOMÍNIO PSICOSSOCIAL', true)], { s: 28, before: 240, after: 160 });
    P([T('A análise detalhada dos resultados obtidos através da aplicação do Questionario baseado no COPSOQ II permite identificar os principais fatores de risco psicossocial presentes no ambiente organizacional. Cada domínio foi avaliado segundo a metodologia padronizada do instrumento, classificando os resultados em três níveis de risco: baixo (situação favorável), médio (situação intermediária que demanda atenção) e alto (situação de risco que exige intervenção imediata).')]);
    
    // Tabela Sec 6
    const tableRows = [
        new TableRow({
            children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'DOMÍNIO', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'ÍNDICE MÉDIO', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'NÍVEL RISCO', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'OBSERVAÇÕES PRINCIPAIS', bold: true })] })] }),
            ],
            tableHeader: true
        })
    ];

    for (const d of domainsData) {
        const riskLevelStr = d.avgScore >= 75 ? 'Baixo' : d.avgScore >= 50 ? 'Médio' : 'Alto';
        
        const total = d.totalRespondents || 1;
        const pctA = Math.round(((d.riskCounts?.Alto || 0) / total) * 100);
        const pctM = Math.round(((d.riskCounts?.Médio || 0) / total) * 100);
        const pctB = Math.round(((d.riskCounts?.Baixo || 0) / total) * 100);

        let obs = "";
        if (pctA === 100) obs = "Cenário de alerta máximo: 100% da amostra encontra-se em Alto Risco.";
        else if (pctB === 100) obs = "Cenário excelente: 100% da amostra encontra-se em zona de segurança (Baixo Risco).";
        else if (pctA >= 50) obs = `Atenção crítica: a maioria (${pctA}%) manifesta Alto Risco. O Risco Médio abrange ${pctM}% e apenas ${pctB}% relatam Baixo Risco.`;
        else if (pctB >= 50) obs = `Cenário majoritariamente positivo, com ${pctB}% em Baixo Risco. No entanto, o Alto Risco afeta ${pctA}% e o Risco Médio ${pctM}%.`;
        else if (pctM >= 50) obs = `Predominância de Risco Médio (${pctM}%), exigindo monitoramento preventivo. O Alto Risco afeta ${pctA}% dos respondentes.`;
        else obs = `Distribuição da amostra: ${pctA}% em Alto Risco, ${pctM}% em Médio e ${pctB}% em Baixo Risco.`;

        tableRows.push(new TableRow({
            children: [
                new TableCell({ children: [new Paragraph({ text: d.nome })] }),
                new TableCell({ children: [new Paragraph({ text: d.avgScore.toFixed(1) })] }),
                new TableCell({ children: [new Paragraph({ text: riskLevelStr })] }),
                new TableCell({ children: [new Paragraph({ text: obs })] }),
            ]
        }));
    }

    blocks.push(new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" }
        }
    }));
    blocks.push(new Paragraph({ spacing: { after: 300 } }));


    // 8. ANALISE GLOBAL
    P([T('8. ANÁLISE GLOBAL DOS RESULTADOS', true)], { s: 28, before: 360, after: 160 });
    P([T('A integração dos dados obtidos em todos os domínios psicossociais avaliados permite uma visão sistêmica dos fatores de risco presentes na organização. Esta análise global é fundamental para identificar relações causais entre diferentes aspectos do ambiente laboral e estabelecer prioridades para as intervenções necessárias.')]);

    if (globalBarChartImage) {
        blocks.push(new Paragraph({
            children: [
                new ImageRun({
                    data: b64ToBytes(globalBarChartImage),
                    transformation: { width: 600, height: 260 },
                    type: 'png',
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
        }));
    }

    P([T('A análise geral dos resultados demonstra que os principais fatores de risco psicossocial estão concentrados em três domínios prioritários:')], { before: 240, after: 240 });

    const priorityList = [
        "8.1 Demandas Quantitativas:", "8.2 Demandas Cognitivas:", "8.3 Demandas Emocionais:", "8.4 Influência no Trabalho:",
        "8.5 Possibilidades de Desenvolvimento:", "8.6 Sentido do Trabalho:", "8.7 Clareza de Papel:", "8.8 Previsibilidade:",
        "8.9 Reconhecimento e Recompensa:", "8.10 Apoio Social – Chefia:", "8.11 Apoio Social – Colegas:", "8.12 Feedback sobre o Trabalho:",
        "8.13 Qualidade de Liderança:", "8.14 Justiça Organizacional:", "8.15 Comprometimento com o Local de Trabalho:", "8.16 Insegurança no Trabalho:",
        "8.17 Conflito Trabalho-Família:", "8.18 Saúde e Bem-Estar:", "8.19 Presenteísmo:"
    ];

    priorityList.forEach(item => P([T(item)]));

    // 9. PADRÕES CROSS
    P([T('9. ADICIONALMENTE, FORAM IDENTIFICADOS PADRÕES RELEVANTES NA ANÁLISE CRUZADA DOS DADOS:', true)], { s: 28, before: 240, after: 160 });
    P([T('• Correlação significativa entre baixos índices de qualidade da liderança e elevados níveis de estresse nas equipes subordinadas, especialmente nos departamentos [nome dos departamentos];')]);
    P([T('• Relação inversa entre o tempo de empresa e a percepção de reconhecimento, sugerindo possível estagnação na carreira ou falta de mecanismos de valorização da experiência acumulada;')]);
    P([T('• Maior incidência de sintomas de burnout entre profissionais que relatam simultaneamente altas exigências quantitativas e baixo controle sobre os processos de trabalho;')]);
    P([T('• Disparidades importantes entre diferentes unidades/filiais da empresa, indicando possíveis influências de fatores locais de gestão e cultura organizacional.')]);
    P([T('É recomendado priorizar ações imediatas nos três domínios destacados como críticos, especialmente nas equipes [nome dos setores ou funções], onde a combinação de fatores de risco atinge níveis preocupantes e pode comprometer significativamente a saúde dos trabalhadores e os resultados organizacionais.')], { before: 240, after: 240 });

    // 10. RECOMENDACOES
    P([T('10. RECOMENDAÇÕES TÉCNICAS', true)], { s: 28, before: 240, after: 160 });
    P([T('Com base nos resultados obtidos através da aplicação do Questionario baseado COPSOQ II e da análise aprofundada dos fatores de risco psicossocial identificados, recomenda-se a implementação das seguintes medidas interventivas, organizadas por ordem de prioridade e agrupadas por domínios:')]);
    
    P([T('10.1 Ritmo de Trabalho e Exigências Quantitativos', true)], { before: 240, after: 120 });
    P([T('• Realizar análise ergonômica do trabalho (AET) nos setores críticos para dimensionamento adequado de equipes e redistribuição de cargas de trabalho')]);
    P([T('• Revisar metas e indicadores de desempenho, assegurando sua viabilidade e compatibilidade com recursos disponíveis')]);
    P([T('• Implementar pausas programadas durante a jornada, especialmente em atividades de alta concentração ou esforço repetitivo')]);
    P([T('• Desenvolver programa de capacitação em gestão do tempo e priorização de tarefas para colaboradores e lideranças')]);

    P([T('10.2 Exigências Emocionais e Saúde Mental', true)], { before: 240, after: 120 });
    P([T('• Estabelecer programa de suporte psicológico para profissionais expostos a situações de alto impacto emocional')]);
    P([T('• Promover workshops sobre inteligência emocional, resiliência e técnicas de autorregulação')]);
    P([T('• Criar espaços regulares de escuta e acolhimento para processamento de experiências emocionalmente desgastantes')]);

    P([T('10.3 Liderança e Ambiente Organizacional', true)], { before: 240, after: 120 });
    P([T('• Desenvolver programa de capacitação continuada para lideranças, com foco em gestão de pessoas, comunicação eficaz e feedback construtivo')]);
    P([T('• Revisar políticas de reconhecimento e recompensas, incluindo critérios transparentes de progressão de carreira')]);
    P([T('• Implementar práticas de gestão participativa, ampliando a influência dos colaboradores sobre seus processos de trabalho')]);
    P([T('• Fortalecer canais de escuta ativa e comunicação bidirecional entre lideranças e equipes')]);
    P([T('• Implementar rodízio de funções em posições de alto desgaste emocional, quando aplicável')]);

    // 11. RECOMENDACOES GERAIS E CONCLUSOES
    P([T('11. RECOMENDAÇÕES TÉCNICAS GERAIS', true)], { s: 28, before: 360, after: 160 });
    P([T('Estas medidas devem ser integradas ao Plano de Ação do Programa de Gerenciamento de Riscos (PGR), conforme exigido pela NR-01, com definição clara de responsáveis, prazos, recursos necessários e indicadores de acompanhamento. Recomenda-se ainda que a implementação seja conduzida de forma participativa, envolvendo representantes de diferentes níveis hierárquicos e setores da organização.')]);
    P([T('Para assegurar a efetividade das intervenções, sugere-se a realização de avaliações periódicas utilizando o mesmo instrumento Baseado no (COPSOQ II) em intervalos de 24 meses, permitindo o monitoramento da evolução dos indicadores e os ajustes necessários nas estratégias adotadas.')]);
    P([T('Observação.: Monitorar indicadores internos (absenteísmo, rotatividade, afastamentos por transtornos mentais) para definir a necessidade de reaplicação fora do ciclo padrão.')]);
    P([T('Reaplicação antecipada:', true)]);
    P([T('• Quando há mudanças organizacionais significativas, como:')]);
    P([T('  o Reestruturações')]);
    P([T('  o Demissões em massa')]);
    P([T('  o Novos processos ou tecnologias')]);
    P([T('  o Mudança de gestão')]);
    P([T('  o Aumento expressivo de adoecimentos por transtornos mentais ou absenteísmo por CID F')]);

    // 12. CONCLUSAO
    P([T('12. CONCLUSÃO', true)], { s: 28, before: 240, after: 160 });
    P([T('Os resultados obtidos com a aplicação do Questionario baseado no COPSOQ II na ')] , { keepNext: true });
    // Since paragraphs are split with simple text block, I'll merge directly:
    blocks.pop();
    P([
        T('Os resultados obtidos com a aplicação do Questionario baseado no COPSOQ II na '),
        T(companyName || '[Nome da Empresa]', true),
        T(' evidenciam pontos de atenção significativos no que tange aos fatores de risco psicossocial presentes no ambiente organizacional. A predominância de riscos relacionados ao ritmo de trabalho, exigências quantitativas e aspectos emocionais demanda uma abordagem sistemática e integrada, que contemple tanto aspectos organizacionais quanto individuais.')
    ]);
    P([T('A gestão eficaz destes fatores de risco não apenas contribui para o cumprimento das exigências legais estabelecidas pela NR-01 e recomendações da ISO 45003, mas representa um investimento estratégico na saúde e bem-estar dos colaboradores, com impactos positivos diretos na produtividade, qualidade, retenção de talentos e clima organizacional.')]);
    P([T('A atuação preventiva, baseada nos dados apresentados neste relatório, possibilita a construção de um ambiente de trabalho mais saudável, equilibrado e propício ao desenvolvimento humano e organizacional. Ressalta-se que o presente diagnóstico representa o ponto de partida de um ciclo continuo de avaliação e melhoria, que deve ser incorporado à cultura e às práticas de gestão da organização.')]);

    P([T('Relatório elaborado por: [Nome do profissional] - [Registro Profissional]')], { before: 360, after: 120 });
    P([T(`Data: ${todayDate}`)]);

    return blocks;
}
