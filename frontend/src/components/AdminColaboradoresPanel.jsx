import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabaseClient';
import { generateTemporaryPassword } from '../utils/passwordGenerator';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Edit2, Key, CheckCircle, XCircle, Copy, Building2, ShieldCheck, UserCog } from 'lucide-react';

// STABLE SUB-COMPONENTS (Defined outside to prevent reconciliation issues)

const StatusMessage = ({ message }) => (
    <div key="status-msg-container" style={{
        padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem',
        background: message.type === 'success' ? '#d4edda' : '#f8d7da',
        color: message.type === 'success' ? '#155724' : '#721c24',
        border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
    }}>
        <span>{message.text}</span>
    </div>
);

const ListView = ({ operadores, onEdit, onReset, onToggle, isSuperAdmin }) => (
    <div key="view-stage-list">
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
                <span>{operadores.length} <span>Operador(es)/Admin(s) encontrado(s)</span></span>
            </span>
            {isSuperAdmin && (
                <span style={{ fontSize: '0.75rem', background: '#38a169', padding: '0.2rem 0.6rem', borderRadius: '4px', color: 'white', fontWeight: 'bold' }}>
                    <span>MODO MASTER ATIVO</span>
                </span>
            )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {operadores.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
                    <span>Nenhum perfil encontrado</span>
                </div>
            ) : (
                operadores.map((op) => (
                    <div key={`op-card-${op.id}`} style={{ padding: '1.25rem', border: '2px solid #e0e0e0', borderRadius: '8px', background: op.ativo ? 'white' : '#f5f5f5' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    {op.tipo_acesso === 'admin' ? <ShieldCheck size={20} color="#3182ce" /> : <Users size={20} color="#1b4d3e" />}
                                    <strong style={{ fontSize: '1.1rem', color: '#333' }}><span>{op.nome_completo}</span></strong>
                                    <span style={{ fontSize: '0.75rem', color: op.tipo_acesso === 'admin' ? '#3182ce' : '#2d6a4f', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                        <span>[{op.tipo_acesso === 'admin' ? 'Administrador' : 'Operador'}]</span>
                                    </span>
                                    <span style={{
                                        background: op.ativo ? '#d4edda' : '#f8d7da',
                                        color: op.ativo ? '#155724' : '#721c24',
                                        padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem'
                                    }}>
                                        {op.ativo ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                        <span>{op.ativo ? 'Ativo' : 'Inativo'}</span>
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}><span>Email: </span><span>{op.email}</span></div>
                                <div style={{ fontSize: '0.85rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Building2 size={12} />
                                    <span>Empresa: </span><span>{op.empresas?.nome || 'Global / Nenhuma'}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button className="btn-secondary" onClick={() => onEdit(op)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}><Edit2 size={14} /> <span>Editar</span></button>
                                <button onClick={() => onReset(op)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#fff3cd', color: '#856404', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}><Key size={14} /> <span>Resetar</span></button>
                                <button onClick={() => onToggle(op)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: op.ativo ? '#f8d7da' : '#d4edda', color: op.ativo ? '#721c24' : '#155724', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}><span>{op.ativo ? 'Desativar' : 'Ativar'}</span></button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

const NewForm = ({ newOperador, setNewOperador, onAdd, onCancel, loading, isSuperAdmin, companies }) => (
    <div key="view-stage-new" style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '2px solid #1b4d3e' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> <span>Cadastrar Novo Perfil</span>
        </h3>

        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '2rem', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="tipo_acesso" value="colaborador" checked={newOperador.tipo_acesso === 'colaborador'} onChange={(e) => setNewOperador({ ...newOperador, tipo_acesso: e.target.value })} />
                <Users size={16} color="#1b4d3e" />
                <span>Operador (Limitado)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="tipo_acesso" value="admin" checked={newOperador.tipo_acesso === 'admin'} onChange={(e) => setNewOperador({ ...newOperador, tipo_acesso: e.target.value })} />
                <ShieldCheck size={16} color="#3182ce" />
                <span>Administrador (Total)</span>
            </label>
        </div>

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
                <input type="password" placeholder="Mínimo 6 caracteres" value={newOperador.senha} onChange={(e) => setNewOperador({ ...newOperador, senha: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
            {isSuperAdmin && (
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}><span>Vincular à Empresa (Opcional)</span></label>
                    <select
                        value={newOperador.empresa_id}
                        onChange={(e) => setNewOperador({ ...newOperador, empresa_id: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd', background: 'white' }}
                    >
                        <option value=""><span>-- Nenhuma / Empresa Global --</span></option>
                        {companies.map(c => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>
                </div>
            )}
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
    <div key="view-stage-edit" style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '2px solid #1b4d3e' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}><span>Editar Perfil</span></h3>
        <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}><span>Nome Completo</span></label>
            <input type="text" value={editForm.nome_completo} onChange={(e) => setEditForm({ ...editForm, nome_completo: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" onClick={onSave} disabled={loading}><span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span></button>
            <button className="btn-secondary" onClick={onCancel}><span>Cancelar</span></button>
        </div>
    </div>
);

const SuccessView = ({ password, onDone, onCopy }) => (
    <div key="view-stage-success" style={{ padding: '2rem', borderRadius: '8px', background: '#fff3cd', border: '1px solid #ffc107', textAlign: 'center' }}>
        <CheckCircle size={48} color="#856404" style={{ marginBottom: '1rem' }} />
        <h3 style={{ color: '#856404', marginBottom: '0.5rem' }}><span>Senha Gerada com Sucesso!</span></h3>
        <p style={{ marginBottom: '1.5rem' }}><span>Copie a senha abaixo e envie para o convidado:</span></p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #ffc107', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            <code style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{password}</code>
            <button onClick={() => onCopy(password)} style={{ background: '#1b4d3e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}><Copy size={16} /></button>
        </div>
        <button className="btn-primary" onClick={onDone}><span>Entendido</span></button>
    </div>
);


export default function AdminColaboradoresPanel() {
    const { profile, isAdmin } = useAuth();
    const [operadores, setOperadores] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'new', 'edit', 'success'

    // Super Admin Detection (Owner mode: Admin profile without fixed company)
    const isSuperAdmin = isAdmin() && !profile?.empresa_id;

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ nome_completo: '', empresa_id: '' });

    const [newOperador, setNewOperador] = useState({
        nome_completo: '',
        email: '',
        senha: '',
        empresa_id: profile?.empresa_id || '',
        tipo_acesso: 'colaborador' // default
    });

    const [generatedPassword, setGeneratedPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const VERSION = "v3.2.0-FLEXIBLE";

    const loadData = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);

            // 1. Fetch Everyone (Users and Admins)
            let query = supabase
                .from('perfis')
                .select(`
                    *,
                    empresas (id, nome, cnpj)
                `);

            if (profile?.empresa_id) {
                // Regular admin only sees their company's operators
                query = query.eq('empresa_id', profile.empresa_id).eq('tipo_acesso', 'colaborador');
            } else if (!isSuperAdmin) {
                // Safety fallback: if not superadmin and no company, show nothing or only self
                query = query.eq('id', profile?.id);
            }
            // SuperAdmin shows everything (no filters)

            const { data: opsData, error: opsError } = await query.order('created_at', { ascending: false });
            if (opsError) throw opsError;
            setOperadores(opsData || []);

            // 2. Fetch Companies (Only for SuperAdmin)
            if (isSuperAdmin) {
                const { data: compData, error: compError } = await supabase
                    .from('empresas')
                    .select('id, nome')
                    .order('nome');
                if (compError) throw compError;
                setCompanies(compData || []);
            }

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            setMessage({ type: 'error', text: 'Erro ao carregar informações do banco.' });
        } finally {
            if (!silent) setLoading(false);
        }
    }, [profile?.id, profile?.empresa_id, isSuperAdmin]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Cleanup messages
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 10000);
            return () => clearTimeout(timer);
        }
    }, [message.text]);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleAddOperador = async () => {
        const nome = newOperador.nome_completo?.trim();
        const email = newOperador.email?.trim();
        const senha = newOperador.senha?.trim();
        const targetTipo = newOperador.tipo_acesso;
        const targetEmpresaId = newOperador.empresa_id || null; // Force null if empty

        if (!nome || !email || !validateEmail(email) || !senha || senha.length < 6) {
            setMessage({ type: 'error', text: 'Preencha todos os campos corretamente (Senha mín. 6 chars).' });
            return;
        }

        setLoading(true);
        try {
            // Create user in Auth
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email,
                password: senha,
                email_confirm: true,
                user_metadata: { nome_completo: nome, tipo_acesso: targetTipo }
            });

            if (authError) throw authError;

            // Trigger and manual profile update 
            const { error: perfilError } = await supabase
                .from('perfis')
                .update({
                    empresa_id: targetEmpresaId,
                    nome_completo: nome,
                    ativo: true,
                    tipo_acesso: targetTipo
                })
                .eq('id', authData.user.id);

            if (perfilError) throw perfilError;

            setGeneratedPassword(senha);
            setNewOperador({
                nome_completo: '',
                email: '',
                senha: '',
                empresa_id: profile?.empresa_id || '',
                tipo_acesso: 'colaborador'
            });
            await loadData(true);
            setViewMode('success');
            setMessage({ type: 'success', text: 'Acesso criado com sucesso!' });
        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            setMessage({ type: 'error', text: 'Falha no cadastro: ' + (error.message || 'Erro de conexão') });
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
            setMessage({ type: 'success', text: 'Pefil atualizado!' });
        } catch (error) {
            console.error('Erro ao atualizar:', error);
            setMessage({ type: 'error', text: 'Erro ao salvar alterações.' });
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
            setMessage({ type: 'success', text: `Status atualizado!` });
        } catch (error) {
            console.error('Erro:', error);
            setMessage({ type: 'error', text: 'Falha ao alterar status.' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (op) => {
        if (!window.confirm(`Tem certeza que deseja resetar a senha de ${op.nome_completo}?`)) return;

        setLoading(true);
        try {
            const novaSenha = generateTemporaryPassword();
            const { error } = await supabase.auth.admin.updateUserById(op.id, { password: novaSenha });

            if (error) throw error;
            setGeneratedPassword(novaSenha);
            setViewMode('success');
            setMessage({ type: 'success', text: 'Senha resetada!' });
        } catch (error) {
            console.error('Erro:', error);
            setMessage({ type: 'error', text: 'Falha no reset de senha.' });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setMessage({ type: 'success', text: 'Copiado!' });
    };

    return (
        <div className="card" translate="no" key="main-panel-card">
            {/* Version Overlay */}
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

            {/* Global Alert Message */}
            {message.text && <StatusMessage message={message} />}

            {/* Global Loader Overlay */}
            {loading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, borderRadius: '8px' }}>
                    <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold' }}>
                        <span>Aguarde um momento...</span>
                    </div>
                </div>
            )}

            {/* Content Stage */}
            <div key={`stage-${viewMode}`} style={{ position: 'relative', minHeight: '150px' }}>
                {viewMode === 'list' && (
                    <ListView
                        operadores={operadores}
                        isSuperAdmin={isSuperAdmin}
                        onEdit={(op) => { setEditingId(op.id); setEditForm({ nome_completo: op.nome_completo, empresa_id: op.empresa_id }); setViewMode('edit'); }}
                        onReset={handleResetPassword}
                        onToggle={handleToggleAtivo}
                    />
                )}

                {viewMode === 'new' && (
                    <NewForm
                        newOperador={newOperador}
                        setNewOperador={setNewOperador}
                        onAdd={handleAddOperador}
                        onCancel={() => setViewMode('list')}
                        loading={loading}
                        isSuperAdmin={isSuperAdmin}
                        companies={companies}
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
