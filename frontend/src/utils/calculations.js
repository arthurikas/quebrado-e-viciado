/**
 * Normalizze Occupational Health Management System
 * Core Calculation Engine
 */

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
     * @returns {Object} Calculated averages and risk levels per scale
     */
    calculateProart(responses) {
        const calculateScale = (items, divisor) => {
            if (!items || items.length === 0) return { score: 0, level: 'LOW', color: '#4caf50' };
            const sum = items.reduce((acc, curr) => acc + curr, 0);
            const average = parseFloat((sum / divisor).toFixed(2));

            // Risk Levels: 1.00-2.29 (Low), 2.30-3.69 (Medium), 3.70-5.00 (High)
            let level = 'LOW'; // Baixo
            let color = '#4caf50'; // Green

            if (average >= 3.70) {
                level = 'HIGH'; // Alto
                color = '#e53935'; // Red
            } else if (average >= 2.30) {
                level = 'MEDIUM'; // Médio
                color = '#ffa726'; // Orange/Yellow
            }

            return { score: average, level, color };
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
     * Answers can be "Sim", "Não", "NA" (case insensitive).
     * @returns {Object} Percentages of compliance per category.
     */
    calculateAep(categories) {
        const results = {};
        let totalItemsGlobal = 0;
        let totalPointsGlobal = 0;

        for (const [category, answers] of Object.entries(categories)) {
            let points = 0;
            const totalItems = answers.length;

            if (totalItems === 0) {
                results[category] = 0;
                continue;
            }

            answers.forEach(ans => {
                const normalized = String(ans).toUpperCase().trim();
                // "Sim" = 1 point
                // "Não" = 0 points
                // "NA" (Não Aplicável) = 1 point (to not penalize)
                if (normalized === 'SIM' || normalized === 'NA' || normalized === 'N/A') {
                    points += 1;
                    totalPointsGlobal += 1;
                }
                totalItemsGlobal += 1;
            });

            // Compliance % = (Points / Total Items) * 100
            results[category] = parseFloat(((points / totalItems) * 100).toFixed(2));
        }

        // Global KPI
        const globalCompliance = totalItemsGlobal > 0
            ? parseFloat(((totalPointsGlobal / totalItemsGlobal) * 100).toFixed(2))
            : 0;

        return { ...results, global: globalCompliance };
    }

    /**
     * Generate Critical Alerts
     * @param {Object} proartResponsesRaw - Map of { scaleId: { itemId: value } }
     * @param {Object} aepResponsesRaw - Map of { categoryId: [values] }
     * @param {Array} proartQuestions - Full question structure to lookup text
     * @param {Array} aepQuestions - Full checklist structure to lookup text
     */
    generateAlerts(proartResponsesRaw, aepResponsesRaw, proartQuestions, aepQuestions) {
        const alerts = [];

        // 1. PROART: Scale 3 (Suffering) items with score 5 (Always)
        const sufferingScale = proartQuestions.find(s => s.id === 'scale3');
        if (sufferingScale && proartResponsesRaw['scale3']) {
            sufferingScale.items.forEach(q => {
                const val = proartResponsesRaw['scale3'][q.id];
                if (val === 5) {
                    alerts.push({
                        type: 'PROART',
                        level: 'CRITICAL',
                        message: `Sofrimento Mental Crítico: "${q.text}" (Sempre)`
                    });
                }
            });
        }

        // 2. AEP: Critical Safety Items with "Não" (0)
        // We define critical items conceptually or by text match for this demo
        // Examples: "Ritmo", "Treinamento", "Proteções"
        const criticalKeywords = ['treinamento', 'proteções', 'ritmo', 'choque', 'perigo', 'risco'];

        aepQuestions.forEach(cat => {
            const catResps = aepResponsesRaw[cat.id] || [];
            cat.items.forEach((itemText, idx) => {
                const ans = catResps[idx];
                const normalizedAns = String(ans).toUpperCase().trim();

                if (normalizedAns === 'NÃO' || normalizedAns === 'NAO') {
                    // Check if critical
                    const isCritical = criticalKeywords.some(kw => itemText.toLowerCase().includes(kw));
                    if (isCritical) {
                        alerts.push({
                            type: 'AEP',
                            level: 'SAFETY',
                            message: `Risco Ergonômico/Segurança: "${itemText}" (Não Conforme)`
                        });
                    }
                }
            });
        });

        return alerts;
    }
}

export default new HealthRiskCalculator();
