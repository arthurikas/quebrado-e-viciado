import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

export default function Login({ onGuestEnter }) {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validação básica
        if (!formData.email || !formData.password) {
            setError('Por favor, preencha todos os campos');
            setLoading(false);
            return;
        }

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Por favor, insira um email válido');
            setLoading(false);
            return;
        }

        try {
            const result = await login(formData.email, formData.password);

            if (!result.success) {
                setError(result.error);
            }
            // Se sucesso, o redirecionamento será feito pelo App.jsx baseado no tipo_acesso
        } catch (err) {
            console.error("Login component error:", err);
            setError('Erro inesperado na conexão. Verifique sua internet.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1b4d3e 0%, #2d6a4f 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                maxWidth: '440px',
                width: '100%',
                padding: '2.5rem'
            }}>
                {/* Logo Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img
                        src="/assets/normalizze-logo.png"
                        alt="Normalizze"
                        style={{ width: '140px', height: 'auto', marginBottom: '1rem' }}
                    />
                    <h2 style={{ fontSize: '1.5rem', color: '#1b4d3e', margin: '0 0 0.5rem' }}>
                        Bem-vindo
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
                        Sistema de Gestão Ocupacional
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        background: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#c33'
                    }}>
                        <AlertCircle size={18} />
                        <span style={{ fontSize: '0.9rem' }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#333',
                            marginBottom: '0.5rem'
                        }}>
                            E-mail
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e0e0e0',
                                borderRadius: '6px',
                                fontSize: '0.95rem',
                                transition: 'border-color 0.2s',
                                outline: 'none',
                                opacity: loading ? 0.6 : 1
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#1b4d3e'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#333',
                            marginBottom: '0.5rem'
                        }}>
                            Senha
                        </label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e0e0e0',
                                borderRadius: '6px',
                                fontSize: '0.95rem',
                                transition: 'border-color 0.2s',
                                outline: 'none',
                                opacity: loading ? 0.6 : 1
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#1b4d3e'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.9rem',
                            background: loading ? '#ccc' : 'linear-gradient(135deg, #1b4d3e 0%, #2d6a4f 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            marginTop: '1.5rem'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 20px rgba(27, 77, 62, 0.3)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        <LogIn size={20} />
                        {loading ? 'Entrando...' : 'Entrar no Sistema'}
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.25rem' }}>
                        Vai responder a um questionário?
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            console.log("Login: Clicked Guest Button");
                            if (onGuestEnter) onGuestEnter();
                        }}
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            background: 'white',
                            color: '#1b4d3e',
                            border: '2px solid #1b4d3e',
                            borderRadius: '6px',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = '#f0fdf4';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'white';
                        }}
                    >
                        Responder como Colaborador
                    </button>
                </div>

                <p style={{
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: '#999',
                    marginTop: '2rem',
                    marginBottom: 0
                }}>
                    © 2026 Normalizze - Consultoria em Saúde e Segurança do Trabalho
                </p>
            </div>
        </div>
    );
}
