export const AEP_DATA = {
    operacional: {
        title: "AEP Operacional",
        total: 38,
        categories: [
            {
                id: "postura_alternancia",
                title: "Postura e alternância",
                items: [
                    "Existe opção de alternância entre ficar em pé e sentado",
                    "Atividade realizada predominantemente em pé",
                    "Apoio para sentar disponível e com uso permitido (banco tipo sela, apoio isquiático, etc.)",
                    "Tapetes ou pisos anti-fadiga disponíveis nas áreas em pé prolongado",
                    "Possibilidade de realizar pequenos deslocamentos ou mudanças de postura",
                    "Atividades não exigem posturas forçadas ou sustentadas (inclinar, torcer, abaixar constantemente)"
                ]
            },
            {
                id: "mobiliario_bancadas",
                title: "Mobiliário e Bancadas/Balcões",
                items: [
                    "Altura do balcão adequada à atividade (≈ 90–100 cm para atividades médias; ≤ 85 cm para pesadas; ≥ 100 cm para leves)",
                    "Possui apoio para os pés embutido ou externo no balcão",
                    "Espaço suficiente sob o balcão para permitir aproximação do corpo",
                    "Borda do balcão não causa compressão nas pernas ou braços",
                    "Bancada permite postura neutra dos braços (ombros relaxados, cotovelos próximos ao corpo)"
                ]
            },
            {
                id: "ambiente_fisico",
                title: "Ambiente Físico",
                items: [
                    "Ventilação adequada ou climatização (natural ou artificial)",
                    "Renovação do ar suficientes",
                    "Iluminação adequada à atividade (mínimo 300 a 500 lux, conforme exigência da tarefa)",
                    "Piso regular, antiderrapante e sem acúmulo de resíduos"
                ]
            },
            {
                id: "organizacao_trabalho",
                title: "Organização do trabalho",
                items: [
                    "Jornada com intervalos e pausas adequadas",
                    "Diversificação de tarefas (evita repetição contínua e sobrecarga muscular)",
                    "Ritmo de trabalho não é imposto exclusivamente por máquinas",
                    "Autonomia para organizar parte do fluxo de trabalho",
                    "Pausas fisiológicas respeitadas",
                    "Existência de pausas para descanso (inclusive para membros inferiores)"
                ]
            },
            {
                id: "transporte_manual",
                title: "Transporte manual de peso",
                items: [
                    "Existência limite de peso definido para o transporte manual de cargas, considerando as características dos trabalhadores (sexo, idade, etc.)",
                    "Existência de relatos “fadiga físico ou desconforto térmico",
                    "Existência de sugestões de melhoria para conforto no posto."
                ]
            },
            {
                id: "maquinas_equipamentos",
                title: "Máquinas, Equipamentos e Transporte de peso",
                items: [
                    "Controles e dispositivos estão ao alcance sem necessidade de esticar o corpo",
                    "Exigência de força excessiva ou movimentos repetitivo",
                    "Altura das máquinas permite operação com postura neutra",
                    "Área de trabalho iluminada e com visibilidade adequada",
                    "Equipamentos com vibração ou ruído excessivo",
                    "Existência de espaço para movimentação segura e sem obstáculos"
                ]
            },
            {
                id: "existe_transporte",
                title: "Existe transporte manual de cargas",
                items: [
                    "Existe transporte manual de cargas?",
                    "Existência de consideração Norma ISO 11228-1 (Até 25kg H / 20kg M)",
                    "Existência de movimentação manual frequente ou em posturas inadequadas",
                    "A frequência de transporte manual e distância percorrida são adequadas",
                    "Utilização de auxílios mecânicos (carrinhos, paleteiras, etc.)",
                    "Existência de técnica adequada de levantamento manual de peso",
                    "Existência de treinamento para movimentação manual de peso",
                    "Existência de cinto de segurança lombar para movimentação manual de peso"
                ]
            }
        ]
    },
    administrativo: {
        title: "AEP Administrativo",
        total: 55,
        categories: [
            {
                id: "mesa",
                title: "Mesa",
                items: [
                    "Altura adequada à atividade em geral, 72-75 cm adulto)",
                    "Espaço suficiente para teclado, mouse e outros materiais",
                    "Permite apoio dos antebraços sem tensionar ombros",
                    "Bordas arredondadas e sem superfície cortante",
                    "Permite posicionamento ergonômicos dos equipamentos"
                ]
            },
            {
                id: "cadeira",
                title: "Cadeira",
                items: [
                    "Altura do assento ajustável",
                    "Encosto anatômico e ajuste de inclinação",
                    "Encosto adequado à região lombar",
                    "Possui recurso giratório",
                    "Estofado com tecido \"respirável\"",
                    "Conformação e profundidade do assento adequados",
                    "Borda frontal arredondada",
                    "Estabilidade (mínimo 5 rodízios)",
                    "Posição do assento permite apoio total dos pés no chão ou apoio",
                    "Apoio dorsal com regulagem de inclinação",
                    "Apoio para os braços com ajuste de altura"
                ]
            },
            {
                id: "espaco_layout",
                title: "Espaço físico e layout",
                items: [
                    "Espaço suficiente para livre movimentação dos pés",
                    "Área de circulação desobstruída",
                    "Espaço suficiente para organização dos equipamentos",
                    "Fios desorganizados no chão",
                    "Estação de trabalho compatível com estatura do usuário"
                ]
            },
            {
                id: "laptop",
                title: "Laptop / Notebook",
                items: [
                    "Uso de suporte para elevar a tela",
                    "Uso de teclado e mouse sobressalentes",
                    "Posicionamento ergonômico e teclado e mouse"
                ]
            },
            {
                id: "postura",
                title: "Postura de trabalho",
                items: [
                    "Coluna ereta, sem curvaturas forçadas",
                    "Antebraços apoiados sobra a superfície (ângulo 90° a 100°)",
                    "Joelhos (ângulo 90°) com pés apoiados no chão)",
                    "Cabeça alinhada ao tronco, sem flexão",
                    "Punhos neutros sem extensão ou flexão",
                    "Ombros relaxados"
                ]
            },
            {
                id: "organizacao_pausas",
                title: "Organização de trabalho / pausas",
                items: [
                    "Jornada com pausas regulares",
                    "Diversificação de tarefas",
                    "Trabalho com cobrança excessiva de terceiros",
                    "Autonomia para organizar a própria rotina de trabalho",
                    "Pausas ativas orientadas ou incentivadas",
                    "Intervalos para alimentação e descanso"
                ]
            },
            {
                id: "apoio_pes",
                title: "Apoio para os pés",
                items: [
                    "Necessário quando os pés não tocam totalmente o chão",
                    "Antiderrapante",
                    "Regulagem de inclinação",
                    "Adequado a estatura do usuário",
                    "Utilizado pelo usuário"
                ]
            },
            {
                id: "monitor",
                title: "Monitor (tela computador)",
                items: [
                    "Altura da borda superior na linha dos olhos ou ligeiramente abaixo",
                    "Distância dos olhos entre 50 e 70 cm",
                    "Sem reflexos diretos de janelas ou luminárias",
                    "Inclinação ajustável"
                ]
            },
            {
                id: "iluminacao",
                title: "Iluminação",
                items: [
                    "Iluminação geral suficiente (500 lux ou conforme tarefa)",
                    "Ausência de reflexos no monitor",
                    "Luminária de mesa com foco ajustável (se necessário)",
                    "Cortinas ou persianas para controle de luz natural",
                    "Luz direta não incide nos olhos do trabalhador"
                ]
            },
            {
                id: "temperatura",
                title: "Temperatura / conforto",
                items: [
                    "Temperatura do ambiente dentro dos limites de conforto térmico (conforme NR-17: 20ºC a 23ºC para trabalho leve/moderado em ambientes climatizados)"
                ]
            },
            {
                id: "teclado_mouse",
                title: "Teclado / mouse / mouse pad",
                items: [
                    "Mouse próximo ao teclado, na mesma altura",
                    "Mouse pad com apoio para punho (opcional)",
                    "Antebraço apoiado durante uso do mouse",
                    "Teclado posicionado a cerca de 10–15 cm da borda da mesa"
                ]
            }
        ]
    }
};
