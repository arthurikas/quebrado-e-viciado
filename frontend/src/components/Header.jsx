import React from 'react';

export default function Header() {
    return (
        <header style={{
            backgroundColor: 'var(--color-primary-dark)',
            color: 'white',
            padding: '1rem 0',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-md)'
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-primary)',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                    }}>
                        N
                    </div>
                    <div>
                        <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem' }}>Normalizze</h2>
                        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>Gestão de Saúde Ocupacional</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
