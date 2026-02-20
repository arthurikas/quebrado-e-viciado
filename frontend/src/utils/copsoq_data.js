/**
 * Metodologia baseada no COPSOQ II - Copenhagen Psychosocial Questionnaire (Brazilian Version)
 * Data Structure
 */

export const COPSOQ_QUESTIONS = [
    // Demandas Quantitativas (3-6)
    { id: 3, text: "O seu trabalho exige que você trabalhe muito rápido?" },
    { id: 4, text: "Você tem muito trabalho a fazer?" },
    { id: 5, text: "O seu trabalho exige muita concentração?" },
    { id: 6, text: "Você precisa realizar várias tarefas ao mesmo tempo?" },

    // Demandas Cognitivas (7-10)
    { id: 7, text: "O seu trabalho exige que você tome decisões difíceis?" },
    { id: 8, text: "É necessário pensar em muitas coisas ao mesmo tempo?" },
    { id: 9, text: "O seu trabalho exige muita criatividade?" },
    { id: 10, text: "Você precisa aprender coisas novas no seu trabalho?" },

    // Demandas Emocionais (11-13)
    { id: 11, text: "O seu trabalho exige que você esconda emoções?" },
    { id: 12, text: "Você lida com situações emocionalmente difíceis?" },
    { id: 13, text: "O seu trabalho afeta o seu estado emocional?" },

    // Influência no Trabalho (14-16)
    { id: 14, text: "Você tem influência sobre como realiza o seu trabalho?" },
    { id: 15, text: "Você pode decidir a ordem das suas tarefas?" },
    { id: 16, text: "Você pode decidir o seu ritmo de trabalho?" },

    // Possibilidades de Desenvolvimento (17-19)
    { id: 17, text: "Você tem a possibilidade de aprender coisas novas?" },
    { id: 18, text: "Seu trabalho permite desenvolver suas habilidades?" },
    { id: 19, text: "Você sente que seu trabalho contribui para seu crescimento pessoal?" },

    // Significado do Trabalho (20-22)
    { id: 20, text: "Você sente que o seu trabalho é importante?" },
    { id: 21, text: "Você sente orgulho do seu trabalho?" },
    { id: 22, text: "O seu trabalho faz sentido para você?" },

    // Clareza de Papel (23-25)
    { id: 23, text: "Você sabe exatamente quais são suas responsabilidades?" },
    { id: 24, text: "Você sabe quais decisões pode tomar sozinho(a)?" },
    { id: 25, text: "As tarefas atribuídas a você são claras?" },

    // Conflitos de Papel (26-28)
    { id: 26, text: "Você recebe tarefas contraditórias?" },
    { id: 27, text: "É necessário fazer coisas que você acha desnecessárias?" },
    { id: 28, text: "É necessário negligenciar uma tarefa para cumprir outra?" },

    // Previsibilidade (29-31)
    { id: 29, text: "Você é informado com antecedência sobre mudanças que afetam seu trabalho?" },
    { id: 30, text: "Você sabe o que acontecerá em seu trabalho nas próximas semanas?" },
    { id: 31, text: "As mudanças na empresa são comunicadas claramente?" },

    // Reconhecimento (32-34)
    { id: 32, text: "Você recebe reconhecimento suficiente pelo seu trabalho?" },
    { id: 33, text: "Seu trabalho é valorizado pela chefia?" },
    { id: 34, text: "Seu trabalho é reconhecido pelos colegas?" },

    // Apoio Social - Chefia (35-37)
    { id: 35, text: "Você recebe ajuda da sua chefia quando necessário?" },
    { id: 36, text: "Sua chefia se interessa pelo seu bem-estar?" },
    { id: 37, text: "A chefia trata os trabalhadores com respeito?" },

    // Apoio Social - Colegas (38-40)
    { id: 38, text: "Você recebe apoio dos colegas?" },
    { id: 39, text: "Seus colegas estão dispostos a ouvir seus problemas relacionados ao trabalho?" },
    { id: 40, text: "O ambiente entre os colegas é agradável?" },

    // Feedback (41-43)
    { id: 41, text: "Você recebe retorno sobre o seu desempenho?" },
    { id: 42, text: "Você sabe se está realizando um bom trabalho?" },
    { id: 43, text: "O feedback que você recebe é útil?" },

    // Qualidade da Liderança (44-46)
    { id: 44, text: "Sua chefia é eficiente na gestão do setor?" },
    { id: 45, text: "Sua chefia lida bem com conflitos?" },
    { id: 46, text: "Sua chefia comunica bem as decisões?" },

    // Justiça e Respeito (47-49)
    { id: 47, text: "Você é tratado de forma justa no trabalho?" },
    { id: 48, text: "As decisões são tomadas com imparcialidade?" },
    { id: 49, text: "Os procedimentos da empresa são justos?" },

    // Compromisso com o Local de Trabalho (50-52)
    { id: 50, text: "Você se sente comprometido com sua organização?" },
    { id: 51, text: "Você recomendaria sua empresa como um bom lugar para trabalhar?" },
    { id: 52, text: "Você sente orgulho de pertencer à sua empresa?" },

    // Insegurança no Trabalho (53-55)
    { id: 53, text: "Você teme perder o emprego?" },
    { id: 54, text: "Você acha que será transferido contra sua vontade?" },
    { id: 55, text: "Há risco de reestruturação no seu setor?" },

    // Conflito Trabalho-Família (56-58)
    { id: 56, text: "Seu trabalho afeta negativamente sua vida pessoal?" },
    { id: 57, text: "Você chega em casa cansado(a) demais para atividades pessoais?" },
    { id: 58, text: "Suas responsabilidades familiares afetam seu desempenho no trabalho?" },

    // Burnout (59-61)
    { id: 59, text: "Você sente-se esgotado(a) após o trabalho?" },
    { id: 60, text: "Você dorme bem em noites úteis?" }, // Positiva Invertida no domínio misto
    { id: 61, text: "Você tem dores físicas relacionadas ao trabalho?" },

    // Presenteísmo (62-64)
    { id: 62, text: "Você continua trabalhando mesmo doente?" },
    { id: 63, text: "Você já trabalhou mesmo sem condições físicas ou emocionais?" },
    { id: 64, text: "Você sente que não pode faltar ao trabalho mesmo se precisar?" }
];

export const COPSOQ_DOMAINS = {
    "demandas_quantitativas": {
        nome: "Demandas Quantitativas",
        perguntas: [3, 4, 5, 6],
        tipo: "negativas"
    },
    "demandas_cognitivas": {
        nome: "Demandas Cognitivas",
        perguntas: [7, 8, 9, 10],
        tipo: "mistas" // 7,8 negativas; 9,10 positivas
    },
    "demandas_emocionais": {
        nome: "Demandas Emocionais",
        perguntas: [11, 12, 13],
        tipo: "negativas"
    },
    "influencia_trabalho": {
        nome: "Influência no Trabalho",
        perguntas: [14, 15, 16],
        tipo: "positivas"
    },
    "possibilidades_desenvolvimento": {
        nome: "Possibilidades de Desenvolvimento",
        perguntas: [17, 18, 19],
        tipo: "positivas"
    },
    "significado_trabalho": {
        nome: "Significado do Trabalho",
        perguntas: [20, 21, 22],
        tipo: "positivas"
    },
    "clareza_papel": {
        nome: "Clareza de Papel",
        perguntas: [23, 24, 25],
        tipo: "positivas"
    },
    "conflitos_papel": {
        nome: "Conflitos de Papel",
        perguntas: [26, 27, 28],
        tipo: "negativas"
    },
    "previsibilidade": {
        nome: "Previsibilidade",
        perguntas: [29, 30, 31],
        tipo: "positivas"
    },
    "reconhecimento": {
        nome: "Reconhecimento",
        perguntas: [32, 33, 34],
        tipo: "positivas"
    },
    "apoio_chefia": {
        nome: "Apoio Social - Chefia",
        perguntas: [35, 36, 37],
        tipo: "positivas"
    },
    "apoio_colegas": {
        nome: "Apoio Social - Colegas",
        perguntas: [38, 39, 40],
        tipo: "positivas"
    },
    "feedback": {
        nome: "Feedback",
        perguntas: [41, 42, 43],
        tipo: "positivas"
    },
    "qualidade_lideranca": {
        nome: "Qualidade da Liderança",
        perguntas: [44, 45, 46],
        tipo: "positivas"
    },
    "justica_respeito": {
        nome: "Justiça e Respeito",
        perguntas: [47, 48, 49],
        tipo: "positivas"
    },
    "compromisso_local": {
        nome: "Compromisso com o Local de Trabalho",
        perguntas: [50, 51, 52],
        tipo: "positivas"
    },
    "inseguranca_trabalho": {
        nome: "Insegurança no Trabalho",
        perguntas: [53, 54, 55],
        tipo: "negativas"
    },
    "conflito_trabalho_familia": {
        nome: "Conflito Trabalho-Família",
        perguntas: [56, 57, 58],
        tipo: "negativas"
    },
    "burnout": {
        nome: "Burnout",
        perguntas: [59, 60, 61],
        tipo: "mistas" // 59,61 negativas; 60 positiva
    },
    "presenteismo": {
        nome: "Presenteísmo",
        perguntas: [62, 63, 64],
        tipo: "negativas"
    }
};
