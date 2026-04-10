import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Github } from 'lucide-react';

interface Props { mode?: 'signin' | 'signup' }

export function SignInPage({ mode = 'signin' }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const isSignup = mode === 'signup';

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: '#0b1326', color: '#dae2fd' }}>

      {/* ── LEFT PANEL: Atmospheric ── */}
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden">
        {/* Background orbs */}
        <div
          className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full"
          style={{ background: 'rgba(173,198,255,0.10)', filter: 'blur(120px)' }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full"
          style={{ background: 'rgba(54,38,206,0.20)', filter: 'blur(150px)' }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/">
            <span
              className="text-3xl font-black font-mono bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to right, #3b82f6, #6366f1)', filter: 'drop-shadow(0 0 8px rgba(77,142,255,0.5))' }}
            >
              RS
            </span>
          </Link>
        </div>

        {/* Hero statement */}
        <div className="relative z-10 max-w-lg">
          <h1
            className="font-mono font-black tracking-tighter leading-[0.95] text-white mb-6"
            style={{ fontSize: 'clamp(2.5rem, 4.5vw, 4rem)' }}
          >
            Engineering-grade intelligence for OSS.
          </h1>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed">
            Secure your open-source ecosystem with high-fidelity telemetry and automated vulnerability mapping.
          </p>
        </div>

        {/* Status footer */}
        <div className="relative z-10 flex items-center gap-4">
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{ background: 'rgba(78,222,163,0.1)', border: '1px solid rgba(78,222,163,0.2)' }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              System Status: Optimal
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'rgba(194,198,214,0.4)' }}>
            © 2025 REPOSCOUT
          </span>
        </div>
      </section>

      {/* ── RIGHT PANEL: Form ── */}
      <main
        className="w-full lg:w-1/2 flex items-center justify-center p-6 relative"
        style={{ background: '#060e20' }}
      >
        {/* Mobile top gradient */}
        <div
          className="lg:hidden absolute top-0 left-0 w-full h-1/2 -z-10"
          style={{ background: 'linear-gradient(to bottom, rgba(173,198,255,0.05), transparent)' }}
        />

        {/* Glass card */}
        <div
          className="w-full max-w-md rounded-xl p-10"
          style={{
            background: 'rgba(15,23,42,0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link to="/">
              <span
                className="text-2xl font-black font-mono bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(to right, #3b82f6, #6366f1)' }}
              >
                RS
              </span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <h2 className="text-3xl font-mono font-bold tracking-tight text-white mb-2">
              {isSignup ? 'Request Access' : 'Access Terminal'}
            </h2>
            <p className="text-slate-400 text-sm">
              {isSignup ? 'Initialize your node to enter the archive.' : 'Deploy credentials to enter the archive.'}
            </p>
          </div>

          {/* Social auth */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { icon: <GoogleIcon />, label: 'Google' },
              {
                icon: <Github className="w-5 h-5 opacity-80" />,
                label: 'GitHub',
              },
            ].map(({ icon, label }) => (
              <button
                key={label}
                className="flex items-center justify-center gap-3 px-4 py-2.5 rounded-full transition-all duration-200 hover:bg-white/8"
                style={{
                  border: '1px solid rgba(66,71,84,0.30)',
                  background: '#222a3d',
                }}
              >
                {icon}
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">{label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-8">
            <div className="w-full h-px" style={{ background: 'rgba(66,71,84,0.20)' }} />
            <span
              className="absolute px-4 text-[10px] font-mono uppercase tracking-[0.2em]"
              style={{ background: '#131b2e', color: '#8c909f' }}
            >
              or authenticate via protocol
            </span>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={e => { e.preventDefault(); navigate('/onboarding'); }}>
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest mb-2" style={{ color: '#8c909f' }}>
                {isSignup ? 'Email' : 'Identifier'}
              </label>
              <input
                type="email"
                placeholder="operator@reposcout.io"
                className="w-full rounded-lg px-4 py-3 text-white text-sm placeholder-slate-600 outline-none transition-all"
                style={{
                  background: '#020810',
                  border: '1px solid rgba(66,71,84,0.20)',
                }}
                onFocus={e => { e.target.style.boxShadow = '0 0 0 2px rgba(77,142,255,0.4)'; e.target.style.borderColor = 'transparent'; }}
                onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'rgba(66,71,84,0.20)'; }}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: '#8c909f' }}>
                  {isSignup ? 'Password' : 'Cipher Key'}
                </label>
                {!isSignup && (
                  <a href="#" className="text-[10px] font-mono font-bold uppercase tracking-widest transition-colors hover:text-blue-300" style={{ color: '#4d8eff' }}>
                    Key Recovery
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg px-4 py-3 pr-12 text-white text-sm placeholder-slate-600 outline-none transition-all"
                  style={{
                    background: '#020810',
                    border: '1px solid rgba(66,71,84,0.20)',
                  }}
                  onFocus={e => { e.target.style.boxShadow = '0 0 0 2px rgba(77,142,255,0.4)'; e.target.style.borderColor = 'transparent'; }}
                  onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'rgba(66,71,84,0.20)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#424754' }}
                  onMouseEnter={e => { (e.target as HTMLElement).closest('button')!.style.color = '#dae2fd'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).closest('button')!.style.color = '#424754'; }}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            {!isSignup && (
              <div className="flex items-center gap-3 py-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 rounded accent-blue-500"
                  style={{ background: '#020810', borderColor: 'rgba(66,71,84,0.3)' }}
                />
                <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer">
                  Maintain session persistence
                </label>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-lg font-mono font-black uppercase tracking-[0.1em] text-sm transition-all duration-300 active:scale-[0.98]"
              style={{
                background: '#4d8eff',
                color: '#00285d',
                boxShadow: '0 0 20px rgba(77,142,255,0.2)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#6ba3ff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#4d8eff'; }}
            >
              {isSignup ? 'Initialize Node' : 'Establish Connection'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-xs text-slate-400">
              {isSignup ? 'Already have access? ' : 'New operator? '}
              <Link
                to={isSignup ? '/sign-in' : '/sign-up'}
                className="font-bold hover:underline underline-offset-4 transition-colors"
                style={{ color: '#4d8eff' }}
              >
                {isSignup ? 'Sign in' : 'Request Access'}
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative corner icons */}
        <div className="absolute bottom-8 right-8 flex gap-4 select-none opacity-10">
          <svg className="w-9 h-9 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          <svg className="w-9 h-9 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
          <svg className="w-9 h-9 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
      </main>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 opacity-80" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
