import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Lock, Mail, Clock, Trophy, FileDown, ChevronRight, LogOut, Users, BookOpen, BarChart3, CheckCircle, XCircle, AlertCircle, Star, Target, TrendingUp, Award, Download, Loader } from 'lucide-react';

// Configuração do Supabase
const SUPABASE_URL = 'https://onsojrbgrqkvbumplesd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uc29qcmJncnFrdmJ1bXBsZXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MDEyNzEsImV4cCI6MjA2NTA3NzI3MX0.VKZ6MJMpbzNeXF7tVhonTWyF1McBJpBEl9-z4_te8cE';

// Simulação do cliente Supabase (em produção, use @supabase/supabase-js)
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.auth = {
      user: null,
      session: null
    };
  }

  async signIn(email, password) {
    // Simulação de login - em produção use o cliente real
    const mockUser = {
      id: 'mock-user-id',
      email: email,
      user_metadata: { name: email.split('@')[0] }
    };
    
    this.auth.user = mockUser;
    this.auth.session = { user: mockUser };
    
    return { user: mockUser, error: null };
  }

  async signUp(email, password, metadata = {}) {
    // Simulação de registro
    const mockUser = {
      id: 'mock-user-id-' + Date.now(),
      email: email,
      user_metadata: metadata
    };
    
    this.auth.user = mockUser;
    this.auth.session = { user: mockUser };
    
    return { user: mockUser, error: null };
  }

  async signOut() {
    this.auth.user = null;
    this.auth.session = null;
    return { error: null };
  }

  async resetPassword(email) {
    // Simulação de reset de senha
    return { error: null };
  }

  getUser() {
    return this.auth.user;
  }

  // Simulação de queries
  from(table) {
    // Dados mockados para demonstração
    const mockData = {
      quizzes: [
        { id: 1, name: "Simulado 1 - Teoria e Fundamentos Scrum", description: "Empirismo, pilares do Scrum", question_count: 80, time_limit: 60, passing_score: 80, is_active: true },
        { id: 2, name: "Simulado 2 - Time Scrum e Responsabilidades", description: "Papéis e responsabilidades", question_count: 80, time_limit: 60, passing_score: 80, is_active: true },
        { id: 3, name: "Simulado 3 - Eventos e Timeboxes", description: "Eventos Scrum e timeboxes", question_count: 80, time_limit: 60, passing_score: 80, is_active: true },
        { id: 4, name: "Simulado 4 - Artefatos e Compromissos", description: "Artefatos do Scrum", question_count: 80, time_limit: 60, passing_score: 80, is_active: true },
        { id: 5, name: "Simulado 5 - Valores e Práticas", description: "Valores do Scrum", question_count: 80, time_limit: 60, passing_score: 80, is_active: true },
        { id: 6, name: "Simulado 6 - Simulado Completo PSM I", description: "Simulado completo", question_count: 80, time_limit: 60, passing_score: 80, is_active: true }
      ]
    };

    return {
      select: () => ({
        eq: () => ({
          single: async () => ({ data: mockData[table]?.[0] || null, error: null }),
          execute: async () => ({ data: mockData[table] || [], error: null })
        }),
        execute: async () => ({ data: mockData[table] || [], error: null })
      }),
      insert: () => ({
        execute: async () => ({ data: null, error: null })
      }),
      update: () => ({
        eq: () => ({
          execute: async () => ({ data: null, error: null })
        })
      })
    };
  }
}

// Criar instância do cliente
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Context para autenticação
const AuthContext = createContext({});
const useAuth = () => useContext(AuthContext);

// Provider de Autenticação
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = supabase.getUser();
      if (currentUser) {
        setUser(currentUser);
        await fetchProfile(currentUser.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signIn = async (email, password) => {
    try {
      const { user, error } = await supabase.signIn(email, password);
      if (error) throw error;
      
      setUser(user);
      await fetchProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const { user, error } = await supabase.signUp(email, password, {
        name: name
      });
      if (error) throw error;
      
      setUser(user);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const signOut = async () => {
    try {
      await supabase.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.resetPassword(email);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600">Carregando...</p>
    </div>
  </div>
);

// Login Component
const LoginView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, name);
        if (error) setError(error);
      } else {
        const { error } = await signIn(email, password);
        if (error) setError(error);
      }
    } catch (err) {
      setError('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error);
      } else {
        alert('Email de recuperação enviado! Verifique sua caixa de entrada.');
        setShowForgotPassword(false);
      }
    } catch (err) {
      setError('Erro ao enviar email de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Recuperar Senha</h2>
            <p className="text-gray-600 mt-2">Digite seu email para receber instruções</p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>

            <button
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
            </button>

            <button
              onClick={() => setShowForgotPassword(false)}
              className="w-full text-gray-600 hover:text-gray-800 transition-colors"
            >
              Voltar ao Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Certificação Gestão Ágil</h1>
          <p className="text-gray-600 mt-2">Simulados PSM I - Scrum.org</p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Seu nome"
                />
                <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isSignUp && handleSubmit()}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
          </button>

          <div className="space-y-3">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="w-full text-purple-600 hover:text-purple-700 transition-colors"
            >
              {isSignUp ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
            </button>

            {!isSignUp && (
              <button
                onClick={() => setShowForgotPassword(true)}
                className="w-full text-gray-600 hover:text-gray-700 transition-colors text-sm"
              >
                Esqueci minha senha
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar simulados
      const { data: quizzesData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('is_active', true)
        .execute();

      setQuizzes(quizzesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Simulação de dados para demonstração
  const mockStats = {
    quizzes_attempted: 3,
    total_attempts: 15,
    overall_average: 75.5,
    best_score: 93,
    total_passes: 10,
    total_mastery: 5,
    ready_for_certification: false
  };

  const displayStats = stats || mockStats;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Olá, {profile?.name || user?.email}!</h1>
          <button
            onClick={signOut}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {/* Status Card */}
        <div className={`rounded-xl p-6 mb-6 text-white ${
          displayStats.ready_for_certification 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
            : 'bg-gradient-to-r from-orange-500 to-red-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {displayStats.ready_for_certification 
                  ? '🎉 Parabéns! Você está pronto!' 
                  : '💪 Continue estudando!'}
              </h2>
              <p className="text-lg opacity-90">
                {displayStats.ready_for_certification 
                  ? 'Você atingiu 90% ou mais em pelo menos 3 tentativas de cada simulado!'
                  : 'Complete todos os simulados com 90% ou mais em 3 tentativas.'}
              </p>
            </div>
            <Trophy className="w-24 h-24 opacity-50" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-10 h-10 text-blue-600" />
              <span className="text-3xl font-bold text-gray-800">
                {displayStats.overall_average.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Média Geral</h3>
            <p className="text-sm text-gray-500">Em todos os simulados</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-10 h-10 text-purple-600" />
              <span className="text-3xl font-bold text-gray-800">
                {displayStats.total_attempts}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Simulados Realizados</h3>
            <p className="text-sm text-gray-500">Total de tentativas</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-10 h-10 text-green-600" />
              <span className="text-3xl font-bold text-gray-800">
                {displayStats.quizzes_attempted}/6
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Simulados Tentados</h3>
            <p className="text-sm text-gray-500">De 6 disponíveis</p>
          </div>
        </div>

        {/* Quiz List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Simulados Disponíveis</h2>
          
          <div className="grid gap-4">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">{quiz.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{quiz.question_count} questões</span>
                      <span>{quiz.time_limit} minutos</span>
                      <span>Aprovação: {quiz.passing_score}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Iniciar ${quiz.name}`)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    Iniciar
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informação sobre integração */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📝 Nota sobre a integração</h3>
          <p className="text-blue-800 text-sm">
            Este é um exemplo de integração com Supabase. Para funcionar completamente, você precisa:
          </p>
          <ul className="list-disc list-inside text-blue-800 text-sm mt-2">
            <li>Instalar o pacote @supabase/supabase-js</li>
            <li>Configurar as políticas de segurança (RLS) adequadamente</li>
            <li>Inserir as questões no banco de dados</li>
            <li>Implementar as funções de quiz completas</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

// Authenticated App Router
const AuthenticatedApp = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return user ? <Dashboard /> : <LoginView />;
};

export default App;
