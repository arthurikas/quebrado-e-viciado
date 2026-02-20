/**
 * Normalizze Occupational Health Management System
 * Core Calculation Engine
 */

class HealthRiskCalculator {
    constructor() {
        // PROART Constants based on prompt
        this.PROART_DIVISORS = {
            scale1: 13, // Organization of Work
            scale2: 21, // Management Styles
            scale3: 28, // Mental Suffering
            scale4: 23  // Work-Related Damages
        };
    }

    /**
     * Calculates PROART scores.
     * @param {Object} responses - Object containing arrays of scores (1-5) for each scale.
     * @param {number[]} responses.scale1 - 19 items expected
     * @param {number[]} responses.scale2 - 21 items expected
     * @param {number[]} responses.scale3 - 28 items expected
     * @param {number[]} responses.scale4 - 23 items expected
     * @returns {Object} Calculated averages per scale
     */
    calculateProart(responses) {
        const calculateScale = (items, divisor) => {
            if (!items || items.length === 0) return 0;
            const sum = items.reduce((acc, curr) => acc + curr, 0);
            return parseFloat((sum / divisor).toFixed(2));
        };

        return {
            scale1_organization: calculateScale(responses.scale1, this.PROART_DIVISORS.scale1),
            scale2_management: calculateScale(responses.scale2, this.PROART_DIVISORS.scale2),
            scale3_suffering: calculateScale(responses.scale3, this.PROART_DIVISORS.scale3),
            scale4_damages: calculateScale(responses.scale4, this.PROART_DIVISORS.scale4)
        };
    }

    /**
     * Calculates AEP (Initial Ergonomic Compliance) percentages.
     * @param {Object} categories - Object where keys are categories and values are arrays of answers.
     * Answers can be "SIM", "NAO", "NA" (case insensitive).
     * @returns {Object} Percentages of compliance per category.
     */
    calculateAep(categories) {
        const results = {};

        for (const [category, answers] of Object.entries(categories)) {
            let points = 0;
            const totalItems = answers.length;

            if (totalItems === 0) {
                results[category] = 0;
                continue;
            }

            answers.forEach(ans => {
                const normalized = ans.toUpperCase().trim();
                // "Sim" = 1 point
                // "Não" = 0 points
                // "NA" (Não Aplicável) = 1 point (to not penalize)
                if (normalized === 'SIM' || normalized === 'NA' || normalized === 'N/A') {
                    points += 1;
                }
            });

            // Compliance % = (Points / Total Items) * 100
            results[category] = parseFloat(((points / totalItems) * 100).toFixed(2));
        }

        return results;
    }

    /**
     * Generate Comparison Report Data
     * Crosses PROART risks (Psychosocial) with AEP failures (Ergonomic).
     */
    generateComparativeReport(proartScores, aepScores) {
        // Example logic: High Risk in Scale 1 + Low Compliance in Organization might indicate systemic issues.
        // This is a placeholder for the "Cruzamento" logic requested.

        const report = {
            summary: "Comparative Analysis",
            alerts: []
        };

        // Example Rule: High "Organization of Work" risk (Scale 1 > 3.0) AND Low "Work Organization" compliance (< 70%)
        if (proartScores.scale1_organization > 3.0 && aepScores.organization < 70) {
            report.alerts.push({
                level: "HIGH",
                message: "Critical Correlation: Poor Work Organization (Ergonomic) is likely contributing to High Psychosocial Risk (Scale 1)."
            });
        }

        return report;
    }
}

// Example Usage / Export
export default new HealthRiskCalculator();

/* 
// For Testing in Node.js:
const calculator = require('./calculations.js');

const mockProart = {
    scale1: new Array(19).fill(3), // Sum=57, 57/13 = 4.38
    scale2: new Array(21).fill(2),
    scale3: new Array(28).fill(1),
    scale4: new Array(23).fill(4)
};

const mockAep = {
    posture: ["SIM", "SIM", "NAO", "NA"], // 3 points / 4 items = 75%
    furniture: ["NAO", "NAO"], // 0%
    environment: ["SIM", "SIM"], // 100%
    organization: ["NAO", "NAO", "NAO", "SIM"], // 25%
    transport: ["NA"] // 100%
};

console.log("PROART:", calculator.calculateProart(mockProart));
console.log("AEP:", calculator.calculateAep(mockAep));
*/
