import React, { useState, useEffect, useRef } from 'react';
import { UserRole } from '../types';
import { AuthService, AuthSession, DEMO_ACCOUNTS } from '../services/authService';
import krceCollegeLogo from '../assets/images/krce_college_logo.webp';
import hairlineEngineUrl from '../hairline/hairline-engine.js?url';
import { 
  Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2, 
  AlertCircle, Check, Info, Sparkles, Database, Layers
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (session: AuthSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [username, setUsername] = useState<string>('8115U25AD064');
  const [password, setPassword] = useState<string>('student123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 3D Terrain Telemetry state
  const [terrainReadout, setTerrainReadout] = useState<string>('active');
  const stageRef = useRef<HTMLDivElement>(null);
  const terrainHandleRef = useRef<any>(null);

  // Sync default credentials when role switcher changes
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    const demo = DEMO_ACCOUNTS.find(d => d.role === role);
    if (demo) {
      setUsername(demo.username);
      setPassword(demo.passwordHint);
    }
  };

  const handleDemoFill = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    const demo = DEMO_ACCOUNTS.find(d => d.role === role);
    if (demo) {
      setUsername(demo.username);
      setPassword(demo.passwordHint);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await new Promise(r => setTimeout(r, 400));
      const res = await AuthService.authenticate(username, password, selectedRole);

      if (res.success && res.session) {
        setIsTransitioning(true);
        const transitionDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 460;
        await new Promise(resolve => window.setTimeout(resolve, transitionDuration));
        onLoginSuccess(res.session);
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mount unboxed 3D isometric data terrain centerpiece
  useEffect(() => {
    let unmounted = false;

    const mountTerrain = () => {
      if (!stageRef.current || unmounted) return;
      if (terrainHandleRef.current) {
        try { terrainHandleRef.current.destroy(); } catch (e) {}
        terrainHandleRef.current = null;
      }

      if ((window as any).Hairline && stageRef.current) {
        try {
          const handle = (window as any).Hairline.mount(stageRef.current, 'terrain', {
            intensity: 0.65,
            play: true,
            plate: 'rgba(9, 14, 26, 0.85)',
            hi: '#22d3ee',
            edge: '#06b6d4',
            mid: '#0284c7',
            lo: 'rgba(30, 41, 59, 0.65)',
            stroke: '1.15',
            onRead: (text: string) => {
              if (!unmounted) setTerrainReadout(text);
            }
          });
          terrainHandleRef.current = handle;
        } catch (e) {
          console.warn('Hairline terrain mount notice:', e);
        }
      }
    };

    if (!(window as any).Hairline) {
      const script = document.createElement('script');
      script.src = hairlineEngineUrl;
      script.async = true;
      script.onload = () => {
        if (!unmounted) mountTerrain();
      };
      document.head.appendChild(script);
    } else {
      mountTerrain();
    }

    return () => {
      unmounted = true;
      if (terrainHandleRef.current) {
        try { terrainHandleRef.current.destroy(); } catch (e) {}
        terrainHandleRef.current = null;
      }
    };
  }, []);

  // Helper validation status for Student ID
  const isStudentIdFormat = selectedRole === 'STUDENT' && /^8115U25AD\d{3}$/i.test(username.trim());

  return (
    <div className={`login-page-wrapper min-h-screen w-full blueprint-dark-grid relative flex flex-col justify-between items-center p-3 sm:p-5 lg:p-7 antialiased font-sans select-none overflow-x-hidden text-slate-100 bg-[#070D18]${isTransitioning ? ' login-transition-out' : ' login-page-enter'}`}>
      
      {/* Immersive Glowing Radial Light Halos */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/12 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[550px] h-[550px] bg-blue-600/12 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-indigo-500/8 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Header Technical Strip */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between text-xs font-mono text-slate-400 py-2 relative z-20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-semibold tracking-wider text-cyan-400 uppercase text-[11px]">
            K. Ramakrishnan College of Engineering · KRCE IAM Portal
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px]">
          <span className="text-slate-400">Security Architecture:</span>
          <span className="text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
            TLS 1.3 / SHA-256
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
            KRCE RBAC ENFORCED
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SYSTEM ONLINE
          </span>
        </div>
      </header>

      {/* Main Dual Balanced Showcase: Direct-to-Background 3D Data Terrain (Left) + KRCE Form Card (Right) */}
      <main className="my-auto w-full max-w-7xl mx-auto relative z-10 py-4 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-12">
        
        {/* LEFT COLUMN: Prominent, Unboxed 3D Isometric Glowing Data Terrain Centerpiece */}
        <div 
          className="w-full lg:w-[54%] max-w-[620px] flex flex-col items-center justify-center relative select-none"
          style={{ position: 'relative' }}
        >
          {/* Ambient Radial Glow Focused on the Terrain Center */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none"
            style={{ position: 'absolute', pointerEvents: 'none' }}
          />

          {/* Floating Technical Telemetry Header directly on grid */}
          <div className="w-full max-w-[560px] flex items-center justify-between mb-2 px-1 relative z-10">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase block">
                  KRCE 3D RELATIONAL DATA TERRAIN
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Autonomous Ledger Topology · 81 Dynamic Relational Nodes
                </span>
              </div>
            </div>
            
            <div className="terrain-hud-badge">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>{terrainReadout.startsWith('cell') ? terrainReadout.toUpperCase() : 'COORDINATE FLUX: ACTIVE'}</span>
            </div>
          </div>

          {/* Direct-to-Background 3D Terrain Stage (Zero Card / Zero Box Boundary) */}
          <div 
            ref={stageRef}
            className="terrain-centerpiece-stage"
            style={{
              width: '100%',
              maxWidth: '580px',
              aspectRatio: '5 / 4',
              position: 'relative',
              cursor: 'crosshair',
              filter: 'drop-shadow(0 0 45px rgba(6, 182, 212, 0.22))'
            }}
          />

          {/* Floating Technical Telemetry Footer directly on grid */}
          <div className="w-full max-w-[560px] mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400 px-1 relative z-10">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] tracking-wide text-slate-300">
                81 PERSISTENT NODES · H2 PERSISTENCE
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-emerald-400 font-medium">● ACID LEDGER LIVE</span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                ISOMETRIC ENGINE
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sleek, Complementing KRCE Student Management System Login Card */}
        <div 
          className="w-full lg:w-[46%] max-w-[440px] flex items-center justify-center relative z-20"
          style={{ width: '100%', maxWidth: '440px' }}
        >
          <section 
            className="login-glass-card"
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'rgba(11, 19, 43, 0.90)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              borderRadius: '1rem',
              padding: '1.75rem',
              boxShadow: '0 0 35px -5px rgba(6, 182, 212, 0.18), 0 25px 50px -12px rgba(0, 0, 0, 0.75)',
              boxSizing: 'border-box'
            }}
          >
            {/* College Monolith & Gate Photo Banner + Institutional Typography */}
            <div className="flex items-center gap-3.5 mb-4 pb-3.5 border-b border-slate-800">
              <div className="relative shrink-0" style={{ width: '3.75rem', height: '3.75rem', position: 'relative', flexShrink: 0 }}>
                <img 
                  src={krceCollegeLogo} 
                  alt="K. Ramakrishnan College of Engineering (KRCE)" 
                  className="w-15 h-15 rounded-xl object-cover border-2 border-cyan-500/50 shadow-lg"
                  style={{ width: '3.75rem', height: '3.75rem', borderRadius: '0.75rem', objectFit: 'cover' }}
                  referrerPolicy="no-referrer"
                />
                <span 
                  className="absolute rounded-full bg-emerald-400 border-2 border-[#0B132B]"
                  style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '0.875rem', height: '0.875rem', backgroundColor: '#10B981', border: '2px solid #0B132B', borderRadius: '9999px' }}
                  title="KRCE Autonomous ERP Online"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-base font-bold tracking-tight text-white font-heading leading-snug">
                    Student Management System
                  </h1>
                </div>
                <h2 className="text-xs text-cyan-300 font-semibold mt-0.5">
                  K. Ramakrishnan College of Engineering
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 rounded">
                    KRCE v2.4
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Autonomous · Anna Univ
                  </span>
                </div>
              </div>
            </div>

            {/* Role Switcher Pill (3 Equal Horizontal Columns) */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <span>Authentication Role</span>
                <span className="text-cyan-400 font-mono text-[10px]">Tier 2 Guard</span>
              </div>
              
              <div 
                className="grid grid-cols-3 gap-1 p-1 bg-slate-900/90 border border-slate-700/70 rounded-lg"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.25rem', backgroundColor: 'rgba(15, 23, 42, 0.9)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid rgba(51, 65, 85, 0.8)' }}
              >
                {(['STUDENT', 'FACULTY', 'ADMIN'] as UserRole[]).map((role) => {
                  const isActive = selectedRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleChange(role)}
                      className={isActive ? 'login-role-tab login-role-tab-active' : 'login-role-tab login-role-tab-inactive'}
                      style={isActive ? {
                        backgroundColor: '#06b6d4',
                        color: '#020617',
                        fontWeight: 700,
                        padding: '0.5rem 0.5rem',
                        borderRadius: '0.375rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                        border: 'none',
                        boxShadow: '0 0 12px rgba(6, 182, 212, 0.45)'
                      } : {
                        backgroundColor: 'transparent',
                        color: '#94a3b8',
                        padding: '0.5rem 0.5rem',
                        borderRadius: '0.375rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                        border: 'none'
                      }}
                    >
                      <span>{role.charAt(0) + role.slice(1).toLowerCase()}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" style={{ width: '0.875rem', height: '0.875rem', strokeWidth: 3 }} />}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Role Validation Cue Hint */}
              <div className="mt-2 px-3 py-1.5 bg-slate-900/70 border border-cyan-500/20 rounded-md text-[11px] text-slate-300 flex items-start gap-2 leading-relaxed" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: '0.375rem', padding: '0.375rem 0.625rem' }}>
                <Info className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" style={{ width: '0.875rem', height: '0.875rem', color: '#22d3ee', flexShrink: 0, marginTop: '2px' }} />
                <div className="text-[11px]">
                  {selectedRole === 'STUDENT' && (
                    <>Format: <code className="text-cyan-300 font-mono">8115U25AD064–094</code>. Access enrollments, grades, attendance, and bursar ledger.</>
                  )}
                  {selectedRole === 'FACULTY' && (
                    <>Use the faculty account ID (e.g. <code className="text-cyan-300 font-mono">faculty</code>). Access grades, syllabus, and student rosters.</>
                  )}
                  {selectedRole === 'ADMIN' && (
                    <>Administrative access. Full control over bursar accounts, records, and SQL console.</>
                  )}
                </div>
              </div>
            </div>

            {/* Error Alert Box */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-950/70 border border-rose-500/60 text-rose-200 rounded-md text-xs flex items-start gap-2.5" style={{ backgroundColor: 'rgba(76, 5, 25, 0.7)', border: '1px solid rgba(244, 63, 94, 0.6)', borderRadius: '0.375rem', padding: '0.75rem' }}>
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" style={{ width: '1rem', height: '1rem', color: '#fb7185', flexShrink: 0, marginTop: '2px' }} />
                <div className="flex-1 text-[11px]">
                  <span className="font-semibold block text-rose-300">Authentication Error</span>
                  <span>{errorMessage}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setErrorMessage(null)} 
                  className="text-rose-400 hover:text-rose-200 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Main Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Username / Student ID Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-username" className="block text-xs font-semibold text-slate-200">
                    {selectedRole === 'STUDENT' ? 'Student ID' : selectedRole === 'FACULTY' ? 'Faculty Username' : 'Administrator Username'}
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400/90">
                    {selectedRole === 'STUDENT' ? 'Format: 8115U25AD064–094' : selectedRole === 'FACULTY' ? 'e.g. faculty' : 'e.g. admin'}
                  </span>
                </div>
                
                <div className="relative" style={{ position: 'relative', width: '100%', height: '2.75rem', display: 'flex', alignItems: 'center' }}>
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    required
                    placeholder={selectedRole === 'STUDENT' ? '8115U25AD064' : selectedRole === 'FACULTY' ? 'faculty' : 'admin'}
                    className="login-input-field"
                    style={{ width: '100%', height: '2.75rem', backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(51, 65, 85, 0.8)', color: '#f8fafc', borderRadius: '0.5rem', paddingLeft: '0.875rem', paddingRight: '2.5rem', fontSize: '0.875rem', outline: 'none' }}
                  />

                  <div 
                    className="pointer-events-none flex items-center justify-center"
                    style={{ position: 'absolute', right: '0.75rem', top: '0', bottom: '0', marginTop: 'auto', marginBottom: 'auto', height: '1rem', width: '1rem' }}
                  >
                    {selectedRole === 'STUDENT' && isStudentIdFormat ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <User className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-xs font-semibold text-slate-200">
                    Account Password
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400/90">
                    Default: {selectedRole === 'STUDENT' ? 'student123' : selectedRole === 'FACULTY' ? 'faculty123' : 'admin123'}
                  </span>
                </div>

                <div className="relative" style={{ position: 'relative', width: '100%', height: '2.75rem', display: 'flex', alignItems: 'center' }}>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    required
                    placeholder="••••••••••••"
                    className="login-input-field"
                    style={{ width: '100%', height: '2.75rem', backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(51, 65, 85, 0.8)', color: '#f8fafc', borderRadius: '0.5rem', paddingLeft: '0.875rem', paddingRight: '4.5rem', fontSize: '0.875rem', fontFamily: 'monospace', outline: 'none' }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-2 py-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/80 rounded transition-colors cursor-pointer flex items-center gap-1"
                    style={{ position: 'absolute', right: '0.625rem', top: '0', bottom: '0', marginTop: 'auto', marginBottom: 'auto', height: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#22d3ee' }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" style={{ width: '0.875rem', height: '0.875rem' }} />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" style={{ width: '0.875rem', height: '0.875rem' }} />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Session & Forgot Credentials */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: '0.875rem', height: '0.875rem', accentColor: '#06b6d4', cursor: 'pointer' }}
                  />
                  <span className="text-[11px]" style={{ fontSize: '11px', color: '#cbd5e1' }}>Remember session</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert(`Demo Credentials:\n• Student: 8115U25AD064 / student123\n• Faculty: faculty / faculty123\n• Admin: admin / admin123`)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline font-medium cursor-pointer"
                  style={{ fontSize: '11px', color: '#22d3ee', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Forgot credentials?
                </button>
              </div>

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="login-submit-button"
                style={{
                  width: '100%',
                  height: '2.75rem',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
                  color: '#020617',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  letterSpacing: '0.025em',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
                  marginTop: '0.5rem'
                }}
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" style={{ width: '1rem', height: '1rem', border: '2px solid rgba(2, 6, 23, 0.3)', borderTopColor: '#020617', borderRadius: '9999px' }} />
                    <span>Verifying KRCE SHA-256 Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate &amp; Launch Portal</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" style={{ width: '1rem', height: '1rem', strokeWidth: 2.5 }} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo One-Click Access Badges */}
            <div className="mt-4 pt-3.5 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Instant Demo Access (Click to prefill &amp; switch):
              </span>
              <div 
                className="grid grid-cols-3 gap-2"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.5rem' }}
              >
                <button
                  type="button"
                  onClick={() => handleDemoFill('STUDENT')}
                  className={`login-demo-chip ${selectedRole === 'STUDENT' ? 'border-cyan-500/70 bg-cyan-950/60' : ''}`}
                  style={{
                    minHeight: '50px',
                    padding: '0.5rem 0.5rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    backgroundColor: selectedRole === 'STUDENT' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.7)',
                    border: selectedRole === 'STUDENT' ? '1px solid rgba(6, 182, 212, 0.7)' : '1px solid rgba(51, 65, 85, 0.6)'
                  }}
                >
                  <span className="font-semibold text-slate-100 block text-[11px] truncate">Kavin Rajendran</span>
                  <span className="font-mono text-[10px] text-cyan-400/90 block">Student (AD064)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoFill('FACULTY')}
                  className={`login-demo-chip ${selectedRole === 'FACULTY' ? 'border-cyan-500/70 bg-cyan-950/60' : ''}`}
                  style={{
                    minHeight: '50px',
                    padding: '0.5rem 0.5rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    backgroundColor: selectedRole === 'FACULTY' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.7)',
                    border: selectedRole === 'FACULTY' ? '1px solid rgba(6, 182, 212, 0.7)' : '1px solid rgba(51, 65, 85, 0.6)'
                  }}
                >
                  <span className="font-semibold text-slate-100 block text-[11px] truncate">Dr. Arulmozhi Selvan</span>
                  <span className="font-mono text-[10px] text-cyan-400/90 block">Faculty (CS Dept)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoFill('ADMIN')}
                  className={`login-demo-chip ${selectedRole === 'ADMIN' ? 'border-cyan-500/70 bg-cyan-950/60' : ''}`}
                  style={{
                    minHeight: '50px',
                    padding: '0.5rem 0.5rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    backgroundColor: selectedRole === 'ADMIN' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.7)',
                    border: selectedRole === 'ADMIN' ? '1px solid rgba(6, 182, 212, 0.7)' : '1px solid rgba(51, 65, 85, 0.6)'
                  }}
                >
                  <span className="font-semibold text-slate-100 block text-[11px] truncate">Registrar / Dean</span>
                  <span className="font-mono text-[10px] text-cyan-400/90 block">Admin (Full RBAC)</span>
                </button>
              </div>
            </div>

            {/* Card Footer Security Assurance */}
            <div className="pt-3.5 mt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>256-bit Web Crypto SHA-256</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-medium">H2 Engine Active</span>
              </div>
            </div>

          </section>
        </div>

      </main>

      {/* Technical Architecture Footer Strip */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-500 py-3 relative z-20 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>KRCE RELATIONAL DATASTORE: ACID PERSISTENT</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>UPTIME: 99.98%</span>
          <span className="text-slate-600">·</span>
          <span>3-TIER ENTERPRISE ARCHITECTURE</span>
          <span className="text-slate-600">·</span>
          <span>SPRING / H2 ENGINE</span>
        </div>
      </footer>

    </div>
  );
};
