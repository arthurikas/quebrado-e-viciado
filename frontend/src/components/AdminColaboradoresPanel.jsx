import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { generateTemporaryPassword } from '../utils/passwordGenerator';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Edit2, Save, X, Key, CheckCircle, XCircle, Copy, Filter } from 'lucide-react';

export default function AdminOperadoresPanel() {
    const { profile } = useAuth();
    const [operadores, setOperadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showNewForm, setShowNewForm] = useState(false);
    const [newOperador, setNewOperador] = useState({
        nome_completo: '',
        email: '',
        senha: '',
        empresa_id: profile?.empresa_id || ''
    });
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            await loadOperadores();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            showMessage('error', 'Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const loadOperadores = async () => {
        try {
            let query = supabase
                .from('perfis')
                .select(`
                    *,
                    empresas (
                        id,
                        nome,
                        cnpj
                    )
                `)
                .eq('tipo_acesso', 'Operador');

            // Filtrar pela empresa do admin logado
            if (profile?.empresa_id) {
                query = query.eq('empresa_id', profile.empresa_id);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            setOperadores(data || []);
        } catch (error) {
            console.error('Erro ao carregar operadores:', error);
            showMessage('error', 'Erro ao carregar operadores');
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleAddOperador = async () => {
        if (!newOperador.nome_completo.trim()) {
            showMessage('error', 'Nome completo é obrigatório');
            return;
        }

        if (!newOperador.email.trim() || !validateEmail(newOperador.email)) {
            showMessage('error', 'Email válido é obrigatório');
            return;
        }

        const empresaId = profile?.empresa_id;
        if (!empresaId) {
            showMessage('error', 'Perfil do administrador sem empresa vinculada');
            return;
        }

        if (!newOperador.senha.trim() || newOperador.senha.length < 6) {
            showMessage('error', 'Senha deve ter pelo menos 6 caracteres');
            return;
        }

        try {
            // Usar senha fornecida manualmente
            const senhaTemporaria = newOperador.senha;

            // 1. Criar usuário no auth
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: newOperador.email,
                password: senhaTemporaria,
                email_confirm: true,
                user_metadata: {
                    nome_completo: newOperador.nome_completo,
                    tipo_acesso: 'Operador'
                }
            });

            if (authError) {
                if (authError.message.includes('already registered')) {
                    showMessage('error', 'Este email já está cadastrado');
                } else {
                    throw authError;
                }
                return;
            }

            // 2. Atualizar perfil com empresa_id
            const { error: perfilError } = await supabase
                .from('perfis')
                .update({
                    empresa_id: empresaId,
                    nome_completo: newOperador.nome_completo,
                    ativo: true
                })
                .eq('id', authData.user.id);

            if (perfilError) throw perfilError;

            // Mostrar senha gerada
            setGeneratedPassword(senhaTemporaria);
            showMessage('success', 'Operador cadastrado com sucesso! Copie a senha temporária abaixo.');

            // Limpar formulário
            setNewOperador({ nome_completo: '', email: '', senha: '', empresa_id: empresaId });
            setShowNewForm(false);

            // Recarregar lista
            loadOperadores();
        } catch (error) {
            console.error('Erro ao adicionar Operador:', error);
            showMessage('error', 'Erro ao cadastrar Operador: ' + error.message);
        }
    };

    const handleEdit = (Operador) => {
        setEditingId(Operador.id);
        setEditForm({
            nome_completo: Operador.nome_completo,
            empresa_id: Operador.empresa_id
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSaveEdit = async () => {
        if (!editForm.nome_completo.trim()) {
            showMessage('error', 'Nome completo é obrigatório');
            return;
        }

        if (!editForm.empresa_id) {
            showMessage('error', 'Selecione uma empresa');
            return;
        }

        try {
            const { error } = await supabase
                .from('perfis')
                .update({
                    nome_completo: editForm.nome_completo,
                    empresa_id: editForm.empresa_id
                })
                .eq('id', editingId);

            if (error) throw error;

            showMessage('success', 'Operador atualizado com sucesso!');
            setEditingId(null);
            setEditForm({});
            loadOperadores();
        } catch (error) {
            console.error('Erro ao atualizar Operador:', error);
            showMessage('error', 'Erro ao atualizar Operador');
        }
    };

    const handleToggleAtivo = async (Operador) => {
        try {
            const { error } = await supabase
                .from('perfis')
                .update({ ativo: !Operador.ativo })
                .eq('id', Operador.id);

            if (error) throw error;

            showMessage('success', `Operador ${!Operador.ativo ? 'ativado' : 'desativado'} com sucesso!`);
            loadOperadores();
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            showMessage('error', 'Erro ao alterar status do operador');
        }
    };

    const handleResetPassword = async (Operador) => {
        if (!window.confirm(`Deseja resetar a senha de ${Operador.nome_completo}?`)) {
            return;
        }

        try {
            const novaSenha = generateTemporaryPassword();

            const { error } = await supabase.auth.admin.updateUserById(
                Operador.id,
                { password: novaSenha }
            );

            if (error) throw error;

            setGeneratedPassword(novaSenha);
            showMessage('success', 'Senha resetada com sucesso! Copie a nova senha temporária abaixo.');
        } catch (error) {
            console.error('Erro ao resetar senha:', error);
            showMessage('error', 'Erro ao resetar senha');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showMessage('success', 'Senha copiada para a área de transferência!');
    };


    if (loading) {
        return (
            <div className="card">
                <p>Carregando operadores...</p>
            </div>
        );
    }

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, color: '#1b4d3e' }}>Gestão de Operadores</h2>
                <button
                    className="btn-primary"
                    onClick={() => setShowNewForm(!showNewForm)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {showNewForm ? <X size={18} /> : <Plus size={18} />}
                    {showNewForm ? 'Cancelar' : 'Novo Operador'}
                </button>
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

            {/* Senha Gerada */}
            {generatedPassword && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '6px',
                    marginBottom: '1.5rem',
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    color: '#856404'
                }}>
                    <strong>Senha Temporária Gerada:</strong>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginTop: '0.5rem',
                        padding: '0.75rem',
                        background: 'white',
                        borderRadius: '4px',
                        border: '1px solid #ffc107'
                    }}>
                        <code style={{ flex: 1, fontSize: '1.1rem', fontWeight: 'bold' }}>
                            {generatedPassword}
                        </code>
                        <button
                            onClick={() => copyToClipboard(generatedPassword)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: '#1b4d3e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            <Copy size={16} />
                            Copiar
                        </button>
                    </div>
                    <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 0', color: '#856404' }}>
                        ⚠️ Envie esta senha para o Operador. Ela não será exibida novamente.
                    </p>
                </div>
            )}

            {/* Formulário de Novo Operador */}
            {showNewForm && (
                <div style={{
                    background: '#f8f9fa',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    border: '2px solid #1b4d3e'
                }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={20} />
                        Cadastrar Novo Operador
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                Nome Completo *
                            </label>
                            <input
                                type="text"
                                placeholder="Nome do Operador"
                                value={newOperador.nome_completo}
                                onChange={(e) => setNewOperador({ ...newOperador, nome_completo: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '2px solid #e0e0e0' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                Email *
                            </label>
                            <input
                                type="email"
                                placeholder="email@exemplo.com"
                                value={newOperador.email}
                                onChange={(e) => setNewOperador({ ...newOperador, email: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '2px solid #e0e0e0' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                Senha Inicial *
                            </label>
                            <input
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={newOperador.senha}
                                onChange={(e) => setNewOperador({ ...newOperador, senha: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '2px solid #e0e0e0' }}
                            />
                        </div>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={handleAddOperador}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} />
                        Cadastrar Operador
                    </button>
                </div>
            )}

            {/* Filtro */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    {operadores.length} Operador(es) encontrado(s) para sua empresa
                </span>
            </div>

            {/* Lista de Operadores */}
            <div>
                {operadores.length === 0 ? (
                    <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
                        Nenhum Operador encontrado
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {operadores.map((Operador) => (
                            <div
                                key={Operador.id}
                                style={{
                                    padding: '1.25rem',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '8px',
                                    background: Operador.ativo ? 'white' : '#f5f5f5'
                                }}
                            >
                                {editingId === Operador.id ? (
                                    // Modo de Edição
                                    <div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                                    Nome Completo
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.nome_completo}
                                                    onChange={(e) => setEditForm({ ...editForm, nome_completo: e.target.value })}
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
                                                <Users size={20} color="#1b4d3e" />
                                                <strong style={{ fontSize: '1.1rem', color: '#333' }}>{Operador.nome_completo}</strong>
                                                {Operador.ativo ? (
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
                                                        Ativo
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
                                                        Inativo
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                                                Email: {Operador.email || 'Não disponível'}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#888' }}>
                                                Empresa: {Operador.empresas?.nome || 'Não vinculado'}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button
                                                className="btn-secondary"
                                                onClick={() => handleEdit(Operador)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                            >
                                                <Edit2 size={14} />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleResetPassword(Operador)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: '#fff3cd',
                                                    color: '#856404',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600
                                                }}
                                            >
                                                <Key size={14} />
                                                Resetar Senha
                                            </button>
                                            <button
                                                onClick={() => handleToggleAtivo(Operador)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: Operador.ativo ? '#f8d7da' : '#d4edda',
                                                    color: Operador.ativo ? '#721c24' : '#155724',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {Operador.ativo ? 'Desativar' : 'Ativar'}
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

