import { COPSOQ_DOMAINS } from './copsoq_data.js';

// Lista exata de perguntas negativas para inversão
// Inclui todas dos domínios 'negativas' e as perguntas negativas específicas de domínios 'mistas'
const PERGUNTAS_NEGATIVAS = [
    3, 4, 5, 6,             // Demandas Quantitativas
    7, 8,                   // Demandas Cognitivas (Mista: 7,8 neg; 9,10 pos)
    11, 12, 13,             // Demandas Emocionais
    26, 27, 28,             // Conflitos de Papel
    53, 54, 55,             // Insegurança no Trabalho
    56, 57, 58,             // Conflito Trabalho-Família
    59, 61,                 // Burnout (Mista: 59,61 neg; 60 pos)
    62, 63, 64              // Presenteísmo
];

export function calcularPontuacaoQuestao(idPergunta, respostaValor) {
    const valor = parseInt(respostaValor, 10);
    if (isNaN(valor) || valor < 1 || valor > 5) return 0;

    // Se for negativa, inverte: 100 - ((valor - 1) * 25) => Equivalente a (5 - valor) * 25
    // 1(Nunca)=100, 2=75, 3=50, 4=25, 5(Sempre)=0
    if (PERGUNTAS_NEGATIVAS.includes(idPergunta)) {
        return (5 - valor) * 25;
    }

    // Se for positiva: (valor - 1) * 25
    // 1(Nunca)=0, 2=25, 3=50, 4=75, 5(Sempre)=100
    return (valor - 1) * 25;
}

export function calcularResultadosCopsoq(respostas) {
    const resultados = {};
    let somaGeral = 0;
    let countDominios = 0;

    Object.entries(COPSOQ_DOMAINS).forEach(([key, domain]) => {
        let somaDominio = 0;
        let respondidas = 0;

        // Armazena pontuação individual de cada pergunta para debug/detalhe
        const pontuacoes = [];

        domain.perguntas.forEach(id => {
            const resposta = respostas[id];

            if (resposta) {
                const pontuacao = calcularPontuacaoQuestao(id, resposta);
                pontuacoes.push(pontuacao);
                somaDominio += pontuacao;
                respondidas++;
            }
        });

        const media = respondidas > 0 ? somaDominio / respondidas : 0;

        // Classificação e Cor
        let classificacao = '';
        let cor = '';

        // 0-49: Alto Risco (Vermelho)
        // 50-74: Risco Moderado (Amarelo)
        // 75-100: Condição Satisfatória (Verde) - Exceto se invertido, mas a média já considera a inversão da pontuação
        // A interpretação é sempre: Quanto MAIOR a nota final, MELHOR a situação (mais "verde").
        // POIS: Perguntas negativas foram invertidas (Alto estresse -> nota baixa, Baixo estresse -> nota alta).
        // ENTRETANTO, o usuário pediu especificamente:
        // "🔴 RISCO ELEVADO: 0 a 49"
        // "🟢 CONDIÇÃO SATISFATÓRIA: 75 a 100"
        // Isso confirma que a escala final é: 0 = Ruim, 100 = Bom.

        if (media < 50) {
            classificacao = 'Risco Elevado';
            cor = '#E74C3C'; // Vermelho
        } else if (media < 75) {
            classificacao = 'Risco Moderado';
            cor = '#F39C12'; // Laranja/Amarelo
        } else {
            classificacao = 'Condição Satisfatória';
            cor = '#27AE60'; // Verde
        }

        resultados[key] = {
            nome: domain.nome,
            media: parseFloat(media.toFixed(1)),
            classificacao,
            cor,
            pontuacoes
        };

        somaGeral += media;
        countDominios++;
    });

    const mediaGeral = countDominios > 0 ? somaGeral / countDominios : 0;

    return {
        dominios: resultados,
        mediaGeral: parseFloat(mediaGeral.toFixed(1))
    };
}
