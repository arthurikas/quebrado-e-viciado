import React from 'react';
import { ArrowLeft, Download, FileText, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { generateAepReport } from '../utils/AepReportGenerator';

const AepDashboard = ({ evaluation, onBack }) => {
    if (!evaluation) return null;

    const { scores, person, subType } = evaluation;
    const details = scores.categoryScores || scores;

    const getScoreColor = (score) => {
        if (score < 60) return '#E74C3C'; // Crítico
        if (score < 80) return '#F39C12'; // Atenção
        return '#27AE60'; // Adequado
    };

    const getScoreIcon = (score) => {
        if (score < 60) return <XCircle size={20} color="#E74C3C" />;
        if (score < 80) return <AlertTriangle size={20} color="#F39C12" />;
        return <CheckCircle size={20} color="#27AE60" />;
    };

    const getScoreLevel = (score) => {
        if (score < 60) return 'CRÍTICO';
        if (score < 80) return 'ATENÇÃO';
        return 'ADEQUADO';
    };

    const handleDownload = async () => {
        await generateAepReport({
            scores: scores,
            raw: evaluation.raw,
            images: evaluation.images,
            formType: subType
        }, {
            nomeEmpresa: person.company_name || person.name,
            avaliador: person.evaluator || 'Avaliador',
            setor: person.sector,
            dataAvaliacao: new Date(person.date).toLocaleDateString('pt-BR')
        });
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#666' }}>
                    <ArrowLeft size={20} /> Voltar ao Dashboard
                </button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn-primary"
                        onClick={handleDownload}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#1b4d3e', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                        <FileText size={18} /> Baixar Relatório (DOCX)
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem', borderLeft: '6px solid #1b4d3e', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <span style={{ fontSize: '0.85rem', color: '#1b4d3e', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Resultado da Avaliação AEP - {subType === 'administrativo' ? 'Administrativo' : 'Operacional'}
                        </span>
                        <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', color: '#2c3e50' }}>{person.name || 'Empresa'}</h2>
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', color: '#666' }}>
                            <div><strong>Setor:</strong> {person.sector}</div>
                            <div><strong>Cargo:</strong> {person.role}</div>
                            <div><strong>Data:</strong> {new Date(person.date).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', background: '#f8f9fa', padding: '1rem 2rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.25rem' }}>CONFORMIDADE GERAL</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                            {(Object.values(details).reduce((a, b) => a + b, 0) / Object.values(details).length).toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Detalhamento por Categoria</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {Object.entries(details).map(([key, score]) => (
                        <div key={key} style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '12px', background: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#2c3e50', maxWidth: '70%' }}>
                                    {key.replace(/_/g, ' ').toUpperCase()}
                                </div>
                                {getScoreIcon(score)}
                            </div>

                            <div style={{ marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <span style={{ color: '#666' }}>Conformidade</span>
                                    <span style={{ fontWeight: 'bold', color: getScoreColor(score) }}>{score.toFixed(1)}%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${score}%`, height: '100%', background: getScoreColor(score), borderRadius: '4px' }}></div>
                                </div>
                            </div>

                            <div style={{ fontSize: '0.8rem', color: getScoreColor(score), fontWeight: 'bold', textAlign: 'right', marginTop: '0.5rem' }}>
                                {getScoreLevel(score)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center', color: '#888' }}>
                <p>Este resumo apresenta os níveis de conformidade ergonômica conforme a NR-17.</p>
                <p style={{ fontSize: '0.8rem' }}>Utilize o botão acima para gerar o relatório técnico completo.</p>
            </div>
        </div>
    );
};

export default AepDashboard;
