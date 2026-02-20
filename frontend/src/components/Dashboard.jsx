import React, { useMemo, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import calculator from '../utils/calculations';
import { AEP_CATEGORIES } from '../utils/questions';
import { filterData, aggregateCopsoq, aggregateAep, generateAepActionPlan } from '../utils/analytics';
import { useCompany } from '../context/CompanyContext';

export default function Dashboard({ evaluationsList = [], onBack }) {
    const { companies = [], activeCompanyId, setActiveCompanyId, activeSectors = [], activeRoles = [] } = useCompany();

    // Local Filter State
    const [filters, setFilters] = useState({
        sectorId: '',
        roleId: '',
        gender: '',
        minTenureYears: '',
        startDate: '',
        endDate: ''
    });

    // 1. Filter Data
    const filteredData = useMemo(() => {
        if (!evaluationsList || evaluationsList.length === 0) return [];
        return filterData(evaluationsList, {
            sectorId: filters.sectorId || null,
            roleId: filters.roleId || null,
            gender: filters.gender || null,
            minTenureYears: filters.minTenureYears ? parseInt(filters.minTenureYears) : null,
            startDate: filters.startDate,
            endDate: filters.endDate
        });
    }, [evaluationsList, filters]);

    // 2. Aggregate COPSOQ for Radar
    const copsoqAggregated = useMemo(() => aggregateCopsoq(filteredData), [filteredData]);

    // 3. Aggregate AEP for Domains
    const aepAggregated = useMemo(() => aggregateAep(filteredData), [filteredData]);
    const aepDomainData = aepAggregated ? Object.entries(aepAggregated).map(([key, value]) => ({
        dominio: key,
        valor: value
    })) : [];

    // Transform for Radar Chart
    const radarData = copsoqAggregated ? Object.entries(copsoqAggregated).map(([key, value]) => ({
        area: key,
        media: value,
        fullMark: 100
    })) : [];

    // 3. AEP Action Plan
    const actionPlan = useMemo(() => generateAepActionPlan(filteredData), [filteredData]);

    // Calculate Global AEP for Gauge
    const aepGlobalAvg = useMemo(() => {
        if (filteredData.length === 0) return 0;
        const aepItems = filteredData.filter(i => i.type === 'AEP');
        if (aepItems.length === 0) return 0;

        const sum = aepItems.reduce((acc, curr) => {
            const val = curr.scores?.score;
            return acc + (val || 0);
        }, 0);
        return parseFloat((sum / aepItems.length).toFixed(2));
    }, [filteredData]);

    const gaugeData = [
        { name: 'Pontuação', value: aepGlobalAvg },
        { name: 'Restante', value: 100 - aepGlobalAvg }
    ];
    const gaugeColor = aepGlobalAvg > 80 ? '#4caf50' : aepGlobalAvg > 50 ? '#ffa726' : '#e53935';

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2>Dashboard BI & Analítico</h2>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        Exibindo médias de {filteredData.length} avaliações filtradas.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" style={{ background: '#546e7a' }} onClick={onBack}>Voltar</button>
                    <button className="btn-primary" onClick={handlePrint}>Exportar PDF</button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card" style={{ marginBottom: '1.5rem', background: '#e8f5e9', border: '1px solid #c8e6c9' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#2e7d32' }}>Filtros de Análise (BI)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Empresa (Contexto Geral)</label>
                        <select
                            className="form-input"
                            value={activeCompanyId}
                            onChange={e => setActiveCompanyId(e.target.value)}
                            style={{ width: '100%', border: '2px solid #2e7d32' }}
                        >
                            <option value="">Todas as Empresas</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.nome || c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Setor (Pesquisar)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Digite o setor..."
                            value={filters.sectorId}
                            onChange={e => setFilters({ ...filters, sectorId: e.target.value })}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Cargo</label>
                        <select className="form-input" value={filters.roleId} onChange={e => setFilters({ ...filters, roleId: e.target.value })}>
                            <option value="">Todos os Cargos</option>
                            {activeRoles.map(r => <option key={r.id} value={r.id}>{r.name || r.nome}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Gênero</label>
                        <select className="form-input" value={filters.gender} onChange={e => setFilters({ ...filters, gender: e.target.value })}>
                            <option value="">Todos</option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Tempo de Casa (Anos +)</label>
                        <select className="form-input" value={filters.minTenureYears} onChange={e => setFilters({ ...filters, minTenureYears: e.target.value })}>
                            <option value="">Qualquer</option>
                            <option value="1">Mais de 1 ano</option>
                            <option value="2">Mais de 2 anos</option>
                            <option value="5">Mais de 5 anos</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>De (Data Início)</label>
                        <input
                            type="date"
                            className="form-input"
                            value={filters.startDate}
                            onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Até (Data Fim)</label>
                        <input
                            type="date"
                            className="form-input"
                            value={filters.endDate}
                            onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>
            </div>

            {/* Responsive Grid for Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                {/* Card 1: Radar PROART Média */}
                <div className="card">
                    <h3>Média Psicossocial (Baseada no COPSOQ II)</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        {radarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="area" />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={6} />
                                    <Radar name="Média Grupo" dataKey="media" stroke="#2e7d32" fill="#2e7d32" fillOpacity={0.6} />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : <p style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Sem dados.</p>}
                    </div>
                    {/* Risco Levels Legend */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                        <span style={{ color: '#e53935' }}>● Alto (0-49)</span>
                        <span style={{ color: '#ffa726' }}>● Médio (50-74)</span>
                        <span style={{ color: '#4caf50' }}>● Baixo (75-100)</span>
                    </div>
                </div>

                {/* Card 2: AEP Gauge Média */}
                <div className="card">
                    <h3>Conformidade Ergonômica Média</h3>
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <PieChart width={200} height={200}>
                            <Pie
                                data={gaugeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                startAngle={180}
                                endAngle={0}
                                dataKey="value"
                            >
                                <Cell key="score" fill={gaugeColor} />
                                <Cell key="empty" fill="#eeeeee" />
                            </Pie>
                        </PieChart>
                        <h1 style={{ marginTop: '-100px', color: gaugeColor }}>{aepGlobalAvg}%</h1>
                        <p style={{ marginTop: '20px' }}>Índice Global do Grupo</p>
                    </div>
                </div>
                {/* Card 3: AEP Domains Breakdown */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h3>Análise de Conformidade por Domínio (AEP)</h3>
                    <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
                        {aepDomainData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={aepDomainData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" domain={[0, 100]} />
                                    <YAxis
                                        type="category"
                                        dataKey="dominio"
                                        width={140}
                                        style={{ fontSize: '11px' }}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                                        {aepDomainData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.valor > 80 ? '#27AE60' : entry.valor > 60 ? '#F39C12' : '#E74C3C'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Sem dados de AEP para exibir o detalhamento.</p>}
                    </div>
                </div>
            </div>

            {/* Card 4: Action Plan */}
            <div className="card" style={{ marginTop: '1.5rem', borderLeft: '4px solid #e53935' }}>
                <h3>Plano de Ação Imediato (AEP)</h3>
                <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Itens reprovados ("Não") que requerem correção.</p>

                {actionPlan.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead style={{ borderBottom: '2px solid #ddd' }}>
                            <tr style={{ textAlign: 'left' }}>
                                <th style={{ padding: '0.5rem' }}>Setor</th>
                                <th style={{ padding: '0.5rem' }}>Colaborador</th>
                                <th style={{ padding: '0.5rem' }}>Categoria</th>
                                <th style={{ padding: '0.5rem' }}>Item (ID)</th>
                                <th style={{ padding: '0.5rem' }}>Prioridade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actionPlan.map((action, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.5rem' }}>{action.sector}</td>
                                    <td style={{ padding: '0.5rem' }}>{action.personName}</td>
                                    <td style={{ padding: '0.5rem' }}>{action.category}</td>
                                    <td style={{ padding: '0.5rem' }}>{action.question || `Item #${action.itemIndex + 1}`}</td>
                                    <td style={{ padding: '0.5rem', fontWeight: 'bold', color: '#d32f2f' }}>ALTA</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: '1rem', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px' }}>
                        Nenhuma não-conformidade crítica encontrada no grupo selecionado.
                    </div>
                )}
            </div>

        </div>
    );
}
