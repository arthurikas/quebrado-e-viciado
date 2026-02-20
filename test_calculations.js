const calculator = require('./calculations.js');

console.log("=== Testing Normalizze Calculation Engine (Full Protocol) ===");

// 1. Test PROART (Scales 1-4)
// Scale 1: 19 items / 13
// Scale 2: 21 items / 21
// Scale 3: 28 items / 28
// Scale 4: 23 items / 23

// Helper to generate mock scores
const mockScores = (count, val) => new Array(count).fill(val);

const mockProart = {
    scale1: mockScores(19, 3), // Sum=57. 57/13 = 4.38
    scale2: mockScores(21, 2), // Sum=42. 42/21 = 2.00
    scale3: mockScores(28, 4), // Sum=112. 112/28 = 4.00
    scale4: mockScores(23, 1)  // Sum=23. 23/23 = 1.00
};

console.log("\n[PROART Test]");
console.log("Input: Uniform scores [Scale1:3, Scale2:2, Scale3:4, Scale4:1]");
const proartResults = calculator.calculateProart(mockProart);
console.log("Results:", proartResults);

// Validations
console.assert(proartResults.scale1_organization === 4.38, "Scale 1 Error");
console.assert(proartResults.scale2_management === 2.00, "Scale 2 Error");
console.assert(proartResults.scale3_suffering === 4.00, "Scale 3 Error");
console.assert(proartResults.scale4_damages === 1.00, "Scale 4 Error");


// 2. Test AEP Compliance (6 Categories)
// Postura, Mobiliario, Ambiente, Organizacao, Transporte, Maquinas
// "Sim" (1), "Não" (0), "NA" (1 - Neutral/Non-Punitive)

const mockAep = {
    posture: ["Sim", "Sim", "Não", "Sim"], // 3/4 = 75%
    furniture: ["Sim", "NA"], // 2/2 = 100%
    environment: ["Não", "Não", "Não"], // 0%
    organization: ["Sim", "Sim", "Sim", "Sim"], // 100%
    transport: ["NA", "NA"], // 2/2 = 100% (Neutrality check)
    machines: ["Não", "Sim", "Não", "Sim"] // 2/4 = 50%
};

console.log("\n[AEP Test]");
console.log("Input:", mockAep);
const aepResults = calculator.calculateAep(mockAep);
console.log("Results:", aepResults);

// Validations
console.assert(aepResults.posture === 75.00, "Posture Error");
console.assert(aepResults.furniture === 100.00, "Furniture Error");
console.assert(aepResults.environment === 0.00, "Environment Error");
console.assert(aepResults.transport === 100.00, "Transport Neutrality Error");
console.assert(aepResults.machines === 50.00, "Machines Error");

console.log("\n=== Test Complete (If no assertions failed above) ===");
