import React, { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseReader } from '../config/supabaseClient';
import { generateTemporaryPassword } from '../utils/passwordGenerator';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Edit2, Key, CheckCircle, XCircle, Copy, UserCog, Trash2 } from 'lucide-react';

const StatusMessage = ({ message }) => (
    <div style={{
        padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem',
        background: message.type === 'success' ? '#d4edda' : '#f8d7da',
        color: message.type === 'success' ? '#155724' : '#721c24',
        border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
    }}>
        <span>{message.text}</span>
    </div>
);

const ListView = ({ operadores, onEdit, onReset, onToggle, onDelete }) => (
    <div key="view-list">
        <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
                <span>{operadores.length} usuário(s) encontrado(s)</span>
            </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {operadores.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
                    <span>Nenhum usuário cadastrado ainda</span>
                </div>
            ) : (
                operadores.map((op) => (
                    <div key={op.id} style={{ padding: '1.25rem', border: '2px solid #e0e0e0', borderRadius: '8px', background: op.ativo ? 'white' : '#f5f5f5' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <Users size={20} color="#1b4d3e" />
                                    <strong style={{ fontSize: '1.1rem', color: '#333' }}><span>{op.nome_completo}</span></strong>
                                    <span style={{
                                        background: op.ativo ? '#d4edda' : '#f8d7da',
                                        color: op.ativo ? '#155724' : '#721c24',
                                        padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600
                                    }}>
                                        {op.ativo ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                        <span> {op.ativo ? 'Ativo' : 'Inativo'}</span>
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}><span>Email: {op.email}</span></div>
                                <div style={{ fontSize: '0.85rem', color: '#888' }}>
                                    <span>Tipo: {op.tipo_acesso === 'admin' ? 'Administrador' : 'Colaborador'}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button className="btn-secondary" onClick={() => onEdit(op)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}><Edit2 size={14} /> <span>Editar</span></button>
                                <button onClick={() => onReset(op)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#fff3cd', color: '#856404', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}><Key size={14} /> <span>Resetar</span></button>
                                <button onClick={() => onToggle(op)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: op.ativo ? '#f8d7da' : '#d4edda', color: op.ativo ? '#721c24' : '#155724', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}><span>{op.ativo ? 'Desativar' : 'Ativar'}</span></button>
                                <button
                                    onClick={() => onDelete(op)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: '#fee2e2',
                                        color: '#b91c1c',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem'
                                    }}
                                    title="Excluir Permanentemente"
                                >
                                    <Trash2 size={14} /> <span>Excluir</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

const NewForm = ({ newOperador, setNewOperador, onAdd, onCancel, loading }) => (
    <div key="view-new" style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '2px solid #1b4d3e' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> <span>Cadastrar Novo Acesso</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}><span>Nome Completo *</span></label>
                <input type="text" placeholder="Nome do usuário" value={newOperador.nome_completo} onChange={(e) => setNewOperador({ ...newOperador, nome_completo: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
            <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}><span>Email *</span></label>
                <input type="email" placeholder="email@exemplo.com" value={newOperador.email} onChange={(e) => setNewOperador({ ...newOperador, email: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
            <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}><span>Senha Inicial *</span></label>
                <input type="text" placeholder="Mínimo 6 caracteres" value={newOperador.senha} onChange={(e) => setNewOperador({ ...newOperador, senha: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" onClick={onAdd} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCog size={18} />
                <span>{loading ? 'Processando...' : 'Cadastrar Acesso'}</span>
            </button>
            <button className="btn-secondary" onClick={onCancel}><span>Cancelar</span></button>
        </div>
    </div>
);

const EditForm = ({ editForm, setEditForm, onSave, onCancel, loading }) => (
    <div key="view-edit" style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '2px solid #1b4d3e' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}><span>Editar Perfil</span></h3>
        <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}><span>Nome Completo</span></label>
            <input type="text" value={editForm.nome_completo} onChange={(e) => setEditForm({ ...editForm, nome_completo: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" onClick={onSave} disabled={loading}><span>{loading ? 'Salvando...' : 'Salvar'}</span></button>
            <button className="btn-secondary" onClick={onCancel}><span>Cancelar</span></button>
        </div>
    </div>
);

const SuccessView = ({ password, onDone, onCopy }) => (
    <div key="view-success" style={{ padding: '2rem', borderRadius: '8px', background: '#fff3cd', border: '1px solid #ffc107', textAlign: 'center' }}>
        <CheckCircle size={48} color="#856404" style={{ marginBottom: '1rem' }} />
        <h3 style={{ color: '#856404', marginBottom: '0.5rem' }}><span>Acesso Criado com Sucesso!</span></h3>
        <p style={{ marginBottom: '1.5rem' }}><span>Compartilhe a senha abaixo com o usuário:</span></p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #ffc107', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            <code style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{password}</code>
            <button onClick={() => onCopy(password)} style={{ background: '#1b4d3e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}><Copy size={16} /></button>
        </div>
        <button className="btn-primary" onClick={onDone}><span>Entendido</span></button>
    </div>
);


export default function AdminColaboradoresPanel() {
    const { profile } = useAuth();
    const [operadores, setOperadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ nome_completo: '' });
    const [newOperador, setNewOperador] = useState({ nome_completo: '', email: '', senha: '' });
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const VERSION = "v4.0.0-FINAL";

    const loadData = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);

            const { data, error } = await supabaseReader
                .from('perfis')
                .select('*')
                .neq('id', profile?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOperadores(data || []);
        } catch (error) {
            console.error('Erro ao carregar:', error);
            setMessage({ type: 'error', text: 'Erro ao carregar dados.' });
        } finally {
            if (!silent) setLoading(false);
        }
    }, [profile?.id]);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 8000);
            return () => clearTimeout(timer);
        }
    }, [message.text]);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleAddOperador = async () => {
        const nome = newOperador.nome_completo?.trim();
        const email = newOperador.email?.trim();
        const senha = newOperador.senha?.trim();

        if (!nome || !email || !validateEmail(email) || !senha || senha.length < 6) {
            setMessage({ type: 'error', text: 'Preencha todos os campos corretamente. Senha mínima: 6 caracteres.' });
            return;
        }

        setLoading(true);
        try {
            // Use signUp (works with anon key) instead of admin.createUser (requires service_role key)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password: senha,
                options: {
                    data: { nome_completo: nome, tipo_acesso: 'admin' }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Falha ao criar usuário');

            // Update profile in perfis table (auto-assign same empresa as admin)
            const { error: perfilError } = await supabase
                .from('perfis')
                .update({
                    nome_completo: nome,
                    tipo_acesso: 'admin',
                    empresa_id: profile?.empresa_id || null,
                    ativo: true
                })
                .eq('id', authData.user.id);

            if (perfilError) {
                console.warn('Aviso: perfil será atualizado no próximo login.', perfilError);
            }

            setGeneratedPassword(senha);
            setNewOperador({ nome_completo: '', email: '', senha: '' });
            await loadData(true);
            setViewMode('success');
            setMessage({ type: 'success', text: 'Acesso criado com sucesso!' });
        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            let errorMsg = error.message || 'Erro desconhecido';
            if (errorMsg.includes('already registered')) {
                errorMsg = 'Este email já está cadastrado no sistema.';
            }
            setMessage({ type: 'error', text: 'Falha: ' + errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!editForm.nome_completo.trim()) {
            setMessage({ type: 'error', text: 'Nome é obrigatório.' });
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase
                .from('perfis')
                .update({ nome_completo: editForm.nome_completo })
                .eq('id', editingId);
            if (error) throw error;
            await loadData(true);
            setViewMode('list');
            setMessage({ type: 'success', text: 'Perfil atualizado!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao salvar.' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAtivo = async (op) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('perfis')
                .update({ ativo: !op.ativo })
                .eq('id', op.id);
            if (error) throw error;
            await loadData(true);
            setMessage({ type: 'success', text: 'Status atualizado!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Falha ao alterar status.' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (op) => {
        if (!window.confirm(`Resetar senha de ${op.nome_completo}?`)) return;
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(op.email, {
                redirectTo: window.location.origin
            });
            if (error) throw error;
            setMessage({ type: 'success', text: `Email de redefinição enviado para ${op.email}!` });
        } catch (error) {
            setMessage({ type: 'error', text: 'Falha no reset de senha.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOperador = async (op) => {
        if (!window.confirm(`TEM CERTEZA QUE DESEJA EXCLUIR PERMANENTEMENTE o acesso de ${op.nome_completo}? Esta ação não pode ser desfeita.`)) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('perfis')
                .delete()
                .eq('id', op.id);

            if (error) throw error;

            await loadData(true);
            setMessage({ type: 'success', text: 'Acesso excluído permanentemente!' });
        } catch (error) {
            console.error('Erro ao excluir:', error);
            setMessage({ type: 'error', text: 'Falha ao excluir o acesso: ' + (error.message || 'Erro de permissão.') });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setMessage({ type: 'success', text: 'Senha copiada!' });
    };

    return (
        <div className="card" translate="no">
            <div style={{ position: 'absolute', top: '5px', right: '10px', fontSize: '0.65rem', color: '#ccc', pointerEvents: 'none' }}>
                <span>{VERSION}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, color: '#1b4d3e', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <UserCog size={24} />
                    <span>Gestão de Acessos</span>
                </h2>
                {viewMode === 'list' && (
                    <button className="btn-primary" onClick={() => setViewMode('new')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> <span>Novo Acesso</span>
                    </button>
                )}
            </div>

            {message.text && <StatusMessage message={message} />}

            {loading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, borderRadius: '8px' }}>
                    <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold' }}>
                        <span>Aguarde...</span>
                    </div>
                </div>
            )}

            <div key={`stage-${viewMode}`} style={{ position: 'relative', minHeight: '150px' }}>
                {viewMode === 'list' && (
                    <ListView
                        operadores={operadores}
                        onEdit={(op) => { setEditingId(op.id); setEditForm({ nome_completo: op.nome_completo }); setViewMode('edit'); }}
                        onReset={handleResetPassword}
                        onToggle={handleToggleAtivo}
                        onDelete={handleDeleteOperador}
                    />
                )}
                {viewMode === 'new' && (
                    <NewForm
                        newOperador={newOperador}
                        setNewOperador={setNewOperador}
                        onAdd={handleAddOperador}
                        onCancel={() => setViewMode('list')}
                        loading={loading}
                    />
                )}
                {viewMode === 'edit' && (
                    <EditForm
                        editForm={editForm}
                        setEditForm={setEditForm}
                        onSave={handleSaveEdit}
                        onCancel={() => setViewMode('list')}
                        loading={loading}
                    />
                )}
                {viewMode === 'success' && (
                    <SuccessView
                        password={generatedPassword}
                        onDone={() => setViewMode('list')}
                        onCopy={copyToClipboard}
                    />
                )}
            </div>
        </div>
    );
}
