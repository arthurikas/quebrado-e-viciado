export const calculateAepScore = (responses, type) => {
    // responses: { categoryId: [ "Sim", "Não", "NA", ... ] }
    // type: 'operacional' | 'administrativo'

    let totalPoints = 0;
    let totalQuestions = 0;
    const categoryScores = {};

    Object.entries(responses).forEach(([catId, answers]) => {
        let catPoints = 0;
        let catTotal = 0;
        let naCount = 0;

        answers.forEach(ans => {
            const normalized = String(ans).toUpperCase().trim();
            if (normalized === 'SIM') {
                catPoints++;
                catTotal++;
            } else if (normalized === 'NÃO' || normalized === 'NAO') {
                // 0 points
                catTotal++;
            } else if (normalized === 'NA' || normalized === 'N/A') {
                naCount++;
                // NA doesn't count towards total
            }
        });

        // Category Score %
        // Avoid division by zero
        const catScore = catTotal > 0 ? (catPoints / catTotal) * 100 : 0;
        categoryScores[catId] = parseFloat(catScore.toFixed(1));

        totalPoints += catPoints;
        totalQuestions += catTotal;
    });

    const globalScore = totalQuestions > 0 ? (totalPoints / totalQuestions) * 100 : 0;
    const finalScore = parseFloat(globalScore.toFixed(1));

    // Risk Classification
    // < 60%: High
    // 60-80%: Medium
    // > 80%: Low
    let riskLevel = '';
    let riskColor = '';

    if (finalScore < 60) {
        riskLevel = 'Alto Risco';
        riskColor = '#E74C3C'; // Red
    } else if (finalScore <= 80) {
        riskLevel = 'Médio Risco';
        riskColor = '#F39C12'; // Orange/Yellow
    } else {
        riskLevel = 'Baixo Risco';
        riskColor = '#27AE60'; // Green
    }

    return {
        score: finalScore,
        riskLevel,
        riskColor,
        categoryScores,
        totalCompliant: totalPoints,
        totalNonCompliant: totalQuestions - totalPoints,
        countQuestions: totalQuestions
    };
};
