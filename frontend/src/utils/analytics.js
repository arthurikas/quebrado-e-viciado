import calculator from './calculations';

/**
 * Normalizze BI Analytics Engine
 * Filters and aggregates data based on multi-dimensional criteria.
 */

export const filterData = (dataList, filters) => {
    if (!dataList || dataList.length === 0) return [];

    return dataList.filter(item => {
        // Filter by Sector (if selected)
        if (filters.sectorId) {
            // For COPSOQ evaluations, we just saved 'sector' as text, but for system coherence we might try to match names
            // OR if we start saving IDs. For now, let's assume loose matching if text, or strict if ID.
            const itemSector = item.person.sector;
            // If filter is text (from search)
            if (typeof filters.sectorId === 'string' && isNaN(filters.sectorId)) {
                if (!itemSector || !itemSector.toLowerCase().includes(filters.sectorId.toLowerCase())) return false;
            }
            // If filter is ID (unused for now given we only capture text in COPSOQ form, but ready)
            else if (item.person.sectorId && item.person.sectorId !== filters.sectorId) {
                return false;
            }
        }

        // Filter by Role
        // Similar logic: COPSOQ saves text role.
        if (filters.roleId) {
            const itemRole = item.person.role;
            if (typeof filters.roleId === 'string' && isNaN(filters.roleId)) { // text search
                if (!itemRole || !itemRole.toLowerCase().includes(filters.roleId.toLowerCase())) return false;
            }
        }

        // Filter by Gender
        if (filters.gender && item.person.gender !== filters.gender) return false;

        // Filter by Tenure (Tempo de Casa)
        if (filters.minTenureYears) {
            const tenure = parseFloat(item.person.tenure);
            if (!tenure || tenure < parseFloat(filters.minTenureYears)) return false;
        }

        // Filter by Date Range (Remessas)
        if (filters.startDate || filters.endDate) {
            const itemDate = new Date(item.person.date);
            if (filters.startDate) {
                const start = new Date(filters.startDate);
                if (itemDate < start) return false;
            }
            if (filters.endDate) {
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999); // Include the whole end day
                if (itemDate > end) return false;
            }
        }

        return true;
    });
};

export const aggregateCopsoq = (filteredData) => {
    if (filteredData.length === 0) return null;

    // COPSOQ Domains to aggregate
    const domainSums = {};
    const domainCounts = {};

    filteredData.forEach(item => {
        if (item.results) { // item.results is { key: { media: X, nome: 'Name' } }
            Object.values(item.results).forEach(domain => {
                if (!domainSums[domain.nome]) {
                    domainSums[domain.nome] = 0;
                    domainCounts[domain.nome] = 0;
                }
                domainSums[domain.nome] += domain.media;
                domainCounts[domain.nome]++;
            });
        }
    });

    // Calculate averages
    const averages = {};
    Object.keys(domainSums).forEach(key => {
        averages[key] = parseFloat((domainSums[key] / domainCounts[key]).toFixed(2));
    });

    return averages;
};

export const aggregateAep = (filteredData) => {
    if (filteredData.length === 0) return null;

    const categorySums = {};
    const categoryCounts = {};

    filteredData.forEach(item => {
        if (item.type === 'AEP' && item.scores?.categoryScores) {
            Object.entries(item.scores.categoryScores).forEach(([catId, score]) => {
                const title = getCategoryTitle(catId);
                if (!categorySums[title]) {
                    categorySums[title] = 0;
                    categoryCounts[title] = 0;
                }
                categorySums[title] += score;
                categoryCounts[title]++;
            });
        }
    });

    const averages = {};
    Object.keys(categorySums).forEach(key => {
        averages[key] = parseFloat((categorySums[key] / categoryCounts[key]).toFixed(1));
    });

    return averages;
};

import { AEP_DATA } from './aep_data_v2';

// Helper to look up title
const getCategoryTitle = (id) => {
    let cat = AEP_DATA.administrativo.categories.find(c => c.id === id);
    if (cat) return cat.title;
    cat = AEP_DATA.operacional.categories.find(c => c.id === id);
    if (cat) return cat.title;
    return id;
};

export const generateAepActionPlan = (responsesList) => {
    // Aggregates all "NO" answers
    const actionPlan = [];

    responsesList.forEach(item => {
        if (!item.raw) return;

        Object.entries(item.raw).forEach(([category, answers]) => {
            if (Array.isArray(answers)) {
                answers.forEach((ans, idx) => {
                    const normalized = String(ans).toUpperCase().trim();
                    if (normalized === 'NÃO' || normalized === 'NAO') {
                        // Try to find the specific question text
                        let questionText = `Item #${idx + 1}`;
                        // We need the formType to find the exact text, but if not present, try to find in both
                        // The item.subType should have 'administrativo' or 'operacional'
                        if (item.subType && AEP_DATA[item.subType]) {
                            const catObj = AEP_DATA[item.subType].categories.find(c => c.id === category);
                            if (catObj && catObj.items[idx]) {
                                questionText = catObj.items[idx];
                            }
                        }

                        actionPlan.push({
                            personName: item.person.name,
                            sector: item.person.sector || item.subType || 'N/A',
                            category: getCategoryTitle(category),
                            itemIndex: idx,
                            question: questionText,
                            priority: 'HIGH'
                        });
                    }
                });
            }
        });
    });

    return actionPlan;
};
