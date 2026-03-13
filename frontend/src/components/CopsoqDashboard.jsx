import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { generateCopsoqHtmlReport } from '../utils/CopsoqTechnicalReportGenerator';

const CopsoqDashboard = ({ results, person, onBack }) => {
    if (!results) return null;

    const abbreviateDomain = (name) => {
        const abbrMap = {
            "Apoio Social - Chefia": "Ap. Social Chefia",
            "Reconhecimento e Recompensa": "Reconhecimento",
            "Conflito Trabalho-Família": "Conf. Trab-Família",
            "Justiça Organizacional": "Justiça Org.",
            "Comprometimento com o Local de Trabalho": "Comprometimento",
            "Demandas Emocionais": "Dem. Emocionais",
            "Demandas Cognitivas": "Dem. Cognitivas",
            "Demandas Quantitativas": "Dem. Quantitativas",
            "Feedback sobre o Trabalho": "Feedback",
            "Possibilidades de Desenvolvimento": "Possib. Desenvolvimento",
            "Qualidade da Liderança": "Qual. Liderança",
            "Insegurança no Trabalho": "Insegurança",
            "Sentido do Trabalho": "Sentido no Trab.",
            "Apoio Social - Colegas de trabalho": "Ap. Social Colegas",
            "Previsibilidade": "Previsibilidade",
            "Clima de Segurança": "Clima Seg.",
            "Satisfação no Trabalho": "Satisfação",
            "Saúde Geral": "Saúde Geral",
            "Dificuldades para dormir": "Dif. Dormir",
            "Sintomas Depressivos": "Sint. Depressivos",
            "Sintomas Somáticos de Estresse": "Sint. Estresse",
            "Sintomas Cognitivos de Estresse": "Sint. Cog. Estresse",
            "Exigências Emocionais": "Exig. Emocionais",
            "Exigências Cognitivas": "Exig. Cognitivas",
            "Influência no Trabalho": "Influência",
            "Qualidade do Papel": "Qual. do Papel",
            "Clareza de Papel": "Clareza de Papel",
            "Conflito de Papel": "Conflito de Papel",
            "Exigências de esconder emoções": "Esconder Emoções",
            "Ritmo de Trabalho": "Ritmo Trab."
        };
        return abbrMap[name] || name;
    };

    // Convert results object to array for charts
    const domainData = Object.entries(results).map(([key, data]) => ({
        id: key,
        name: data.nome,
        shortName: abbreviateDomain(data.nome),
        score: data.media,
        color: data.cor,
        classificacao: data.classificacao
    }));

    // Data for Radar Chart (Top 6 most critical or just summarized categories?)
    // Displaying all 20 on a radar is messy. Let's group or show top/bottom.
    // Let's try showing all but with short names.

    // Sort by risk (Score < 50 is High Risk)
    // Wait, in my logic: < 50 is BAD (Red). High score is GOOD.
    const sortedByRisk = [...domainData].sort((a, b) => a.score - b.score);

    const overallScore = Object.values(results).reduce((acc, curr) => acc + curr.media, 0) / Object.keys(results).length;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                    <ArrowLeft size={20} /> Voltar
                </button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}>
                        <Download size={18} /> Exportar Excel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => generateCopsoqHtmlReport(results, person)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#2c3e50', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                    >
                        <FileText size={18} /> Relatório Técnico
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem', borderLeft: `6px solid ${overallScore < 50 ? '#E74C3C' : overallScore < 75 ? '#F39C12' : '#27AE60'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#2c3e50' }}>{person.name}</h2>
                        <p style={{ margin: '0.5rem 0 0 0', color: '#7f8c8d' }}>Setor: {person.sector} • Data: {new Date(person.date).toLocaleDateString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: overallScore < 50 ? '#E74C3C' : overallScore < 75 ? '#F39C12' : '#27AE60' }}>
                            {overallScore.toFixed(1)}
                        </div>
                        <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888' }}>Pontuação Geral</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1fr', gap: '2rem', marginBottom: '2rem' }}>
                {/* Radar Chart */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3>Visão Geral (Radar)</h3>
                    <div style={{ width: '100%', height: '420px', padding: '60px', boxSizing: 'border-box' }}>
                        <ResponsiveContainer>
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={domainData}>
                                <PolarGrid />
                                <PolarAngleAxis 
                                    dataKey="shortName" 
                                    tick={{ fontSize: 11, fontWeight: 500 }} 
                                />
                                <PolarRadiusAxis angle={30} domain={[0, 125]} tick={{ fontSize: 10 }} />
                                <Radar 
                                    name="Pontuação" 
                                    dataKey="score" 
                                    stroke="#3498DB" 
                                    fill="#3498DB" 
                                    fillOpacity={0.4} 
                                />
                                <RechartsTooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Critical Issues */}
                <div className="card">
                    <h3>Áreas de Atenção (Menores Pontuações)</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>Domínios com classificação de Alto Risco ou Risco Moderado.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {sortedByRisk.filter(d => d.score < 75).length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#27AE60' }}>
                                Nenhum risco significativo identificado! 🎉
                            </div>
                        ) : (
                            sortedByRisk.filter(d => d.score < 75).slice(0, 10).map((d) => (
                                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '60px', fontWeight: 'bold', color: d.color }}>{d.score.toFixed(0)}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                            <span style={{ fontWeight: 500 }}>{d.name}</span>
                                            <span style={{ fontSize: '0.8rem', color: d.color }}>{d.classificacao}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: '#eee', borderRadius: '3px' }}>
                                            <div style={{ width: `${(d.score / 125) * 100}%`, height: '100%', background: d.color, borderRadius: '3px' }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* All Domains Grid */}
            <h3>Detalhamento por Domínio</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {domainData.map((d) => (
                    <div key={d.id} className="card" style={{ padding: '1rem', borderTop: `4px solid ${d.color}` }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', minHeight: '40px' }}>{d.name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>{d.score.toFixed(1)}</div>
                            <div style={{ fontSize: '0.8rem', color: d.color, fontWeight: 500 }}>{d.classificacao}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CopsoqDashboard;
