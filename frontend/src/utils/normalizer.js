export function normalizeString(str) {
    if (!str) return 'Não Informado';
    return str.trim().replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
}

export function normalizeJobTitle(rawRole) {
    if (!rawRole) return 'Não Informado';
    const clean = rawRole.trim().toLowerCase();
    
    // Regras de agrupamento de SST / Técnico em Segurança
    if (/(tecnica|técnica|tecnico|técnico).*(seguran[cç]a)/i.test(clean) || clean.includes('sst')) {
        return 'Técnico em Segurança do Trabalho';
    }

    // Regras de Produção (inclui producao, produsao, etc)
    if (/produ[cçs][aã][o0]/i.test(clean) || clean.includes('producao') || clean.includes('produsao')) {
        return 'Produção';
    }

    if (clean.includes('operador') || clean.includes('operação') || clean.includes('operacao')) return 'Operador';
    if (clean.includes('comandante') || clean.includes('cmd')) return 'Comandante';
    if (clean.includes('auxiliar') || clean.includes('aux')) return 'Auxiliar';
    if (clean.includes('assistente') || clean.includes('ass.')) return 'Assistente';
    if (clean.includes('gerente') || clean.includes('gerencia')) return 'Gerente';
    if (clean.includes('coordenador') || clean.includes('coord')) return 'Coordenador';
    if (clean.includes('motorista') || clean.includes('mot.')) return 'Motorista';
    if (clean.includes('mecanico') || clean.includes('mecânico')) return 'Mecânico';
    if (clean.includes('eletricista') || clean.includes('eletr')) return 'Eletricista';
    if (clean.includes('engenheiro') || clean.includes('eng.')) return 'Engenheiro';
    if (clean.includes('supervisor') || clean.includes('superv')) return 'Supervisor';
    if (clean.includes('analista')) return 'Analista';
    if (clean.includes('lider') || clean.includes('líder')) return 'Líder';
    if (clean.includes('encarregado')) return 'Encarregado';
    if (clean.includes('diretor') || clean.includes('direção')) return 'Diretor';
    
    // Tratamentos genéricos (RH, Administrativo, Comercial) se escritos como cargo
    if (clean.includes('administrativo') || clean.includes('adm')) return 'Administrativo';
    if (clean.includes('comercial') || clean.includes('vendas')) return 'Comercial';
    if (clean.includes('rh') || clean.includes('recursos')) return 'Recursos Humanos';

    // Fallback: Apenas arruma capitalização (Title Case)
    return normalizeString(rawRole);
}

export function normalizeSector(rawSector) {
    if (!rawSector) return 'Não Informado';
    const clean = rawSector.trim().toLowerCase();

    // Regras de agrupamento de setores
    if (clean.includes('administrativo') || clean.includes('adm') || clean.includes('admin')) return 'Administrativo';
    if (clean.includes('operacional') || clean.includes('operaç') || clean.includes('operac')) return 'Operacional';
    if (clean.includes('rh') || clean.includes('recurso') || clean.includes('human')) return 'Recursos Humanos';
    if (clean.includes('ti') || clean.includes('tecnologia') || clean.includes('informát') || clean.includes('informat')) return 'Tecnologia da Informação';
    if (/produ[cçs][aã]o/i.test(clean) || clean.includes('producao') || clean.includes('produsao')) return 'Produção';
    if (clean.includes('manuten') || clean.includes('manutençao') || clean.includes('manuntencao')) return 'Manutenção';
    if (clean.includes('comercial') || clean.includes('vendas')) return 'Comercial';
    if (clean.includes('logistica') || clean.includes('logística')) return 'Logística';
    if (clean.includes('financeiro') || clean.includes('finanças')) return 'Financeiro';
    if (clean.includes('diretoria') || clean.includes('direção')) return 'Diretoria';

    return normalizeString(rawSector);
}
