import React, { useState, useEffect, useCallback } from 'react';
import { LogIn, User, Send, ExternalLink, Download, FileText, BookOpen, GitBranch, Linkedin, Twitter, Settings, Trash2, Edit, Save, Plus } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001/api';

// --- HELPERS E ESTILOS COMPONENTIZADOS ---

// Estilos Glassmorphism Base
const glassmorphism = "bg-white/5 backdrop-blur-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 transition-all duration-300 hover:shadow-cyan-400/30";
const neonText = "text-cyan-400 drop-shadow-[0_0_8px_rgba(52,211,255,0.7)]";

// Loader/Status Component
const StatusMessage = ({ type, message }) => {
    let color = 'text-white';
    if (type === 'success') color = 'text-green-400';
    if (type === 'error') color = 'text-red-400';
    if (type === 'loading') color = neonText;
    
    return message ? <p className={`text-sm mt-2 ${color} animate-pulse`}>{message}</p> : null;
};

// Botão Futurista
const FuturisticButton = ({ children, onClick, className = '', disabled = false, icon: Icon, type = 'button' }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg ${glassmorphism} ${neonText} text-sm font-semibold 
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.03] active:scale-[0.98]'} 
            ${className}`}
    >
        {Icon && <Icon size={18} />}
        <span>{children}</span>
    </button>
);

// Glass Card Base
const GlassCard = ({ children, className = '' }) => (
    <div className={`p-6 rounded-xl ${glassmorphism} ${className}`}>
        {children}
    </div>
);

// --- CONTEXTO DE APLICAÇÃO ---

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('jwtToken'));
    const [portfolioData, setPortfolioData] = useState({ profile: {}, certificates: [], publications: [] });
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [profilePhotoVisible, setProfilePhotoVisible] = useState(true);
    const [fetchError, setFetchError] = useState(null); // Estado para rastrear erros de fetch

    // Efeito para sincronizar autenticação no carregamento
    useEffect(() => {
        if (token) {
            setIsAuthenticated(true);
        }
    }, [token]);

    const fetchData = useCallback(async () => {
        setFetchError(null); // Reseta o erro ao tentar buscar
        try {
            const res = await fetch(`${API_BASE_URL}/portfolio/data`);
            if (!res.ok) throw new Error("Erro ao carregar dados do portfólio.");
            const data = await res.json();
            setPortfolioData(data);
            setIsDataLoaded(true);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            
            // Adiciona uma verificação para erros de conexão (Failed to fetch) e fornece uma mensagem clara.
            if (error.name === 'TypeError' || String(error).includes('Failed to fetch')) {
                const criticalError = "ERRO CRÍTICO: O servidor Node.js (http://localhost:3001) não está rodando ou está inacessível. Verifique se você executou 'npm start' no backend.";
                console.error(criticalError);
                setFetchError(criticalError); // Define o estado de erro
            } else {
                setFetchError(error.message);
            }
            
            // Permite a renderização mesmo com erro de dados para exibir a mensagem
            setIsDataLoaded(true); 
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const contextValue = {
        isAuthenticated,
        token,
        portfolioData,
        isDataLoaded,
        fetchData,
        setToken,
        setIsAuthenticated,
        profilePhotoVisible,
        setProfilePhotoVisible,
        setPortfolioData,
        fetchError // Adicionado ao contexto
    };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

const useAppContext = () => React.useContext(AppContext);

// --- COMPONENTES PÚBLICOS ---

// Background de Partículas Simulado com CSS
const ParticleBackground = () => (
    <div className="fixed inset-0 -z-10 bg-gray-900 overflow-hidden">
        <style>{`
            @keyframes neonPulse {
                0%, 100% { filter: drop-shadow(0 0 5px #0ff) drop-shadow(0 0 2px #0ff); opacity: 0.5; }
                50% { filter: drop-shadow(0 0 15px #0ff) drop-shadow(0 0 5px #0ff); opacity: 1; }
            }
            .particle {
                position: absolute;
                background: radial-gradient(circle at center, #0ff, #800080, transparent 70%);
                border-radius: 50%;
                animation: floatUp linear infinite, neonPulse 4s infinite alternate;
            }
            @keyframes floatUp {
                0% { transform: translateY(100vh) scale(0); opacity: 0; }
                50% { opacity: 0.8; }
                100% { transform: translateY(-10vh) scale(1); opacity: 0; }
            }
        `}</style>
        {Array.from({ length: 50 }).map((_, i) => (
            <div 
                key={i}
                className="particle"
                style={{
                    width: `${Math.random() * 5 + 2}px`,
                    height: `${Math.random() * 5 + 2}px`,
                    left: `${Math.random() * 100}vw`,
                    animationDuration: `${Math.random() * 20 + 10}s`,
                    animationDelay: `-${Math.random() * 20}s`,
                    top: `${Math.random() * 100}vh`,
                }}
            />
        ))}
    </div>
);

// Seção 3: Foto de Perfil Imersiva
const ImmersiveProfilePhoto = ({ imagePath, visible }) => {
    if (!visible) return null;

    return (
        <div className={`
            absolute top-[-50px] md:top-[-80px] left-1/2 -translate-x-1/2 z-20 
            transition-all duration-500 ease-in-out 
            ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}
        `}>
            <div className={`
                w-24 h-24 md:w-40 md:h-40 rounded-full p-1.5 
                ${glassmorphism} 
                border-4 border-cyan-400/80 
                shadow-[0_0_20px_rgba(52,211,255,0.8),0_0_40px_rgba(168,85,247,0.5)] 
                bg-gray-900/50
            `}>
                <img 
                    src={imagePath || 'https://placehold.co/160x160/27272a/0ff?text=USER'} 
                    alt="Foto de Perfil Imersiva"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/160x160/27272a/0ff?text=USER'; }}
                />
            </div>
        </div>
    );
};

// Modal Futurista para Certificados/Currículo
const FuturisticModal = ({ title, contentUrl, isOpen, onClose }) => {
    const { setProfilePhotoVisible } = useAppContext();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setProfilePhotoVisible(false);
            setLoading(true);
            document.body.style.overflow = 'hidden';
        } else {
            setProfilePhotoVisible(true);
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, setProfilePhotoVisible]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-sm transition-opacity duration-300">
            <div className={`relative w-full h-full max-w-6xl max-h-[90vh] rounded-xl ${glassmorphism} p-2 md:p-6 flex flex-col`}>
                <div className="flex justify-between items-center pb-4 border-b border-cyan-500/30">
                    <h2 className={`text-xl md:text-2xl font-bold ${neonText}`}>{title}</h2>
                    <FuturisticButton onClick={onClose} className="w-10 h-10 p-0">
                        X
                    </FuturisticButton>
                </div>
                <div className="flex-grow pt-4 relative">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <p className={neonText}>Carregando {title}...</p>
                        </div>
                    )}
                    <iframe
                        src={contentUrl}
                        title={title}
                        className={`w-full h-full rounded-lg bg-gray-900 transition-opacity duration-500`}
                        onLoad={() => setLoading(false)}
                        style={{ opacity: loading ? 0 : 1 }}
                    />
                </div>
            </div>
        </div>
    );
};

// Card de Certificado
const CertificateCard = ({ cert }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const downloadLink = API_BASE_URL.replace('/api', '') + cert.pdfPath;

    return (
        <>
            <GlassCard className="transform hover:scale-[1.05] hover:rotate-1 transition-all duration-500 ease-in-out">
                <div className="flex flex-col h-full">
                    <img 
                        src={API_BASE_URL.replace('/api', '') + cert.thumbPath} 
                        alt={`Thumbnail do ${cert.name}`}
                        className="w-full h-32 object-cover rounded-lg mb-4 border border-cyan-500/50"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x128/27272a/0ff?text=THUMB'; }}
                    />
                    <h3 className={`text-lg font-bold ${neonText} mb-1`}>{cert.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{cert.platform} - {cert.date}</p>
                    <span className="text-xs px-2 py-1 bg-purple-900/50 rounded-full self-start text-purple-300">{cert.category}</span>
                    
                    <div className="mt-auto pt-4 flex space-x-2">
                        <FuturisticButton icon={FileText} onClick={() => setIsModalOpen(true)} className="flex-1">
                            Ver PDF
                        </FuturisticButton>
                        <a href={downloadLink} download className="flex-1">
                            <FuturisticButton icon={Download} className="w-full">
                                Baixar
                            </FuturisticButton>
                        </a>
                    </div>
                </div>
            </GlassCard>
            <FuturisticModal 
                title={cert.name} 
                contentUrl={downloadLink} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </>
    );
};

// Card de Publicação
const PublicationCard = ({ pub }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const downloadLink = API_BASE_URL.replace('/api', '') + pub.filePath;
    
    let Icon = BookOpen;
    let typeColor = 'text-green-400';
    if (pub.type === 'tcc') { Icon = GitBranch; typeColor = 'text-purple-400'; }
    else if (pub.type === 'artigo') { Icon = FileText; typeColor = 'text-cyan-400'; }

    return (
        <>
            <GlassCard className="flex flex-col transform hover:translate-y-[-5px] transition-transform duration-300">
                <div className="flex items-center space-x-3 mb-4">
                    <Icon size={32} className={typeColor} />
                    <h3 className={`text-xl font-bold ${neonText}`}>{pub.name}</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4 flex-grow">{pub.summary}</p>
                <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                    <span>Tipo: <span className={typeColor}>{pub.type.toUpperCase()}</span></span>
                    <span>Ano: {pub.year}</span>
                </div>

                <div className="mt-auto flex space-x-3">
                    {/* PDFs e DOCX podem ser abertos, mas o iframe funciona melhor com PDF */}
                    <FuturisticButton icon={FileText} onClick={() => setIsModalOpen(true)} className="flex-1">
                        Ler Online
                    </FuturisticButton>
                    <a href={downloadLink} download className="flex-1">
                        <FuturisticButton icon={Download} className="w-full">
                            Baixar
                        </FuturisticButton>
                    </a>
                </div>
            </GlassCard>
            <FuturisticModal 
                title={pub.name} 
                contentUrl={downloadLink} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </>
    );
};

// Seção 6: Currículo
const ResumeSection = ({ resumePath }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const downloadLink = API_BASE_URL.replace('/api', '') + resumePath;

    if (!resumePath) return <p className="text-center text-red-400">Currículo indisponível no momento.</p>;

    return (
        <GlassCard className="text-center p-8 mt-12">
            <h2 className={`text-3xl font-extrabold mb-4 ${neonText}`}>Meu Currículo</h2>
            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-8">
                <FuturisticButton icon={FileText} onClick={() => setIsModalOpen(true)} className="w-full md:w-auto">
                    Visualizar Currículo
                </FuturisticButton>
                <a href={downloadLink} download>
                    <FuturisticButton icon={Download} className="w-full md:w-auto">
                        Baixar PDF
                    </FuturisticButton>
                </a>
            </div>
            <FuturisticModal 
                title="Currículo Profissional" 
                contentUrl={downloadLink} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </GlassCard>
    );
};


// Layout do Portfólio Público
const PublicPortfolio = () => {
    const { portfolioData, isDataLoaded, fetchError } = useAppContext();
    const { profile, certificates, publications } = portfolioData;
    
    if (!isDataLoaded) return <div className="text-center p-20 text-xl text-white">Carregando Interface Futurista...</div>;

    // --- Tratamento de Erro de Conexão com o Backend ---
    if (fetchError) {
        return (
            <div className="min-h-screen pt-12 text-white p-4 md:p-8 relative">
                <ParticleBackground />
                <div className="max-w-xl mx-auto mt-40 z-10">
                    <GlassCard className="p-10 text-center border-red-500/50 shadow-red-500/30">
                        <h2 className="text-2xl text-red-400 font-bold mb-4">Falha Crítica na Conexão do Backend</h2>
                        <p className="text-lg text-gray-300 mb-6">O frontend não conseguiu se conectar ao servidor Node.js.</p>
                        <p className="text-sm text-red-300 break-words">{fetchError}</p>
                        <p className="mt-4 text-cyan-400 font-semibold">
                            ⚠️ **Ação Obrigatória:** Por favor, certifique-se de que o servidor Node.js está rodando localmente na porta 3001 (execute `npm start` no diretório do backend).
                        </p>
                    </GlassCard>
                </div>
            </div>
        );
    }
    // ---------------------------------------------------

    return (
        <div className="min-h-screen pt-12 text-white p-4 md:p-8 relative">
            <ParticleBackground />
            
            <header className="flex justify-end p-4 md:p-6 absolute top-0 right-0 z-40">
                <a href="#login">
                    <FuturisticButton icon={LogIn}>Acesso Admin</FuturisticButton>
                </a>
            </header>

            <main className="max-w-7xl mx-auto pt-16 pb-20">
                
                {/* Seção 1: Perfil e Bio */}
                <section id="profile" className={`relative pt-12 md:pt-20 pb-12 rounded-xl text-center z-10 
                    ${glassmorphism} bg-gray-900/30 mb-16`}>
                    
                    <ImmersiveProfilePhoto 
                        imagePath={API_BASE_URL.replace('/api', '') + profile.profileImagePath} 
                        visible={true}
                    />

                    <h1 className={`text-4xl md:text-6xl font-extrabold mt-12 md:mt-16 ${neonText}`}>
                        {profile.name || 'Nome do Usuário'}
                    </h1>
                    <p className="text-lg text-gray-300 max-w-3xl mx-auto my-4 px-4">
                        {profile.bio || 'Bio de apresentação futurista...'}
                    </p>

                    <div className="flex justify-center space-x-6 mt-6">
                        {profile.links?.github && <a href={profile.links.github} target="_blank"><FuturisticButton icon={GitBranch}>GitHub</FuturisticButton></a>}
                        {profile.links?.linkedin && <a href={profile.links.linkedin} target="_blank"><FuturisticButton icon={Linkedin}>LinkedIn</FuturisticButton></a>}
                        {profile.links?.twitter && <a href={profile.links.twitter} target="_blank"><FuturisticButton icon={Twitter}>Twitter</FuturisticButton></a>}
                    </div>
                </section>

                {/* Seção 4: Certificados */}
                <section id="certificates" className="my-16">
                    <h2 className={`text-3xl font-extrabold mb-8 text-center ${neonText}`}>Certificados</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {certificates.length > 0 ? (
                            certificates.map(cert => <CertificateCard key={cert.id} cert={cert} />)
                        ) : (
                            <p className="col-span-full text-center text-gray-400">Nenhum certificado disponível.</p>
                        )}
                    </div>
                </section>

                {/* Seção 5: Publicações */}
                <section id="publications" className="my-16">
                    <h2 className={`text-3xl font-extrabold mb-8 text-center ${neonText}`}>Publicações (Artigos/TCCs)</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {publications.length > 0 ? (
                            publications.map(pub => <PublicationCard key={pub.id} pub={pub} />)
                        ) : (
                            <p className="col-span-full text-center text-gray-400">Nenhuma publicação disponível.</p>
                        )}
                    </div>
                </section>

                {/* Seção 6: Currículo */}
                <section id="resume">
                    <ResumeSection resumePath={profile.resumePath} />
                </section>

            </main>
        </div>
    );
};

// --- COMPONENTES ADMIN ---

// Login Screen
const LoginScreen = () => {
    const { setIsAuthenticated, setToken } = useAppContext();
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('senha123');
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', message: 'Autenticando...' });

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('jwtToken', data.token);
                setToken(data.token);
                setIsAuthenticated(true);
                setStatus({ type: 'success', message: 'Login bem-sucedido! Redirecionando...' });
                window.location.hash = 'admin';
            } else {
                setStatus({ type: 'error', message: data.message || 'Falha na autenticação.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Erro de conexão com o servidor. Verifique se o backend está ativo.' });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900 text-white">
            <ParticleBackground />
            <GlassCard className="w-full max-w-md p-10 z-10">
                <h1 className={`text-3xl font-bold text-center mb-6 ${neonText}`}>
                    <LogIn size={28} className="inline mr-2" />
                    Acesso Administrativo
                </h1>
                <p className="text-gray-400 text-sm text-center mb-6">Use admin / senha123</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={`w-full p-3 rounded-lg bg-gray-800/50 border border-cyan-500/50 focus:ring-2 focus:ring-cyan-500 focus:outline-none ${neonText}`}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full p-3 rounded-lg bg-gray-800/50 border border-cyan-500/50 focus:ring-2 focus:ring-cyan-500 focus:outline-none ${neonText}`}
                            required
                        />
                    </div>
                    <FuturisticButton type="submit" className="w-full" icon={LogIn}>
                        ENTRAR NO PAINEL
                    </FuturisticButton>
                    <StatusMessage type={status.type} message={status.message} />
                </form>
                <div className="mt-8 text-center">
                    <a href="#/" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                        Voltar ao Portfólio Público
                    </a>
                </div>
            </GlassCard>
        </div>
    );
};

// Form: Editar Perfil e Links
const ProfileEditor = () => {
    const { token, portfolioData, fetchData } = useAppContext();
    const profile = portfolioData.profile || {};
    const [formData, setFormData] = useState(profile);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [profileFile, setProfileFile] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);

    useEffect(() => {
        setFormData(profile);
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('link_')) {
            const linkName = name.split('_')[1];
            setFormData(prev => ({ 
                ...prev, 
                links: { ...prev.links, [linkName]: value } 
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', message: 'Atualizando dados...' });

        try {
            const res = await fetch(`${API_BASE_URL}/admin/profile`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    name: formData.name, 
                    bio: formData.bio, 
                    links: formData.links 
                }),
            });

            if (!res.ok) throw new Error("Falha ao salvar perfil.");

            await fetchData(); // Recarrega dados globais
            setStatus({ type: 'success', message: 'Perfil atualizado com sucesso!' });
        } catch (error) {
            setStatus({ type: 'error', message: 'Erro ao salvar: ' + error.message });
        }
    };

    const handleFileUpload = async (type, file) => {
        if (!file) return;

        setStatus({ type: 'loading', message: `Enviando ${type === 'profileImage' ? 'imagem' : 'currículo'}...` });
        
        const form = new FormData();
        form.append(type, file);

        try {
            const res = await fetch(`${API_BASE_URL}/admin/upload/${type === 'profileImage' ? 'profile-image' : 'resume'}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: form,
            });

            if (!res.ok) throw new Error("Falha no upload.");
            
            await fetchData();
            setStatus({ type: 'success', message: `${type === 'profileImage' ? 'Foto' : 'Currículo'} atualizado com sucesso!` });
            if (type === 'profileImage') setProfileFile(null);
            if (type === 'resume') setResumeFile(null);
        } catch (error) {
            setStatus({ type: 'error', message: 'Erro no upload: ' + error.message });
        }
    };

    return (
        <GlassCard className="p-6">
            <h3 className={`text-2xl font-bold mb-4 ${neonText}`}>Informações Básicas</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
                <label className="block">Nome: <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full p-2 bg-gray-800/50 rounded" /></label>
                <label className="block">Bio: <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows="3" className="w-full p-2 bg-gray-800/50 rounded"></textarea></label>
                
                <h4 className="text-lg mt-6 mb-2 text-purple-400">Links Sociais</h4>
                <label className="block">GitHub: <input type="text" name="link_github" value={formData.links?.github || ''} onChange={handleChange} className="w-full p-2 bg-gray-800/50 rounded" /></label>
                <label className="block">LinkedIn: <input type="text" name="link_linkedin" value={formData.links?.linkedin || ''} onChange={handleChange} className="w-full p-2 bg-gray-800/50 rounded" /></label>
                <label className="block">Twitter: <input type="text" name="link_twitter" value={formData.links?.twitter || ''} onChange={handleChange} className="w-full p-2 bg-gray-800/50 rounded" /></label>

                <FuturisticButton type="submit" icon={Save} className="mt-4">Salvar Informações</FuturisticButton>
            </form>

            <h3 className={`text-2xl font-bold mt-8 mb-4 ${neonText}`}>Upload de Mídia</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
                <GlassCard>
                    <h4 className="text-xl mb-3 text-cyan-400">Foto de Perfil</h4>
                    <label className="block mb-2">Selecione nova foto:</label>
                    <input type="file" onChange={(e) => setProfileFile(e.target.files[0])} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                    <FuturisticButton icon={Send} onClick={() => handleFileUpload('profileImage', profileFile)} disabled={!profileFile} className="mt-3">
                        Atualizar Foto
                    </FuturisticButton>
                </GlassCard>

                <GlassCard>
                    <h4 className="text-xl mb-3 text-cyan-400">Currículo (PDF)</h4>
                    <label className="block mb-2">Selecione novo PDF:</label>
                    <input type="file" onChange={(e) => setResumeFile(e.target.files[0])} accept="application/pdf" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                    <FuturisticButton icon={Send} onClick={() => handleFileUpload('resume', resumeFile)} disabled={!resumeFile} className="mt-3">
                        Atualizar Currículo
                    </FuturisticButton>
                </GlassCard>
            </div>
            
            <StatusMessage type={status.type} message={status.message} />
        </GlassCard>
    );
};

// Form: Adicionar/Editar Certificado/Publicação
const ItemForm = ({ type, item, onComplete }) => {
    const { token } = useAppContext();
    const isEdit = !!item;
    const initialData = item || (type === 'certificates' ? 
        { name: '', platform: '', date: '', category: '' } : 
        { name: '', type: 'artigo', year: new Date().getFullYear(), summary: '' });

    const [formData, setFormData] = useState(initialData);
    const [pdfFile, setPdfFile] = useState(null);
    const [thumbFile, setThumbFile] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', message: isEdit ? 'Salvando alterações...' : 'Enviando item...' });

        try {
            let res;
            let dataToSend = formData;

            if (isEdit) {
                // Rota PUT para edição de metadados
                res = await fetch(`${API_BASE_URL}/admin/${type}/${item.id}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(dataToSend),
                });
            } else {
                // Rota POST para novo item com arquivos
                const form = new FormData();
                Object.keys(formData).forEach(key => form.append(key, formData[key]));
                
                if (type === 'certificates') {
                    if (!pdfFile || !thumbFile) throw new Error("PDF e Thumbnail são obrigatórios para novos certificados.");
                    form.append('certificatePdf', pdfFile);
                    form.append('certificateThumb', thumbFile);
                } else {
                    if (!pdfFile) throw new Error("Arquivo de publicação é obrigatório.");
                    form.append('publicationFile', pdfFile);
                }

                res = await fetch(`${API_BASE_URL}/admin/${type}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: form,
                });
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Falha ao ${isEdit ? 'atualizar' : 'adicionar'} item.`);
            }

            onComplete(true);
            setStatus({ type: 'success', message: `${type} ${isEdit ? 'atualizado' : 'adicionado'} com sucesso!` });
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        }
    };

    return (
        <GlassCard className="p-6">
            <h3 className={`text-xl font-bold mb-4 ${neonText}`}>{isEdit ? `Editar ${type}` : `Adicionar Novo ${type === 'certificates' ? 'Certificado' : 'Publicação'}`}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">Nome: <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 bg-gray-800/50 rounded" required /></label>
                
                {/* Campos Específicos para Certificados */}
                {type === 'certificates' && (
                    <>
                        <label className="block">Plataforma: <input type="text" name="platform" value={formData.platform} onChange={handleChange} className="w-full p-2 bg-gray-800/50 rounded" required /></label>
                        <label className="block">Data (YYYY-MM-DD): <input type="text" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 bg-gray-800/50 rounded" /></label>
                        <label className="block">Categoria: <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full p-2 bg-gray-800/50 rounded" required /></label>
                        
                        {!isEdit && (
                            <>
                                <label className="block">PDF do Certificado: <input type="file" onChange={(e) => setPdfFile(e.target.files[0])} accept="application/pdf" className="w-full p-2 bg-gray-800/50 rounded" required /></label>
                                <label className="block">Thumbnail (Imagem): <input type="file" onChange={(e) => setThumbFile(e.target.files[0])} accept="image/*" className="w-full p-2 bg-gray-800/50 rounded" required /></label>
                            </>
                        )}
                    </>
                )}

                {/* Campos Específicos para Publicações */}
                {type === 'publications' && (
                    <>
                        <label className="block">Tipo: 
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 bg-gray-800/50 rounded">
                                <option value="artigo">Artigo</option>
                                <option value="tcc">TCC</option>
                                <option value="livro">Livro</option>
                            </select>
                        </label>
                        <label className="block">Ano: <input type="number" name="year" value={formData.year} onChange={handleChange} className="w-full p-2 bg-gray-800/50 rounded" required /></label>
                        <label className="block">Resumo: <textarea name="summary" value={formData.summary} onChange={handleChange} rows="3" className="w-full p-2 bg-gray-800/50 rounded" required></textarea></label>
                        
                        {!isEdit && (
                            <label className="block">Arquivo (PDF/DOCX): <input type="file" onChange={(e) => setPdfFile(e.target.files[0])} accept=".pdf,.docx" className="w-full p-2 bg-gray-800/50 rounded" required /></label>
                        )}
                    </>
                )}

                <FuturisticButton type="submit" icon={isEdit ? Edit : Plus} className="mt-4">
                    {isEdit ? 'Salvar Edição' : 'Adicionar Item'}
                </FuturisticButton>
                <FuturisticButton type="button" onClick={() => onComplete(false)} className="mt-2 bg-gray-700/50 hover:bg-gray-600/50">
                    Cancelar
                </FuturisticButton>
                <StatusMessage type={status.type} message={status.message} />
            </form>
        </GlassCard>
    );
};

// Seção: Listagem e Gerenciamento
const DataManagerSection = ({ type }) => {
    const { token, portfolioData, fetchData } = useAppContext();
    const items = portfolioData[type] || [];
    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });

    const title = type === 'certificates' ? 'Certificados' : 'Publicações';

    const handleDelete = async (id) => {
        // Usamos window.confirm() pois é uma ação irreversível, mas esta função pode não ser visível no Canvas.
        // O servidor Node.js também tem um tratamento de erro robusto.
        if (!window.confirm(`Tem certeza que deseja deletar este ${title.slice(0, -1)}? (AÇÃO IRREVERSÍVEL)`)) return;

        setStatus({ type: 'loading', message: `Deletando ${title.slice(0, -1)}...` });
        try {
            const res = await fetch(`${API_BASE_URL}/admin/${type}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Falha ao deletar item.");
            
            await fetchData();
            setStatus({ type: 'success', message: `${title.slice(0, -1)} deletado com sucesso!` });
        } catch (error) {
            setStatus({ type: 'error', message: 'Erro ao deletar: ' + error.message });
        }
    };

    const handleFormComplete = (shouldRefresh) => {
        setIsAdding(false);
        setEditingItem(null);
        if (shouldRefresh) fetchData();
    };

    if (isAdding || editingItem) {
        return <ItemForm type={type} item={editingItem} onComplete={handleFormComplete} />;
    }

    return (
        <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className={`text-2xl font-bold ${neonText}`}>{title} ({items.length})</h3>
                <FuturisticButton icon={Plus} onClick={() => setIsAdding(true)}>
                    Adicionar Novo
                </FuturisticButton>
            </div>
            
            <StatusMessage type={status.type} message={status.message} />

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 border-b border-cyan-500/20 last:border-b-0 bg-gray-800/30 rounded-lg">
                        <span className="truncate flex-1 text-gray-200">{item.name}</span>
                        <div className="flex space-x-2 ml-4">
                            <FuturisticButton icon={Edit} onClick={() => setEditingItem(item)} className="p-2 w-10 h-10 bg-purple-700/50 hover:bg-purple-600/50"></FuturisticButton>
                            <FuturisticButton icon={Trash2} onClick={() => handleDelete(item.id)} className="p-2 w-10 h-10 bg-red-700/50 hover:bg-red-600/50"></FuturisticButton>
                        </div>
                    </div>
                ))}
            </div>
            {items.length === 0 && <p className="text-center text-gray-400 mt-4">Nenhum item cadastrado.</p>}
        </GlassCard>
    );
};


// Layout do Painel Administrativo
const AdminDashboard = () => {
    const { setIsAuthenticated, setToken, isDataLoaded } = useAppContext();
    const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'certificates', 'publications'

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        setToken(null);
        setIsAuthenticated(false);
        window.location.hash = '#/';
    };
    
    if (!isDataLoaded) return <div className="text-center p-20 text-xl text-white">Carregando Painel...</div>;

    const navItems = [
        { id: 'profile', name: 'Perfil & Currículo', icon: User },
        { id: 'certificates', name: 'Certificados', icon: FileText },
        { id: 'publications', name: 'Publicações', icon: BookOpen },
    ];

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gray-900 text-white relative">
            <ParticleBackground />
            <div className="max-w-7xl mx-auto z-10">
                <header className="flex justify-between items-center py-4 border-b border-cyan-500/50 mb-8">
                    <h1 className={`text-3xl font-extrabold ${neonText}`}>PAINEL DE ADMIN FUTURISTA</h1>
                    <div className="flex space-x-4">
                        <a href="#/" target="_blank">
                            <FuturisticButton className="bg-purple-800/50" icon={ExternalLink}>Ver Portfólio</FuturisticButton>
                        </a>
                        <FuturisticButton onClick={handleLogout} className="bg-red-800/50" icon={LogIn}>Logout</FuturisticButton>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-8">
                    {/* Navegação Lateral */}
                    <GlassCard className="lg:w-1/4 p-4 lg:p-6 h-fit">
                        <nav className="flex flex-col space-y-2">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center space-x-3 p-3 rounded-lg text-left transition-colors duration-200 
                                        ${activeTab === item.id 
                                            ? 'bg-cyan-700/50 text-white shadow-[0_0_10px_rgba(52,211,255,0.7)]' 
                                            : 'hover:bg-gray-800/50 text-gray-300'}`
                                    }
                                >
                                    <item.icon size={20} />
                                    <span className="font-semibold">{item.name}</span>
                                </button>
                            ))}
                        </nav>
                    </GlassCard>

                    {/* Conteúdo Principal */}
                    <div className="lg:w-3/4">
                        {activeTab === 'profile' && <ProfileEditor />}
                        {activeTab === 'certificates' && <DataManagerSection type="certificates" />}
                        {activeTab === 'publications' && <DataManagerSection type="publications" />}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- ROTEAMENTO E APLICAÇÃO PRINCIPAL ---

const Router = () => {
    const { isAuthenticated } = useAppContext();
    const [route, setRoute] = useState(window.location.hash || '#/');

    useEffect(() => {
        const handleHashChange = () => setRoute(window.location.hash || '#/');
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    let ComponentToRender;

    if (route === '#/login' || route === '#login') {
        if (isAuthenticated) {
            window.location.hash = '#admin';
            ComponentToRender = AdminDashboard;
        } else {
            ComponentToRender = LoginScreen;
        }
    } else if (route === '#/admin' || route === '#admin') {
        if (isAuthenticated) {
            ComponentToRender = AdminDashboard;
        } else {
            window.location.hash = '#login';
            ComponentToRender = LoginScreen;
        }
    } else {
        ComponentToRender = PublicPortfolio;
    }

    return <ComponentToRender />;
};

const App = () => (
    <AppProvider>
        <Router />
    </AppProvider>
);

export default App;