'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/badge';
import { Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  'AI-powered resume scoring',
  'Visual hiring pipeline',
  'Real-time analytics',
  'Interview coordination',
];

export function LoginPage() {
  const { login, register, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: 'demo@recruitflow.ai',
    password: 'demo1234',
    firstName: '',
    lastName: '',
    organizationName: '',
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center app-bg">
        <Skeleton className="h-10 w-64 rounded-xl" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(form);
      } else {
        await login(form.email, form.password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="min-h-screen flex">
      {/* Left — dark hero */}
      <div className="hidden lg:flex lg:w-[52%] bg-[#0F1419] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(232,101,58,0.25) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(61,170,141,0.15) 0%, transparent 50%)',
          }}
        />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #FFFCF7 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#E8653A] flex items-center justify-center shadow-[0_0_24px_rgba(232,101,58,0.5)]">
            <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-bold text-[#FFFCF7]">RecruitFlow AI</span>
        </div>

        <div className="relative">
          <p className="text-[#E8653A] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            Applicant Tracking System
          </p>
          <h1 className="font-display text-5xl font-bold text-[#FFFCF7] leading-[1.1] mb-5">
            Hire the right people,{' '}
            <span className="text-[#E8653A]">faster.</span>
          </h1>
          <p className="text-[#78716C] text-lg leading-relaxed max-w-md">
            AI-driven recruiting for teams who care about quality hires — not just filling seats.
          </p>

          <ul className="mt-10 space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-[#A8A29E] text-sm">
                <CheckCircle2 className="h-4 w-4 text-[#3DAA8D] flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-[#4A5568]">
          Trusted by HR teams at fast-growing companies
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8 app-bg">
        <div className="w-full max-w-[400px] animate-fade-up">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="h-9 w-9 rounded-xl bg-[#E8653A] flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-bold text-[#1A1814]">RecruitFlow AI</span>
          </div>

          <div className="bg-[#FFFCF7] rounded-2xl border border-[#E8E2D9] p-8 shadow-[0_8px_32px_rgba(15,20,25,0.08)]">
            <h2 className="font-display text-2xl font-bold text-[#1A1814] mb-1">
              {isRegister ? 'Get started' : 'Welcome back'}
            </h2>
            <p className="text-sm text-[#9C958A] mb-6">
              {isRegister ? 'Create your workspace in seconds' : 'Sign in to your workspace'}
            </p>

            {!isRegister && (
              <div className="mb-5 p-3.5 bg-[#FDF0EB] rounded-xl border border-[#F5D5C8]">
                <p className="text-[11px] font-semibold text-[#C4522A] uppercase tracking-wider mb-1">Demo Account</p>
                <p className="text-xs text-[#9C5740] font-mono">demo@recruitflow.ai · demo1234</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>First Name</Label>
                      <Input value={form.firstName} onChange={set('firstName')} required />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input value={form.lastName} onChange={set('lastName')} required />
                    </div>
                  </div>
                  <div>
                    <Label>Organization</Label>
                    <Input value={form.organizationName} onChange={set('organizationName')} required />
                  </div>
                </>
              )}
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={set('email')} required />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={set('password')} required />
              </div>

              {error && (
                <p className="text-xs text-[#C45C5C] bg-[#FBEEEE] border border-[#F0D0D0] rounded-xl px-3.5 py-2.5">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full group" size="lg" disabled={loading}>
                {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
                {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
              </Button>
            </form>

            <p className="text-center text-sm text-[#9C958A] mt-5">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-[#E8653A] font-semibold hover:underline"
              >
                {isRegister ? 'Sign in' : 'Register'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
