import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Github, Chrome } from 'lucide-react';

const BORDER = 'rgba(255,255,255,0.06)';
const SURFACE = 'rgba(23,31,51,0.9)';

function Orbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-25"
        style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(80px)' }} />
    </div>
  );
}

interface Props { mode?: 'signin' | 'signup' }

export function SignInPage({ mode = 'signin' }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const isSignup = mode === 'signup';

  return (
    <div className="min-h-screen flex" style={{ background: '#0b1326', color: '#c2c6d6' }}>
      <Orbs />

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative z-10 w-[45%]">
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 flex items-center justify-center font-black text-sm rounded-md font-mono text-white"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}
          >
            RS
          </div>
          <span className="font-bold text-sm tracking-tight text-white font-mono">RepoScout</span>
        </Link>

        <div className="space-y-6 max-w-xs">
          <h1 className="font-mono font-black text-white text-4xl leading-tight tracking-tight">
            Engineering-grade<br />intelligence<br />for OSS.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Ingest repos, run AI analysis, surface open-source alternatives to your SaaS stack. Built for engineering teams that care about what they ship.
          </p>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider text-emerald-400"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System status: optimal
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-700">
          © 2025 RepoScout
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div
          className="w-full max-w-sm rounded-2xl p-8"
          style={{ background: SURFACE, border: BORDER, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div
              className="w-6 h-6 flex items-center justify-center font-black text-xs rounded-md font-mono text-white"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
            >RS</div>
            <span className="font-mono font-bold text-sm text-white">RepoScout</span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-mono font-bold text-white mb-1">
              {isSignup ? 'Create account' : 'Access terminal'}
            </h2>
            <p className="text-xs text-slate-500">
              {isSignup ? 'Start your free account. No credit card required.' : 'Deploy credentials to enter the archive.'}
            </p>
          </div>

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {[
              { icon: Github, label: 'GitHub' },
              { icon: Chrome, label: 'Google' },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-mono font-bold text-slate-300 transition-all hover:text-white hover:bg-white/8"
                style={{ background: 'rgba(255,255,255,0.04)', border: BORDER }}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: BORDER }} />
            <span className="text-[10px] font-mono text-slate-700 uppercase tracking-widest">or via email</span>
            <div className="flex-1 h-px" style={{ background: BORDER }} />
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="operator@reposcout.io"
                className="w-full px-3 py-2.5 rounded-lg text-sm font-mono text-slate-200 placeholder-slate-700 outline-none transition-all"
                style={{
                  background: 'rgba(11,19,38,0.8)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.4)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-600">Password</label>
                {!isSignup && (
                  <a href="#" className="text-[10px] font-mono text-blue-500 hover:text-blue-400 transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm font-mono text-slate-200 placeholder-slate-700 outline-none transition-all"
                  style={{
                    background: 'rgba(11,19,38,0.8)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.4)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isSignup && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="persist" className="w-3.5 h-3.5 rounded accent-blue-500" />
                <label htmlFor="persist" className="text-[11px] font-mono text-slate-600 cursor-pointer">
                  Maintain session persistence
                </label>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/app')}
            className="w-full mt-5 py-3 rounded-lg text-sm font-mono font-bold uppercase tracking-wider text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}
          >
            {isSignup ? 'Create account' : 'Sign in'}
          </button>

          <p className="text-center text-xs font-mono text-slate-600 mt-4">
            {isSignup ? 'Already have an account? ' : 'No account? '}
            <Link
              to={isSignup ? '/sign-in' : '/sign-up'}
              className="text-blue-500 hover:text-blue-400 transition-colors"
            >
              {isSignup ? 'Sign in' : 'Request access'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
