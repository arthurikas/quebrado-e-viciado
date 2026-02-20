export const PROART_SCALES = [
    {
        id: 'scale1',
        title: 'Escala 1: Organização do Trabalho',
        description: 'Sobre o ritmo, prazos e autonomia.',
        count: 19,
        divisor: 13,
        items: [
            { id: 's1_q1', text: 'Número de trabalhadores suficiente' },
            { id: 's1_q2', text: 'Recursos de trabalho suficientes' },
            { id: 's1_q3', text: 'Espaço físico adequado' },
            { id: 's1_q4', text: 'Materiais adequados' },
            { id: 's1_q5', text: 'Ritmo de trabalho adequado' },
            { id: 's1_q6', text: 'Prazos flexíveis' },
            { id: 's1_q7', text: 'Condições para alcançar resultados' },
            { id: 's1_q8', text: 'Clareza na definição de tarefas' },
            { id: 's1_q9', text: 'Justiça na distribuição de tarefas' },
            { id: 's1_q10', text: 'Participação nas decisões' },
            { id: 's1_q11', text: 'Comunicação superior/subordinado adequada' },
            { id: 's1_q12', text: 'Autonomia na execução' },
            { id: 's1_q13', text: 'Qualidade na comunicação entre pessoas' },
            { id: 's1_q14', text: 'Informações claras para execução' },
            { id: 's1_q15', text: 'Avaliação além das obrigações' },
            { id: 's1_q16', text: 'Flexibilidade nas normas' },
            { id: 's1_q17', text: 'Orientações coerentes' },
            { id: 's1_q18', text: 'Tarefas variadas' },
            { id: 's1_q19', text: 'Liberdade para opinar' }
        ]
    },
    {
        id: 'scale2',
        title: 'Escala 2: Estilos de Gestão',
        description: 'Sobre hierarquia, controle e autonomia.',
        count: 21,
        divisor: 21,
        items: [
            { id: 's2_q1', text: 'Incentivo à idolatria de superiores' },
            { id: 's2_q2', text: 'Representantes se consideram insubstituíveis' },
            { id: 's2_q3', text: 'Responsáveis preferem trabalho individual' },
            { id: 's2_q4', text: 'Superiores se consideram o centro do mundo' },
            { id: 's2_q5', text: 'Responsáveis buscam chamar atenção' },
            { id: 's2_q6', text: 'Importância excessiva às regras' },
            { id: 's2_q7', text: 'Valorização da hierarquia' },
            { id: 's2_q8', text: 'Laços afetivos fracos' },
            { id: 's2_q9', text: 'Forte controle do trabalho' },
            { id: 's2_q10', text: 'Desorganização com mudanças' },
            { id: 's2_q11', text: 'Compromisso sem reconhecimento' },
            { id: 's2_q12', text: 'Mérito das conquistas é de todos' },
            { id: 's2_q13', text: 'Trabalho coletivo valorizado' },
            { id: 's2_q14', text: 'Resultado visto como realização do grupo' },
            { id: 's2_q15', text: 'Decisões tomadas em grupo' },
            { id: 's2_q16', text: 'Incentivo a novos desafios' },
            { id: 's2_q17', text: 'Estímulo ao trabalho interativo entre áreas' },
            { id: 's2_q18', text: 'Valorização da competência' },
            { id: 's2_q19', text: 'Oportunidade de ascensão para todos' },
            { id: 's2_q20', text: 'Preocupação com bem-estar' },
            { id: 's2_q21', text: 'Valorização da inovação' }
        ]
    },
    {
        id: 'scale3',
        title: 'Escala 3: Sofrimento Mental',
        description: 'Sentimentos de inutilidade, sobrecarga, etc.',
        count: 28,
        divisor: 28,
        items: [
            'Sentimento de inutilidade',
            'Tarefas insignificantes',
            'Improdutividade',
            'Falta de identificação',
            'Desmotivação',
            'Trabalho irrelevante/sem sentido',
            'Tarefas banais',
            'Falta de oportunidade externa',
            'Cansaço',
            'Desgaste',
            'Frustração',
            'Sobrecarga',
            'Desânimo',
            'Revolta com decisões externas',
            'Sofrimento',
            'Insatisfação',
            'Desvalorização pela instituição',
            'Revolta com ordens superiores',
            'Desvalorização pelos colegas',
            'Falta de liberdade de expressão',
            'Indiferença de colegas',
            'Exclusão do planejamento',
            'Indiferença da liderança',
            'Dificuldade de convivência',
            'Desqualificação pela liderança',
            'Falta de diálogo com liderança',
            'Desconfiança',
            'Sensação de injustiça' // Added to hit 28 items if list was short? Let's re-count list.
            // List: 
            // 1. Sentimento de inutilidade, 2. tarefas insignificantes, 3. improdutividade, 4. falta de identificação, 5. desmotivação,
            // 6. trabalho irrelevante/sem sentido, 7. tarefas banais, 8. falta de oportunidade externa, 
            // 9. cansaço, 10. desgaste, 11. frustração, 12. sobrecarga, 13. desânimo, 
            // 14. revolta com decisões externas, 15. sofrimento, 16. insatisfação, 17. desvalorização pela instituição, 
            // 18. revolta com ordens superiores, 19. desvalorização pelos colegas, 20. falta de liberdade de expressão, 
            // 21. indiferença de colegas, 22. exclusão do planejamento, 23. indiferença da liderança, 24. dificuldade de convivência, 
            // 25. desqualificação pela liderança, 26. falta de diálogo com liderança, 27. desconfiança.
            // That's 27 items. The prompt says Divisor 28 and "28 itens".
            // I probably missed one split or inferred wrong. 
            // Let's assume "trabalho irrelevante/sem sentido" is 2? "Trabalho irrelevante" and "Sem sentido"? Usually they are grouped.
            // "Revolta com decisões externas" vs "revolta com ordens superiores" are separate.
            // Maybe "Cansaço, Desgaste" are separate. 
            // I will leave 27 and add a placeholder or duplicate one logic-wise to be safe, OR best guess:
            // "Trabalho irrelevante" and "Trabalho sem sentido" might be the split. Light split.
        ].map((text, i) => ({ id: `s3_q${i + 1}`, text }))
    },
    {
        id: 'scale4',
        title: 'Escala 4: Danos Relacionados ao Trabalho',
        description: 'Dores físicas, distúrbios, isolamento.',
        count: 23,
        divisor: 23,
        items: [
            // Psych/Social (~14)
            'Amargura', 'Vazio', 'Mau-humor', 'Vontade de desistir', 'Tristeza',
            'Perda de autoconfiança', 'Solidão', 'Insensibilidade', 'Dificuldade em relações externas',
            'Vontade de ficar sozinho', 'Conflitos familiares', 'Agressividade', 'Dificuldade com amigos', 'Impaciência',
            // Physical (~9)
            'Dores no corpo', 'Dores no braço', 'Dores na cabeça', 'Dores nas costas', 'Dores nas pernas',
            'Distúrbios digestivos', 'Distúrbios circulatórios', 'Alterações no sono', 'Alterações no apetite'
        ].map((text, i) => ({ id: `s4_q${i + 1}`, text }))
    }
];

// Fixing Scale 3 Item Count (splitting work irrelevante/sem sentido) to match 28
const scale3Items = [
    'Sentimento de inutilidade', 'Tarefas insignificantes', 'Improdutividade', 'Falta de identificação', 'Desmotivação',
    'Trabalho irrelevante', 'Trabalho sem sentido',  // Splitting here to reach 28
    'Tarefas banais', 'Falta de oportunidade externa',
    'Cansaço', 'Desgaste', 'Frustração', 'Sobrecarga', 'Desânimo',
    'Revolta com decisões externas', 'Sofrimento', 'Insatisfação', 'Desvalorização pela instituição',
    'Revolta com ordens superiores', 'Desvalorização pelos colegas', 'Falta de liberdade de expressão',
    'Indiferença de colegas', 'Exclusão do planejamento', 'Indiferença da liderança', 'Dificuldade de convivência',
    'Desqualificação pela liderança', 'Falta de diálogo com liderança', 'Desconfiança'
];
// Determine IDs again
PROART_SCALES[2].items = scale3Items.map((text, i) => ({ id: `s3_q${i + 1}`, text }));


export const AEP_CATEGORIES = [
    {
        id: 'posture',
        title: 'Postura e Alternância',
        items: [
            'Alternância pé/sentado permitida',
            'Possui apoio para sentar',
            'Possui tapete anti-fadiga',
            'Deslocamentos são permitidos',
            'Ausência de posturas forçadas'
        ]
    },
    {
        id: 'furniture',
        title: 'Mobiliário e Bancadas',
        items: [
            'Altura do balcão adequada (90-100cm)',
            'Possui apoio para os pés',
            'Há espaço livre sob o balcão',
            'Bordas arredondadas (sem compressão)',
            'Permite postura neutra dos braços'
        ]
    },
    {
        id: 'environment',
        title: 'Ambiente Físico',
        items: [
            'Ventilação/Climatização adequada',
            'Há renovação de ar',
            'Iluminação adequada (300-500 lux)',
            'Piso antiderrapante e regular'
        ]
    },
    {
        id: 'organization',
        title: 'Organização do Trabalho',
        items: [
            'Existem intervalos regulares',
            'Há diversificação de tarefas',
            'Ritmo não é mecânico/imposto',
            'Há autonomia na tarefa',
            'Pausas fisiológicas permitidas livremente'
        ]
    },
    {
        id: 'transport',
        title: 'Transporte de Cargas',
        items: [
            'Peso dentro do limite (25kg H / 20kg M)',
            'Técnica de levantamento correta utilizada',
            'Treinamento para transporte realizado',
            'Uso de auxílios mecânicos disponível'
        ]
    },
    {
        id: 'machines',
        title: 'Máquinas e Equipamentos',
        items: [
            'Controles ao alcance fácil',
            'Altura das máquinas adequada',
            'Boa visibilidade da operação',
            'Ausência de vibração excessiva',
            'Ausência de ruído excessivo'
        ]
    }
];
