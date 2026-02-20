import React, { useState, useEffect } from 'react';
import { COPSOQ_QUESTIONS, COPSOQ_DOMAINS } from '../utils/copsoq_data';
import { calcularResultadosCopsoq } from '../utils/copsoq_calculations';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { Save, ChevronRight, ChevronLeft, Send, AlertCircle } from 'lucide-react';

const CopsoqForm = ({ onFinish, onCancel }) => {
    const { user, isColaborador } = useAuth();
    const { activeCompany } = useCompany();
    const [responses, setResponses] = useState({});
    const [currentStep, setCurrentStep] = useState(0); // 0 to questions.length - 1

    // Pre-fill company for COLABORADOR
    const [personData, setPersonData] = useState({
        name: '',
        sector: '',
        role: '',
        company: activeCompany?.nome || activeCompany?.name || '',
        companyId: activeCompany?.id || '',
        gender: '',
        age: '',
        tenure: ''
    });
    const [error, setError] = useState(null);
    const { companies } = useCompany();

    // Scroll to top on step change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentStep]);

    const handleOptionSelect = (questionId, value) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: value // Store as number 1-5
        }));
    };

    const handleNext = () => {
        // Validate current question answer
        const currentQ = COPSOQ_QUESTIONS[currentStep];
        if (!responses[currentQ.id]) {
            setError('Por favor, selecione uma resposta antes de continuar.');
            return;
        }
        setError(null);
        if (currentStep < COPSOQ_QUESTIONS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handlePrev = () => {
        setError(null);
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = () => {
        setError(null);

        // Final validation
        const totalHelpers = COPSOQ_QUESTIONS.length;
        const totalAnswered = Object.keys(responses).length;
        if (totalAnswered < totalHelpers) {
            setError(`Faltam responder ${totalHelpers - totalAnswered} perguntas.`);
            return;
        }

        const results = calcularResultadosCopsoq(responses);

        // Construct final object matching the prompt's requested structure
        const finalData = {
            person: {
                name: personData.name || 'Anônimo',
                sector: personData.sector,
                role: personData.role,
                company_name: personData.company,
                company_id: personData.companyId,
                gender: personData.gender,
                age: personData.age,
                tenure: personData.tenure,
                date: new Date().toISOString()
            },
            responses: responses,
            results: results.dominios,
            pontuacao_geral: results.mediaGeral
        };

        onFinish(finalData);
    };

    // Render "Start Screen" or "Person Data" as Step -1 if we wanted, 
    // but let's put it at the top or a separate initial view.
    // Let's integrate it. If step is -1, show Person Form.
    const [isStarted, setIsStarted] = useState(false);

    if (!isStarted) {
        return (
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ color: '#1b4d3e', marginBottom: '1rem' }}>Avaliação baseada no COPSOQ II</h2>
                <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>
                    Sua participação é fundamental para a melhoria do ambiente de trabalho.<br />
                    Identifique sua empresa e preencha os dados básicos abaixo.
                </p>

                <div style={{ textAlign: 'left', marginBottom: '2rem' }}>

                    {/* Empresa (Obrigatório) */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Empresa *</label>
                        <select
                            className="input-field"
                            value={personData.companyId}
                            onChange={e => {
                                const id = e.target.value;
                                const comp = companies.find(c => c.id.toString() === id);
                                setPersonData({
                                    ...personData,
                                    companyId: id,
                                    company: comp ? (comp.nome || comp.name) : ''
                                });
                            }}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="">Selecione sua empresa...</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.nome || c.name}</option>
                            ))}
                        </select>
                        <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                            Caso sua empresa não esteja listada, procure o RH.
                        </p>
                    </div>

                    {/* Nome (Opcional) */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Seu Nome (Opcional)</label>
                        <input
                            type="text"
                            className="input-field"
                            value={personData.name}
                            onChange={e => setPersonData({ ...personData, name: e.target.value })}
                            placeholder="Seu nome completo"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    {/* Setor e Cargo */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Setor *</label>
                            <input
                                type="text"
                                className="input-field"
                                value={personData.sector}
                                onChange={e => setPersonData({ ...personData, sector: e.target.value })}
                                placeholder="Ex: Produção"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Cargo *</label>
                            <input
                                type="text"
                                className="input-field"
                                value={personData.role}
                                onChange={e => setPersonData({ ...personData, role: e.target.value })}
                                placeholder="Ex: Operador"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* Gênero */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Gênero *</label>
                            <select
                                className="input-field"
                                value={personData.gender}
                                onChange={e => setPersonData({ ...personData, gender: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="">Selecione...</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>

                        {/* Idade */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Idade *</label>
                            <input
                                type="number"
                                className="input-field"
                                value={personData.age}
                                onChange={e => setPersonData({ ...personData, age: e.target.value })}
                                placeholder="Idade"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>

                    {/* Tempo de Empresa */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Tempo de Empresa (anos) *</label>
                        <input
                            type="number"
                            step="0.1"
                            className="input-field"
                            value={personData.tenure}
                            onChange={e => setPersonData({ ...personData, tenure: e.target.value })}
                            placeholder="Ex: 2.5"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={onCancel} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                    <button
                        onClick={() => {
                            if (!personData.companyId || !personData.sector || !personData.role || !personData.gender || !personData.age || !personData.tenure) {
                                return alert('Por favor, preencha todos os campos obrigatórios (*), incluindo a Empresa.');
                            }
                            setError(null);
                            setIsStarted(true);
                        }}
                        className="btn-primary"
                        style={{ padding: '0.75rem 2rem', background: '#3498DB', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Iniciar Avaliação
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = COPSOQ_QUESTIONS[currentStep];
    const progress = Math.round(((currentStep + 1) / COPSOQ_QUESTIONS.length) * 100);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header / Progress */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#7f8c8d' }}>
                    <span>Questão {currentStep + 1} de {COPSOQ_QUESTIONS.length}</span>
                    <span>{progress}% Concluído</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: '#3498DB', transition: 'width 0.3s' }}></div>
                </div>
            </div>

            {/* Question Card */}
            <div className="card" style={{ padding: '3rem 2rem', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <span style={{ display: 'block', color: '#3498DB', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1rem' }}>
                        {Object.values(COPSOQ_DOMAINS).find(d => d.perguntas.includes(currentQ.id))?.nome || 'Geral'}
                    </span>
                    <h3 style={{ fontSize: '1.5rem', color: '#2c3e50', margin: 0 }}>
                        {currentQ.text}
                    </h3>
                </div>

                {error && (
                    <div style={{
                        background: '#fdecea', color: '#e74c3c', padding: '1rem', borderRadius: '4px',
                        marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {[1, 2, 3, 4, 5].map((val) => {
                        const labels = ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"];
                        const isSelected = responses[currentQ.id] === val;

                        return (
                            <button
                                key={val}
                                onClick={() => handleOptionSelect(currentQ.id, val)}
                                style={{
                                    padding: '1rem 0.5rem',
                                    border: isSelected ? '2px solid #3498DB' : '1px solid #e0e0e0',
                                    background: isSelected ? '#3498DB' : 'white',
                                    color: isSelected ? 'white' : '#555',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{val}</span>
                                <span style={{ fontSize: '0.8rem' }}>{labels[val - 1]}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1.5rem', border: '1px solid #ccc', background: 'white', borderRadius: '4px',
                        cursor: currentStep === 0 ? 'not-allowed' : 'pointer', opacity: currentStep === 0 ? 0.5 : 1
                    }}
                >
                    <ChevronLeft size={20} /> Anterior
                </button>

                <button
                    onClick={handleNext}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 2rem', background: '#27AE60', color: 'white', border: 'none', borderRadius: '4px',
                        cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'
                    }}
                >
                    {currentStep === COPSOQ_QUESTIONS.length - 1 ? (
                        <>Finalizar <Send size={20} /></>
                    ) : (
                        <>Próxima <ChevronRight size={20} /></>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CopsoqForm;
