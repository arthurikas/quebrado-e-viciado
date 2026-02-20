import React, { useState, useRef } from 'react';
import { AEP_DATA } from '../utils/aep_data_v2';
import { calculateAepScore } from '../utils/aep_calculations_v2';
import { useCompany } from '../context/CompanyContext';
import { supabase } from '../config/supabaseClient';
import { Camera, X, ImageIcon } from 'lucide-react';

export default function AepForm({ onFinish, onCancel }) {
    const { companies, activeCompany } = useCompany();
    const [formType, setFormType] = useState(null); // 'operacional' | 'administrativo'
    const [personData, setPersonData] = useState({
        name: '',
        sector: '',
        role: '',
        company: activeCompany?.nome || activeCompany?.name || '',
        companyId: activeCompany?.id || ''
    });
    const [responses, setResponses] = useState({});
    const [sectionImages, setSectionImages] = useState({}); // { categoryId: [base64, ...] }
    const [error, setError] = useState(null);
    const [step, setStep] = useState(0); // 0: ID, 1: Selection, 2: Form

    const fileInputRefs = useRef({});

    // Auto-select company logic
    React.useEffect(() => {
        const setCompanyData = (comp) => {
            console.log('Setting Company Data:', comp);
            setPersonData(prev => ({
                ...prev,
                company: comp.nome || comp.name || '',
                companyId: comp.id || ''
            }));
        };

        if (activeCompany) {
            setCompanyData(activeCompany);
        } else if (companies && companies.length > 0) {
            console.log('Using first company from list:', companies[0]);
            setCompanyData(companies[0]);
        } else {
            console.log('Fetching fallback company...');
            supabase
                .from('empresas')
                .select('*')
                .eq('ativo', true)
                .limit(1)
                .single()
                .then(({ data, error }) => {
                    if (data && !error) {
                        setCompanyData(data);
                    } else {
                        console.error('Fallback fetch failed:', error);
                    }
                });
        }
    }, [activeCompany, companies]);

    // DEBUG: Monitor state
    console.log('AepForm Render:', {
        activeCompany,
        companiesLength: companies?.length,
        personDataCompanyId: personData.companyId
    });

    // Step 0: Identification
    if (step === 0) {
        return (
            <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ color: '#1b4d3e', marginBottom: '1.5rem' }}>Identificação (AEP)</h2>

                <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Setor *</label>
                        <input
                            type="text"
                            value={personData.sector}
                            onChange={e => setPersonData({ ...personData, sector: e.target.value })}
                            placeholder="Ex: Almoxarifado"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Cargo *</label>
                        <input
                            type="text"
                            value={personData.role}
                            onChange={e => setPersonData({ ...personData, role: e.target.value })}
                            placeholder="Ex: Auxiliar"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={onCancel} className="btn-secondary">Cancelar</button>
                    <button
                        onClick={async () => {
                            let currentCompanyId = personData.companyId;

                            // Silent Fallback: If no company is set, fetch 'Normalizze' or first available
                            if (!currentCompanyId) {
                                try {
                                    let { data } = await supabase
                                        .from('empresas')
                                        .select('*')
                                        .ilike('nome', '%Normalizze%')
                                        .limit(1)
                                        .maybeSingle();

                                    if (!data) {
                                        const { data: anyComp } = await supabase.from('empresas').select('*').limit(1).maybeSingle();
                                        data = anyComp;
                                    }

                                    if (data) {
                                        currentCompanyId = data.id;
                                        setPersonData(prev => ({
                                            ...prev,
                                            company: data.nome || data.name,
                                            companyId: data.id
                                        }));
                                    }
                                } catch (err) {
                                    console.error("Silent company fetch failed", err);
                                }
                            }

                            if (!currentCompanyId || !personData.sector || !personData.role) {
                                alert(`Por favor, preencha: ${!personData.sector ? 'Setor' : ''} ${!personData.role ? 'Cargo' : ''}`);
                                return;
                            }
                            setStep(1);
                        }}
                        className="btn-primary"
                    >
                        Continuar
                    </button>
                </div>
            </div >
        );
    }

    // Step 1: Type Selection
    if (step === 1) {
        return (
            <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ marginBottom: '0.5rem', color: '#15803d' }}>Nova Avaliação Ergonômica (AEP)</h2>
                <p style={{ marginBottom: '2rem', color: '#6b7280' }}>Selecione o tipo de posto de trabalho para iniciar a análise:</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '500px', margin: '0 auto' }}>
                    <button className="btn-tipo-avaliacao" onClick={() => { setFormType('administrativo'); setStep(2); }}>
                        <span className="btn-tipo-avaliacao-titulo">Administrativo / Escritório</span>
                        <span className="btn-tipo-avaliacao-subtitulo">Avaliação de Posto de Trabalho Informatizado</span>
                    </button>

                    <button className="btn-tipo-avaliacao" onClick={() => { setFormType('operacional'); setStep(2); }}>
                        <span className="btn-tipo-avaliacao-titulo">Operacional / Produção</span>
                        <span className="btn-tipo-avaliacao-subtitulo">Avaliação de Atividades Manuais e Repetitivas</span>
                    </button>

                    <button className="btn-cancelar" onClick={() => setStep(0)}>
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    const currentData = AEP_DATA[formType];

    const handleResponseChange = (categoryId, itemIndex, value) => {
        setResponses(prev => {
            const categoryResps = prev[categoryId] || [];
            const newCategoryResps = [...categoryResps];
            newCategoryResps[itemIndex] = value;
            return {
                ...prev,
                [categoryId]: newCategoryResps
            };
        });
    };

    const handleImageChange = (categoryId, e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSectionImages(prev => {
                    const currentImages = prev[categoryId] || [];
                    return {
                        ...prev,
                        [categoryId]: [...currentImages, reader.result]
                    };
                });
            };
            reader.readAsDataURL(file);
        });
        // Clear input
        e.target.value = '';
    };

    const removeImage = (categoryId, index) => {
        setSectionImages(prev => {
            const currentImages = [...(prev[categoryId] || [])];
            currentImages.splice(index, 1);
            return {
                ...prev,
                [categoryId]: currentImages
            };
        });
    };

    const handleCalculate = () => {
        let missing = 0;
        currentData.categories.forEach(cat => {
            const catResps = responses[cat.id] || [];
            cat.items.forEach((_, idx) => {
                if (!catResps[idx]) missing++;
            });
        });

        if (missing > 0) {
            setError(`Faltam ${missing} respostas. Por favor, responda todas as perguntas.`);
            window.scrollTo(0, 0);
            return;
        }
        setError(null);

        const scores = calculateAepScore(responses, formType);

        if (onFinish) {
            onFinish({
                scores: scores,
                raw: responses,
                images: sectionImages,
                formType: formType,
                person: {
                    name: personData.name || 'Anônimo',
                    sector: personData.sector,
                    role: personData.role,
                    company_name: personData.company,
                    company_id: personData.companyId,
                    date: new Date().toISOString()
                }
            });
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <div>
                    <h2 style={{ margin: 0 }}>{currentData.title}</h2>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>Responda Sim, Não ou NA para cada item.</span>
                </div>
                <button onClick={() => setFormType(null)} style={{ background: '#eee', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                    Trocar Tipo
                </button>
            </div>

            {error && (
                <div style={{ background: '#FFEBEE', color: '#D32F2F', padding: '1rem', margin: '1rem 0', borderRadius: '4px', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            {currentData.categories.map((cat) => (
                <div key={cat.id} className="card" style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f0f0f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: '#2c3e50' }}>{cat.title}</h3>

                        {/* Photo Attachment Trigger */}
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                                ref={el => fileInputRefs.current[cat.id] = el}
                                onChange={(e) => handleImageChange(cat.id, e)}
                            />
                            <button
                                onClick={() => fileInputRefs.current[cat.id].click()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: '#f0fdf4',
                                    color: '#16a34a',
                                    border: '1px dashed #16a34a',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}
                            >
                                <Camera size={16} />
                                Anexar Fotos
                            </button>
                        </div>
                    </div>

                    {/* Image Previews */}
                    {sectionImages[cat.id] && sectionImages[cat.id].length > 0 && (
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                            {sectionImages[cat.id].map((img, idx) => (
                                <div key={idx} style={{ position: 'relative' }}>
                                    <img
                                        src={img}
                                        alt="Preview"
                                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                                    />
                                    <button
                                        onClick={() => removeImage(cat.id, idx)}
                                        style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            right: '-8px',
                                            background: '#e53935',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {cat.items.map((item, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 0',
                            borderBottom: '1px solid #f9f9f9'
                        }}>
                            <span style={{ maxWidth: '65%', fontSize: '0.95rem' }}>{item}</span>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                {['Sim', 'Não', 'NA'].map(opt => {
                                    const isSelected = responses[cat.id]?.[idx] === opt;
                                    let activeColor = '#3498DB';
                                    if (opt === 'Sim') activeColor = '#27AE60';
                                    if (opt === 'Não') activeColor = '#E74C3C';

                                    return (
                                        <label key={opt} style={{
                                            cursor: 'pointer',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '4px',
                                            border: `1px solid ${isSelected ? activeColor : '#ddd'}`,
                                            background: isSelected ? activeColor : 'white',
                                            color: isSelected ? 'white' : '#666',
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold',
                                            transition: 'all 0.2s',
                                            minWidth: '3.5rem',
                                            textAlign: 'center'
                                        }}>
                                            <input
                                                type="radio"
                                                name={`${cat.id}_${idx}`}
                                                value={opt}
                                                checked={isSelected}
                                                onChange={() => handleResponseChange(cat.id, idx, opt)}
                                                style={{ display: 'none' }}
                                            />
                                            {opt}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            <div className="card" style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center' }}>
                <button
                    className="btn-primary"
                    style={{ width: '100%', maxWidth: '400px', fontSize: '1.2rem', padding: '1rem' }}
                    onClick={handleCalculate}
                >
                    Finalizar Avaliação
                </button>
            </div>
        </div>
    );
}
