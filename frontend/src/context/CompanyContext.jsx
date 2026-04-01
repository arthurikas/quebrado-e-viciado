import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { useAuth } from './AuthContext';

const CompanyContext = createContext();

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};

export const CompanyProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCompanyId, setActiveCompanyId] = useState(null);

    // Fetch real companies from Supabase
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                console.log('Fetching companies (Auth:', isAuthenticated, ')');
                const { data, error } = await supabase
                    .from('empresas')
                    .select('*')
                    .eq('ativo', true)
                    .order('nome');

                if (error) throw error;

                setCompanies(data || []);
                if (data && data.length > 0 && !activeCompanyId) {
                    setActiveCompanyId(data[0].id);
                }
            } catch (err) {
                console.error('Erro ao buscar empresas no Context:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, [isAuthenticated]);

    const activeCompany = companies.find(c => c.id === activeCompanyId);

    // Dynamic sectors and roles could be added here if needed in a separate table
    // For now we keep it simple based on the user request focusing on enterprise-centric BI
    const [sectors] = useState([]);
    const [roles] = useState([]);

    const addCompany = (company) => {
        setCompanies([...companies, company]);
    };

    return (
        <CompanyContext.Provider value={{
            companies,
            activeCompany,
            activeCompanyId,
            setActiveCompanyId,
            addCompany,
            loading,
            sectors,
            roles,
            activeSectors: sectors, // For now, since company-specific sectors aren't populated
            activeRoles: roles     // For now, same as roles
        }}>
            {children}
        </CompanyContext.Provider>
    );
};
