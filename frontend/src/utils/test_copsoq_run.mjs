import { calcularResultadosCopsoq } from './copsoq_calculations.js';

// Mock Data from User Example
// João Silva - Conflito Trabalho-Família (Perguntas 56-58)
/*
| Pergunta | Tipo | Resposta | Cálculo | Pontuação |
| 56. Seu trabalho afeta negativamente sua vida pessoal? | Negativa | 4 | (6-4) × 25 | 50 |
| 57. Você chega em casa cansado(a) demais para atividades pessoais? | Negativa | 5 | (6-5) × 25 | 25 |
| 58. Suas responsabilidades familiares afetam seu desempenho no trabalho? | Negativa | 3 | (6-3) × 25 | 75 |
*/

const mockResponses = {
    56: 4,
    57: 5,
    58: 3,
    // Add dummy values for others so it doesn't crash (logic handles missing, but good to be clean)
};

console.log("Running COPSOQ Logic Verification...");

const results = calcularResultadosCopsoq(mockResponses);
const domainResult = results.dominios['conflito_trabalho_familia'];

console.log("Domain: Conflito Trabalho-Família");
console.log("Expected Mean: 50");
console.log(`Actual Mean: ${domainResult.media}`);
console.log(`Classificacao: ${domainResult.classificacao}`);
console.log(`Cor: ${domainResult.cor}`);

if (domainResult.media === 50 && domainResult.classificacao === 'Risco Moderado') {
    console.log("✅ TEST PASSED");
} else {
    console.error("❌ TEST FAILED");
    process.exit(1);
}
