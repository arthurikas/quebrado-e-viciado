export function normalizeString(str) {
    if (!str) return 'Não Informado';
    return str.trim().replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
}

export function normalizeJobTitle(rawRole) {
    if (!rawRole) return 'Não Informado';
    const clean = rawRole.trim().toLowerCase();
    
    // Regras de agrupamento de SST / Técnico em Segurança
    if (
        clean.includes('sst') || 
        clean.includes('tecnica em seguran') || 
        clean.includes('tecnico em seguran') || 
        clean.includes('técnica em seguran') || 
        clean.includes('técnico em seguran')
    ) {
        return 'Técnico em Segurança do Trabalho';
    }

    // Outros possíveis agrupamentos podem ser adicionados aqui
    if (clean.includes('operador')) return 'Operador';
    if (clean.includes('comandante')) return 'Comandante';
    if (clean.includes('auxiliar')) return 'Auxiliar';
    if (clean.includes('assistente')) return 'Assistente';
    if (clean.includes('gerente')) return 'Gerente';
    if (clean.includes('coordenador')) return 'Coordenador';

    // Fallback: Apenas arruma capitalização (Title Case)
    return normalizeString(rawRole);
}

export function normalizeSector(rawSector) {
    if (!rawSector) return 'Não Informado';
    const clean = rawSector.trim().toLowerCase();

    // Regras de agrupamento de setores
    if (clean.includes('administrativo') || clean.includes('adm')) return 'Administrativo';
    if (clean.includes('operacional') || clean.includes('operação')) return 'Operacional';
    if (clean.includes('rh') || clean.includes('recursos humanos')) return 'Recursos Humanos';
    if (clean.includes('ti') || clean.includes('tecnologia')) return 'TI';

    return normalizeString(rawSector);
}
