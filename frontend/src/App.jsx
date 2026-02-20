import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './config/supabaseClient';
import { CompanyProvider, useCompany } from './context/CompanyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuditProvider, useAudit } from './context/AuditContext';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import CopsoqForm from './components/CopsoqForm';
import AepForm from './components/AepForm';
import CopsoqDashboard from './components/CopsoqDashboard';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminEmpresasPanel from './components/AdminEmpresasPanel';
import AdminColaboradoresPanel from './components/AdminColaboradoresPanel';
import AepDashboard from './components/AepDashboard';
import './App.css';

// Audit Log View Component
const AuditLogView = () => {
  const { logs, clearLogs } = useAudit();

  // Calculate statistics
  const stats = logs.reduce((acc, log) => {
    const user = log.username || 'Visitante';
    if (!acc[user]) {
      acc[user] = { total: 0, avaliacoes: 0, relatorios: 0 };
    }
    acc[user].total += 1;
    if (log.action === 'Avaliação Realizada') acc[user].avaliacoes += 1;
    if (log.action === 'Relatório Gerado') acc[user].relatorios += 1;
    return acc;
  }, {});

  const sortedUsers = Object.keys(stats).sort((a, b) => stats[b].avaliacoes - stats[a].avaliacoes);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Log de Auditoria e Rastreabilidade</h2>
        <button className="btn-secondary" onClick={clearLogs} style={{ color: '#e53935', borderColor: '#e53935' }}>Limpar Logs</button>
      </div>

      {logs.length > 0 && (
        <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem', color: '#1b4d3e' }}>Resumo de Produtividade (Operadores)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {sortedUsers.map(user => (
              <div key={user} style={{ padding: '0.75rem', background: 'white', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{user}</div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  <span style={{ color: '#2d6a4f', fontWeight: 'bold' }}>{stats[user].avaliacoes}</span> Avaliações |
                  <span style={{ color: '#3182ce', fontWeight: 'bold' }}> {stats[user].relatorios}</span> Relatórios
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem' }}>Data/Hora</th>
            <th style={{ padding: '0.75rem' }}>Ação</th>
            <th style={{ padding: '0.75rem' }}>Empresa</th>
            <th style={{ padding: '0.75rem' }}>Detalhes</th>
            <th style={{ padding: '0.75rem' }}>Usuário</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>Nenhum registro encontrado.</td></tr>
          ) : (
            logs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#2c3e50' }}>{log.action}</td>
                <td style={{ padding: '0.75rem' }}>{log.company_name || '-'}</td>
                <td style={{ padding: '0.75rem', color: '#555', fontSize: '0.8rem' }}>
                  {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                </td>
                <td style={{ padding: '0.75rem' }}>{log.username}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

function AppContent() {
  const { isAuthenticated, user, profile, isAdmin, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentResult, setCurrentResult] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const { activeCompany, activeCompanyId } = useCompany();
  const { logAction } = useAudit();
  const [evaluations, setEvaluations] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Responsive logic
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch evaluations on mount and when active company changes
  const fetchEvaluations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          employees (*)
        `)
        .order('evaluation_date', { ascending: false });

      if (error) throw error;

      const formattedEvals = data.map(ev => ({
        id: ev.id,
        type: ev.type || (ev.notes?.includes('COPSOQ') ? 'COPSOQ' : 'AEP'),
        companyId: ev.company_id,
        userId: ev.created_by || 'guest',
        person: {
          name: ev.employees?.full_name || 'Anônimo',
          role: ev.employees?.job_function || '',
          sector: ev.employees?.sector_parish || '',
          company_id: ev.company_id,
          gender: ev.employees?.sex || '',
          age: ev.employees?.age || '',
          date: ev.evaluation_date
        },
        ...ev.full_data // Contains responses and results
      }));

      setEvaluations(formattedEvals);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    }
  }, []);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  // Redirect after login or logout
  useEffect(() => {
    if (isAuthenticated) {
      setGuestMode(false);
      if (isAdmin()) {
        setCurrentView('admin_dashboard');
      } else {
        setCurrentView('dashboard');
      }
    } else {
      // If not authenticated and not in guest mode, ensure we are ready for login
      if (!guestMode) {
        setCurrentView('dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, guestMode]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1b4d3e 0%, #2d6a4f 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Carregando...</h2>
          <p style={{ opacity: 0.8, marginBottom: '0.5rem' }}>Verificando autenticação e permissões</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Dica: Se demorar mais de 10 segundos, tente atualizar a página (F5).</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login
  if (!isAuthenticated && !guestMode) {
    return <Login onGuestEnter={() => {
      console.log("AppContent: Entering Guest Mode");
      setGuestMode(true);
      setCurrentView('portal_colaborador');
    }} />;
  }


  const handleCopsoqFinish = async (data) => {
    try {
      // 1. Ensure/Create employee record
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .insert([{
          full_name: data.person.name,
          sex: data.person.gender || 'O',
          age: parseInt(data.person.age) || 0,
          job_function: data.person.role || '',
          sector_parish: data.person.sector || '',
          company_id: data.person.company_id || activeCompanyId
        }])
        .select()
        .single();

      if (empError) throw empError;

      // 2. Create evaluation record
      const { data: evalData, error: evalError } = await supabase
        .from('evaluations')
        .insert([{
          employee_id: empData.id,
          type: 'COPSOQ',
          company_id: data.person.company_id || activeCompanyId,
          full_data: {
            responses: data.responses,
            results: data.results,
            pontuacao_geral: data.pontuacao_geral
          },
          status: 'COMPLETED'
        }])
        .select()
        .single();

      if (evalError) throw evalError;

      const newEval = {
        id: evalData.id,
        type: 'COPSOQ',
        companyId: data.person.company_id || activeCompanyId,
        userId: user?.id || 'guest',
        ...data
      };

      setEvaluations(prev => [newEval, ...prev]);

      logAction('Avaliação Realizada', `Questionário baseado no COPSOQ II finalizado para ${data.person.name}`, user?.email || 'Visitante', data.person.company_id || activeCompanyId, data.person.company_name || activeCompany?.nome);

      setCurrentResult(newEval);
      setCurrentView('copsoq_result');
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      alert('Erro ao salvar no banco de dados: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleAepFinish = async (data) => {
    try {
      // 1. Ensure/Create employee record
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .insert([{
          full_name: data.person.name,
          sex: data.person.gender || 'O',
          age: parseInt(data.person.age) || 0,
          job_function: data.person.role || '',
          sector_parish: data.person.sector || '',
          company_id: data.person.company_id || activeCompanyId
        }])
        .select()
        .single();

      if (empError) throw empError;

      // 2. Create evaluation record
      const { data: evalData, error: evalError } = await supabase
        .from('evaluations')
        .insert([{
          employee_id: empData.id,
          type: 'AEP',
          company_id: data.person.company_id || activeCompanyId,
          full_data: {
            scores: data.scores,
            raw: data.raw,
            images: data.images,
            subType: data.formType
          },
          status: 'COMPLETED'
        }])
        .select()
        .single();

      if (evalError) throw evalError;

      const newEval = {
        id: evalData.id,
        type: 'AEP',
        subType: data.formType,
        companyId: data.person.company_id || activeCompanyId,
        userId: user?.id || 'guest',
        ...data
      };

      setEvaluations(prev => [newEval, ...prev]);

      logAction('Avaliação Realizada', `AEP ${data.formType} finalizado para ${data.person.name}`, user?.email || 'Visitante', data.person.company_id || activeCompanyId, data.person.company_name || activeCompany?.nome);

      setCurrentResult(newEval);
      setCurrentView('copsoq_result');
    } catch (error) {
      console.error('Erro ao salvar AEP:', error);
      alert('Erro ao salvar avaliação: ' + (error.message || error.details || 'Verifique se a tabela evaluations possui a coluna full_data do tipo JSONB e se o tamanho das fotos não excede o limite. Detalhes: ' + JSON.stringify(error)));
    }
  };

  const handleDownloadReport = async (ev) => {
    const { generateAepReport } = await import('./utils/AepReportGenerator');
    await generateAepReport({
      scores: ev.scores.details || ev.scores,
      raw: ev.raw,
      images: ev.images,
      formType: ev.subType
    }, {
      nomeEmpresa: ev.person.name,
      avaliador: ev.person.evaluator,
      dataAvaliacao: new Date(ev.person.date).toLocaleDateString('pt-BR')
    });

    logAction('Relatório Gerado', `Relatório AEP exportado para ${ev.person.name}`, user?.email || profile?.nome_completo, ev.companyId || ev.person.company_id, ev.person.company_name || activeCompany?.nome);
  };

  const renderView = () => {
    // If guest mode, show portal or current form
    if (guestMode) {
      if (currentView === 'portal_colaborador') {
        return (
          <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ color: '#1b4d3e', marginBottom: '1.5rem' }}>Portal do Colaborador</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Selecione o questionário que deseja responder:</p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                className="btn-tipo-avaliacao"
                onClick={() => setCurrentView('copsoq')}
                style={{ height: 'auto', padding: '2rem', maxWidth: '400px', width: '100%' }}
              >
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>BASEADO NO COPSOQ II</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Saúde Mental e Riscos Psicossociais</div>
              </button>
            </div>

            <button
              className="btn-secondary"
              onClick={() => setGuestMode(false)}
              style={{ marginTop: '2rem' }}
            >
              Voltar ao Início
            </button>
          </div>
        );
      }

      if (currentView === 'copsoq') {
        return <CopsoqForm onFinish={handleCopsoqFinish} onCancel={() => setCurrentView('portal_colaborador')} />;
      }

      if (currentView === 'aep') {
        return <AepForm onFinish={handleAepFinish} onCancel={() => setCurrentView('portal_colaborador')} />;
      }

      if (currentView === 'copsoq_result') {
        if (currentResult?.type === 'AEP') {
          return <AepDashboard evaluation={currentResult} onBack={() => {
            setGuestMode(false);
            setCurrentView('dashboard');
          }} />;
        }
        return (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#1b4d3e' }}>Questionário Finalizado!</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Obrigado por sua participação. Seus dados foram salvos com sucesso.</p>
            <button className="btn-primary" onClick={() => {
              setGuestMode(false);
              setCurrentView('dashboard');
            }}>Voltar</button>
          </div>
        );
      }
    }

    // Admin permissions
    if (isAuthenticated && !isAdmin() && !['copsoq', 'aep', 'copsoq_result'].includes(currentView)) {
      // Repurpose collaborator view to portal if they somehow login
      setCurrentView('copsoq');
    }

    switch (currentView) {
      case 'admin_dashboard':
        return <AdminDashboard onNavigate={setCurrentView} />;

      case 'admin_empresas':
        return <AdminEmpresasPanel onBack={() => setCurrentView('admin_dashboard')} />;

      case 'admin_colaboradores':
        return <AdminColaboradoresPanel />;

      case 'copsoq':
        return <CopsoqForm onFinish={handleCopsoqFinish} onCancel={() => setCurrentView('dashboard')} />;

      case 'copsoq_result':
        if (currentResult?.type === 'AEP') {
          return <AepDashboard evaluation={currentResult} onBack={() => setCurrentView('dashboard')} />;
        }
        return <CopsoqDashboard results={currentResult?.results} person={currentResult?.person} onBack={() => setCurrentView('dashboard')} />;

      case 'aep':
        return <AepForm onFinish={handleAepFinish} onCancel={() => setCurrentView('dashboard')} />;

      case 'audit':
        return <AuditLogView />;

      case 'dashboard':
      default:
        const dashboardData = activeCompanyId
          ? evaluations.filter(e => e.companyId === activeCompanyId)
          : evaluations;

        return (
          <div className="main-content">
            <div style={{ marginBottom: '2rem' }}>
              <Dashboard
                evaluationsList={dashboardData}
                onBack={() => setCurrentView('admin_dashboard')}
              />
            </div>

            {/* History List */}
            <div className="card">
              <h3>Histórico de Avaliações Recentes ({activeCompany ? activeCompany.name : 'Geral'})</h3>
              {dashboardData.length === 0 ? (
                <p style={{ color: '#888' }}>Nenhuma avaliação realizada para este contexto.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {dashboardData.map(ev => (
                    <div key={ev.id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div onClick={() => {
                        setCurrentResult(ev);
                        setCurrentView('copsoq_result');
                      }} style={{ cursor: 'pointer', flex: 1 }}>
                        <strong>{ev.person.name}</strong> - {ev.type || 'N/A'}
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          {new Date(ev.person.date || Date.now()).toLocaleDateString()}
                          {ev.person.evaluator && ` | Avaliador: ${ev.person.evaluator}`}
                          {ev.person.role && ` | ${ev.person.role}`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {ev.type === 'AEP' && (
                          <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleDownloadReport(ev)}>
                            Baixar DOCX
                          </button>
                        )}
                        {ev.type === 'COPSOQ' && (
                          <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={async () => {
                            const { generateCopsoqHtmlReport } = await import('./utils/CopsoqTechnicalReportGenerator');
                            generateCopsoqHtmlReport(ev.results, {
                              ...ev.person,
                              company_name: ev.person.company || activeCompany?.nome,
                              evaluator: ev.person.evaluator || profile?.nome_completo
                            });
                            logAction('Relatório Gerado', `Relatório Técnico baseado no COPSOQ II exportado para ${ev.person.name}`, user?.email || profile?.nome_completo, ev.companyId || ev.person.company_id, ev.person.company_name || activeCompany?.nome);
                          }}>
                            Relatório Técnico
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  // Responsive Margin

  return (
    <div className="App" style={{ display: 'flex' }}>
      {!guestMode && <Sidebar currentView={currentView} setView={setCurrentView} />}

      <main style={{
        marginLeft: (isMobile || guestMode) ? '0' : '260px',
        padding: (isMobile || guestMode) ? '5rem 1rem 2rem' : '2rem',
        width: '100%',
        minHeight: '100vh',
        background: '#f8f9fa',
        transition: 'margin-left 0.3s ease'
      }}>
        {!isMobile && (
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: '#555', fontSize: '1.2rem', margin: 0 }}>
              {profile?.nome_completo || 'Usuário'}
              <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '1rem' }}>
                {isAdmin() ? '(Administrador)' : '(Colaborador)'}
              </span>
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>
              Ambiente Seguro | v2.0
            </div>
          </div>
        )}

        {renderView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <AuditProvider>
          <AppContent />
        </AuditProvider>
      </CompanyProvider>
    </AuthProvider>
  );
}

export default App;
