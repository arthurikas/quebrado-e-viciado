import React, { useMemo, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import calculator from '../utils/calculations';
import { AEP_CATEGORIES } from '../utils/questions';
import { filterData, aggregateCopsoq, aggregateAep, generateAepActionPlan } from '../utils/analytics';
import { useCompany } from '../context/CompanyContext';

export default function Dashboard({ evaluationsList = [], onBack }) {
    const { companies = [], activeCompanyId, setActiveCompanyId, activeSectors = [], activeRoles = [] } = useCompany();
    const [activeTab, setActiveTab] = useState('charts'); // 'charts', 'action-plan', 'history'

    // Local Filter State
    const [filters, setFilters] = useState({
        assessmentType: '', // '', 'COPSOQ', 'AEP'
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
            type: filters.assessmentType || null,
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
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Tipo de Avaliação</label>
                        <select
                            className="form-input"
                            value={filters.assessmentType}
                            onChange={e => setFilters({ ...filters, assessmentType: e.target.value })}
                            style={{ width: '100%', border: '2px solid #2e7d32' }}
                        >
                            <option value="">Todos os Tipos</option>
                            <option value="COPSOQ">COPSOQ (Psicossocial)</option>
                            <option value="AEP">AEP (Ergonômica)</option>
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

            {/* Tab Bar */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.5rem' }}>
                <button
                    onClick={() => setActiveTab('charts')}
                    style={{
                        padding: '0.75rem 1.5rem', background: 'transparent', border: 'none',
                        borderBottom: activeTab === 'charts' ? '3px solid #1b4d3e' : 'none',
                        color: activeTab === 'charts' ? '#1b4d3e' : '#666', fontWeight: 600, cursor: 'pointer'
                    }}
                >
                    Resumo Gráfico
                </button>
                <button
                    onClick={() => setActiveTab('action-plan')}
                    style={{
                        padding: '0.75rem 1.5rem', background: 'transparent', border: 'none',
                        borderBottom: activeTab === 'action-plan' ? '3px solid #d32f2f' : 'none',
                        color: activeTab === 'action-plan' ? '#d32f2f' : '#666', fontWeight: 600, cursor: 'pointer'
                    }}
                >
                    Plano de Ação Imediato (AEP)
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{
                        padding: '0.75rem 1.5rem', background: 'transparent', border: 'none',
                        borderBottom: activeTab === 'history' ? '3px solid #2e7d32' : 'none',
                        color: activeTab === 'history' ? '#2e7d32' : '#666', fontWeight: 600, cursor: 'pointer'
                    }}
                >
                    Histórico de Aplicações
                </button>
            </div>

            {/* Tab Content */}
            <div key={`stage-${activeTab}`} style={{ position: 'relative', minHeight: '300px' }}>
                {/* 1. Charts Tab */}
                {activeTab === 'charts' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {/* Radar PROART */}
                        <div className="card">
                            <h3>Média Psicossocial (COPSOQ II)</h3>
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
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                                <span style={{ color: '#e53935' }}>● Alto (0-49)</span>
                                <span style={{ color: '#ffa726' }}>● Médio (50-74)</span>
                                <span style={{ color: '#4caf50' }}>● Baixo (75-100)</span>
                            </div>
                        </div>

                        {/* AEP Gauge */}
                        <div className="card">
                            <h3>Conformidade Ergonômica Média</h3>
                            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
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
                                <p style={{ marginTop: '20px', fontWeight: 600 }}>Índice Global AEP</p>
                            </div>
                        </div>

                        {/* AEP Domain Breakdown */}
                        <div className="card" style={{ gridColumn: 'span 2' }}>
                            <h3>Conformidade por Domínio (AEP)</h3>
                            <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
                                {aepDomainData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={aepDomainData} layout="vertical"
                                            margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis type="number" domain={[0, 100]} />
                                            <YAxis type="category" dataKey="dominio" width={140} style={{ fontSize: '11px' }} />
                                            <Tooltip />
                                            <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                                                {aepDomainData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.valor > 80 ? '#27AE60' : entry.valor > 60 ? '#F39C12' : '#E74C3C'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : <p style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Sem dados de detalhamento.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Action Plan Tab */}
                {activeTab === 'action-plan' && (
                    <div className="card" style={{ borderLeft: '6px solid #e53935' }}>
                        <h3 style={{ color: '#d32f2f' }}>Itens Críticos para Correção (AEP)</h3>
                        <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                            Itens respondidos como "Não" que requerem ação imediata.
                        </p>
                        {actionPlan.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead style={{ background: '#f8f9fa' }}>
                                        <tr style={{ textAlign: 'left' }}>
                                            <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Setor</th>
                                            <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Colaborador</th>
                                            <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Categoria</th>
                                            <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Item / Não Conformidade</th>
                                            <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Prioridade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {actionPlan.map((action, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '1rem' }}>{action.sector}</td>
                                                <td style={{ padding: '1rem', fontWeight: 600 }}>{action.personName}</td>
                                                <td style={{ padding: '1rem' }}>{action.category}</td>
                                                <td style={{ padding: '1rem', color: '#334155' }}>
                                                    {action.question || `Item #${action.itemIndex + 1}`}
                                                </td>
                                                <td style={{ padding: '1rem', fontWeight: 'bold', color: '#d32f2f' }}>ALTA</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ padding: '2rem', background: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', textAlign: 'center' }}>
                                ✅ Nenhuma não-conformidade crítica encontrada.
                            </div>
                        )}
                    </div>
                )}

                {/* 3. History Tab */}
                {activeTab === 'history' && (
                    <div className="card" style={{ borderLeft: '6px solid #2e7d32' }}>
                        <h3 style={{ color: '#2e7d32', marginBottom: '1.5rem' }}>Lista de Avaliações (Filtros Atuais)</h3>
                        {filteredData.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {filteredData.map((ev, idx) => (
                                    <div key={idx} style={{
                                        padding: '1rem', border: '1px solid #eee', borderRadius: '8px',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <strong style={{ fontSize: '1rem' }}>{ev.person?.name || ev.person?.nome || 'N/A'}</strong>
                                                <span style={{
                                                    fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '10px',
                                                    background: ev.type === 'AEP' ? '#dcfce7' : '#dbeafe',
                                                    color: ev.type === 'AEP' ? '#166534' : '#1e40af', fontWeight: 600
                                                }}>{ev.type}</span>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                                                {ev.person?.sector} | {ev.person?.role}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                {new Date(ev.timestamp || ev.person?.date).toLocaleDateString('pt-BR')}
                                            </div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: ev.type === 'AEP' ? (ev.scores?.score > 80 ? '#22c55e' : ev.scores?.score > 60 ? '#f59e0b' : '#ef4444') : '#334155' }}>
                                                {ev.type === 'AEP' ? `${ev.scores?.score}%` : 'Concluído'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Nenhuma avaliação encontrada.</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
