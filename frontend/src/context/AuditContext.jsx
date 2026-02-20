import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

const AuditContext = createContext();

export const useAudit = () => useContext(AuditContext);

export const AuditProvider = ({ children }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('audit_logs')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(100);

            if (error) throw error;
            setLogs(data || []);
        } catch (err) {
            console.error('Erro ao buscar logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const logAction = async (action, details, username = 'Sistema', companyId = null, companyName = null) => {
        try {
            const { error } = await supabase
                .from('audit_logs')
                .insert([{
                    action,
                    details,
                    username,
                    company_id: companyId,
                    company_name: companyName
                }]);

            if (error) throw error;

            // Re-fetch or locally update to show immediate feedback
            fetchLogs();
        } catch (err) {
            console.error('Erro ao registrar log:', err);
            // Fallback to local state if Supabase fails (optional)
            const newLog = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                action,
                details,
                username
            };
            setLogs(prev => [newLog, ...prev]);
        }
    };

    const clearLogs = async () => {
        if (window.confirm('Tem certeza que deseja limpar todo o histórico de auditoria no banco de dados?')) {
            try {
                // In a real app, typically you don't delete logs, you archive them.
                // But for this request, we'll implement a reset.
                const { error } = await supabase
                    .from('audit_logs')
                    .delete()
                    .not('id', 'eq', 0); // Delete all

                if (error) throw error;
                setLogs([]);
            } catch (err) {
                console.error('Erro ao limpar logs:', err);
            }
        }
    };

    return (
        <AuditContext.Provider value={{ logs, logAction, clearLogs, loading, refreshLogs: fetchLogs }}>
            {children}
        </AuditContext.Provider>
    );
};
