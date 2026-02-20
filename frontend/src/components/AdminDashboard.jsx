import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { useCompany } from '../context/CompanyContext';
import { Building2, Users, TrendingUp, List } from 'lucide-react';

export default function AdminDashboard({ onNavigate }) {
    const { setActiveCompanyId } = useCompany();
    const [stats, setStats] = useState({
        totalEmpresas: 0,
        empresasAtivas: 0,
        totalColaboradores: 0,
        colaboradoresAtivos: 0
    });
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Buscar empresas com contagem de avaliações (dados reais persistidos)
            const { data: empresasData, error: empresasError } = await supabase
                .from('empresas')
                .select(`
                    *,
                    evaluations(count)
                `)
                .order('nome');

            if (empresasError) throw empresasError;
            setEmpresas(empresasData || []);

            // Estatísticas rápidas - Total de avaliações no sistema
            const { count: totalAvaliacoes, error: countError } = await supabase
                .from('evaluations')
                .select('*', { count: 'exact', head: true });

            if (countError) throw countError;

            setStats({
                totalEmpresas: empresasData?.length || 0,
                empresasAtivas: empresasData?.filter(e => e.ativo)?.length || 0,
                totalColaboradores: totalAvaliacoes || 0,
                colaboradoresAtivos: totalAvaliacoes || 0
            });
        } catch (error) {
            console.error('Erro ao carregar dados do admin:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, title, value, subtitle, color, onClick }) => (
        <div
            onClick={onClick}
            style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: `2px solid ${color}20`
            }}
            onMouseEnter={(e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                }
            }}
            onMouseLeave={(e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                    background: `${color}15`,
                    padding: '0.75rem',
                    borderRadius: '8px',
                    color: color
                }}>
                    <Icon size={24} />
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 0.5rem' }}>
                        {title}
                    </p>
                    <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333', margin: '0 0 0.25rem' }}>
                        {loading ? '...' : value}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#999', margin: 0 }}>
                        {subtitle}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="card">
            <h2 style={{ marginBottom: '2rem', color: '#1b4d3e', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Building2 size={28} />
                Gestão por Empresa
            </h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <StatCard
                    icon={Building2}
                    title="Empresas Cadastradas"
                    value={stats.totalEmpresas}
                    subtitle={`${stats.empresasAtivas} ativas`}
                    color="#1b4d3e"
                    onClick={() => onNavigate('admin_empresas')}
                />

                <StatCard
                    icon={TrendingUp}
                    title="Engajamento Geral"
                    value={stats.totalColaboradores}
                    subtitle="Total de respostas coletadas"
                    color="#2d6a4f"
                    onClick={() => {
                        setActiveCompanyId(''); // Contexto Geral
                        onNavigate('dashboard');
                    }}
                />
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#333', borderBottom: '2px solid #f0f0f0', paddingBottom: '0.5rem' }}>
                    Selecione uma Empresa para ver Métricas e Diagnósticos
                </h3>

                {loading ? (
                    <p>Carregando empresas...</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        {empresas.map(empresa => (
                            <div
                                key={empresa.id}
                                className="card"
                                style={{
                                    padding: '1.5rem',
                                    border: '1px solid #eee',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}
                                onClick={() => {
                                    setActiveCompanyId(empresa.id);
                                    onNavigate('dashboard');
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#1b4d3e';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#eee';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1b4d3e' }}>{empresa.nome}</h4>
                                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>CNPJ: {empresa.cnpj}</p>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#4caf50', fontWeight: 600 }}>
                                        {empresa.evaluations?.[0]?.count || 0} Avaliações
                                    </span>
                                    <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                        Ver BI
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '1.5rem',
                marginTop: '3rem'
            }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#333' }}>
                    Configurações do Sistema
                </h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        className="btn-primary"
                        onClick={() => onNavigate('admin_empresas')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Building2 size={18} />
                        Gerenciar Empresas
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() => onNavigate('audit')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <List size={18} />
                        Logs do Sistema
                    </button>
                </div>
            </div>
        </div>
    );
}
