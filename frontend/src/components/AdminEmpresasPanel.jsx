import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { Building2, Edit2, Save, X, Plus, Users, CheckCircle, XCircle } from 'lucide-react';

export default function AdminEmpresasPanel({ onBack }) {
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [newEmpresa, setNewEmpresa] = useState({ nome: '', cnpj: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadEmpresas();
    }, []);

    const loadEmpresas = async () => {
        try {
            const { data, error } = await supabase
                .from('empresas')
                .select(`
                    *,
                    perfis(count)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setEmpresas(data || []);
        } catch (error) {
            console.error('Erro ao carregar empresas:', error);
            showMessage('error', 'Erro ao carregar empresas');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const validateCNPJ = (cnpj) => {
        // Remove caracteres não numéricos
        const cleaned = cnpj.replace(/\D/g, '');
        return cleaned.length === 14;
    };

    const formatCNPJ = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 14) {
            return cleaned
                .replace(/^(\d{2})(\d)/, '$1.$2')
                .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                .replace(/\.(\d{3})(\d)/, '.$1/$2')
                .replace(/(\d{4})(\d)/, '$1-$2');
        }
        return value;
    };

    const handleAddEmpresa = async () => {
        if (!newEmpresa.nome.trim()) {
            showMessage('error', 'Nome da empresa é obrigatório');
            return;
        }

        if (!newEmpresa.cnpj.trim()) {
            showMessage('error', 'CNPJ é obrigatório');
            return;
        }

        if (!validateCNPJ(newEmpresa.cnpj)) {
            showMessage('error', 'CNPJ inválido (deve ter 14 dígitos)');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('empresas')
                .insert([{
                    nome: newEmpresa.nome,
                    cnpj: newEmpresa.cnpj,
                    ativo: true
                }])
                .select();

            if (error) throw error;

            showMessage('success', 'Empresa cadastrada com sucesso!');
            setNewEmpresa({ nome: '', cnpj: '' });
            loadEmpresas();
        } catch (error) {
            console.error('Erro ao adicionar empresa:', error);
            showMessage('error', 'Erro ao cadastrar empresa');
        }
    };

    const handleEdit = (empresa) => {
        setEditingId(empresa.id);
        setEditForm({ ...empresa });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSaveEdit = async () => {
        if (!editForm.nome.trim()) {
            showMessage('error', 'Nome da empresa é obrigatório');
            return;
        }

        if (!validateCNPJ(editForm.cnpj)) {
            showMessage('error', 'CNPJ inválido');
            return;
        }

        try {
            const { error } = await supabase
                .from('empresas')
                .update({
                    nome: editForm.nome,
                    cnpj: editForm.cnpj
                })
                .eq('id', editingId);

            if (error) throw error;

            showMessage('success', 'Empresa atualizada com sucesso!');
            setEditingId(null);
            setEditForm({});
            loadEmpresas();
        } catch (error) {
            console.error('Erro ao atualizar empresa:', error);
            showMessage('error', 'Erro ao atualizar empresa');
        }
    };

    const handleToggleAtivo = async (empresa) => {
        try {
            const { error } = await supabase
                .from('empresas')
                .update({ ativo: !empresa.ativo })
                .eq('id', empresa.id);

            if (error) throw error;

            showMessage('success', `Empresa ${!empresa.ativo ? 'ativada' : 'desativada'} com sucesso!`);
            loadEmpresas();
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            showMessage('error', 'Erro ao alterar status da empresa');
        }
    };

    if (loading) {
        return (
            <div className="card">
                <p>Carregando empresas...</p>
            </div>
        );
    }

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={onBack} className="btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>Voltar</button>
                    <h2 style={{ margin: 0, color: '#1b4d3e' }}>Gestão de Empresas</h2>
                </div>
            </div>

            {/* Message */}
            {message.text && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '6px',
                    marginBottom: '1.5rem',
                    background: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24',
                    border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                    {message.text}
                </div>
            )}

            {/* Formulário de Cadastro */}
            <div style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '2rem'
            }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} />
                    Cadastrar Nova Empresa
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                            Razão Social *
                        </label>
                        <input
                            type="text"
                            placeholder="Nome da empresa"
                            value={newEmpresa.nome}
                            onChange={(e) => setNewEmpresa({ ...newEmpresa, nome: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '2px solid #e0e0e0' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                            CNPJ *
                        </label>
                        <input
                            type="text"
                            placeholder="00.000.000/0001-00"
                            value={newEmpresa.cnpj}
                            onChange={(e) => setNewEmpresa({ ...newEmpresa, cnpj: formatCNPJ(e.target.value) })}
                            maxLength={18}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '2px solid #e0e0e0' }}
                        />
                    </div>
                    <button
                        className="btn-primary"
                        onClick={handleAddEmpresa}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                    >
                        <Plus size={18} />
                        Adicionar
                    </button>
                </div>
            </div>

            {/* Lista de Empresas */}
            <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                    Empresas Cadastradas ({empresas.length})
                </h3>

                {empresas.length === 0 ? (
                    <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
                        Nenhuma empresa cadastrada ainda
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {empresas.map((empresa) => (
                            <div
                                key={empresa.id}
                                style={{
                                    padding: '1.25rem',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '8px',
                                    background: empresa.ativo ? 'white' : '#f5f5f5'
                                }}
                            >
                                {editingId === empresa.id ? (
                                    // Modo de Edição
                                    <div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                                    Razão Social
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.nome}
                                                    onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '2px solid #1b4d3e' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                                    CNPJ
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.cnpj}
                                                    onChange={(e) => setEditForm({ ...editForm, cnpj: formatCNPJ(e.target.value) })}
                                                    maxLength={18}
                                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '2px solid #1b4d3e' }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn-primary"
                                                onClick={handleSaveEdit}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                                            >
                                                <Save size={16} />
                                                Salvar
                                            </button>
                                            <button
                                                className="btn-secondary"
                                                onClick={handleCancelEdit}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                                            >
                                                <X size={16} />
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Modo de Visualização
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                <Building2 size={20} color="#1b4d3e" />
                                                <strong style={{ fontSize: '1.1rem', color: '#333' }}>{empresa.nome}</strong>
                                                {empresa.ativo ? (
                                                    <span style={{
                                                        background: '#d4edda',
                                                        color: '#155724',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}>
                                                        <CheckCircle size={12} />
                                                        Ativa
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        background: '#f8d7da',
                                                        color: '#721c24',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}>
                                                        <XCircle size={12} />
                                                        Inativa
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                                                CNPJ: {empresa.cnpj}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Users size={14} />
                                                {empresa.perfis?.[0]?.count || 0} colaborador(es)
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn-secondary"
                                                onClick={() => handleEdit(empresa)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                            >
                                                <Edit2 size={14} />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleToggleAtivo(empresa)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: empresa.ativo ? '#f8d7da' : '#d4edda',
                                                    color: empresa.ativo ? '#721c24' : '#155724',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {empresa.ativo ? 'Desativar' : 'Ativar'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
