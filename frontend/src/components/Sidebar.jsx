import React, { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileSpreadsheet, Ruler, Building2, Users, List, Menu, X, LogOut, UserCircle, Shield } from 'lucide-react';

export default function Sidebar({ currentView, setView }) {
    const { companies, activeCompanyId, setActiveCompanyId } = useCompany();
    const { profile, logout, isAdmin } = useAuth();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isOpen, setIsOpen] = useState(false);

    // Monitor resize to toggle mobile mode
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const allMenuItems = [
        { id: 'admin_dashboard', label: 'Painel Admin', icon: <Shield size={20} />, adminOnly: true },
        { id: 'admin_empresas', label: 'Cadastro de Empresas', icon: <Building2 size={20} />, adminOnly: true },
        { id: 'admin_colaboradores', label: 'Gestão de Operadores', icon: <Users size={20} />, adminOnly: true },
        { id: 'dashboard', label: 'Dashboard Analítico', icon: <LayoutDashboard size={20} />, adminOnly: false },
        { id: 'copsoq', label: 'Questionário baseado no COPSOQ II', icon: <FileSpreadsheet size={20} />, adminOnly: false },
        { id: 'aep', label: 'Questionário AEP', icon: <Ruler size={20} />, adminOnly: true },
        { id: 'audit', label: 'Log de Auditoria', icon: <List size={20} />, adminOnly: true }
    ];

    // Filter menu based on role
    const menuItems = allMenuItems.filter(item => !item.adminOnly || isAdmin());

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLogout = async () => {
        if (window.confirm('Deseja realmente sair do sistema?')) {
            await logout();
        }
    };

    return (
        <>
            {/* Mobile Header / Hamburger */}
            {isMobile && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '60px',
                    background: '#1b4d3e', color: 'white', display: 'flex', alignItems: 'center',
                    padding: '0 1rem', zIndex: 1000, boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                    <button onClick={toggleMenu} style={{ background: 'transparent', border: 'none', color: 'white', marginRight: '1rem', cursor: 'pointer' }}>
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                    <img
                        src="/assets/normalizze-logo.png"
                        alt="Normalizze"
                        style={{ height: '32px', width: 'auto', opacity: 0.95 }}
                    />
                </div>
            )}

            {/* Sidebar Container */}
            <div style={{
                width: '260px',
                height: '100vh',
                background: '#1b4d3e',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                left: isMobile ? (isOpen ? 0 : '-260px') : 0,
                top: 0,
                zIndex: 1001,
                transition: 'left 0.3s ease',
                paddingTop: isMobile ? '60px' : '0'
            }}>
                {/* Desktop Header with Natural Logo Integration */}
                {!isMobile && (
                    <div style={{
                        padding: '1.25rem 1rem 1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <img
                            src="/assets/normalizze-logo.png"
                            alt="Normalizze"
                            style={{
                                width: '85px',
                                height: 'auto',
                                opacity: 0.95
                            }}
                        />
                        <p style={{
                            fontSize: '0.68rem',
                            opacity: 0.65,
                            margin: 0,
                            textAlign: 'center',
                            letterSpacing: '0.8px',
                            textTransform: 'uppercase',
                            fontWeight: 500
                        }}>
                            Gestão Ocupacional
                        </p>
                    </div>
                )}

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setView(item.id);
                                if (isMobile) setIsOpen(false);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                width: '100%',
                                padding: '0.75rem 1.5rem',
                                background: currentView === item.id ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
                                border: 'none',
                                borderLeft: currentView === item.id ? '4px solid #4caf50' : '4px solid transparent',
                                color: currentView === item.id ? '#4caf50' : '#e0e0e0',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== item.id) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== item.id) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            {item.icon}
                            <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Footer */}
                <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <UserCircle size={32} style={{ opacity: 0.8 }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                {profile?.nome_completo || 'Usuário'}
                            </div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                                {isAdmin() ? 'Administrador' : 'Colaborador'}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            width: '100%',
                            padding: '0.6rem',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        }}
                    >
                        <LogOut size={18} />
                        Sair do Sistema
                    </button>
                </div>
            </div>

            {/* Overlay for Mobile */}
            {isMobile && isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh',
                        background: 'rgba(0,0,0,0.5)', zIndex: 1000
                    }}
                />
            )}
        </>
    );
}
