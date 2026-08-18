import { login } from './actions'
import { SubmitButton } from './submit-button'
import { Leaf, Lock, Mail } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen px-4 py-12">

      {/* Ambient glow blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div style={{ position:'absolute', top:'10%', left:'15%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)', filter:'blur(40px)' }} />
        <div style={{ position:'absolute', bottom:'15%', right:'10%', width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', filter:'blur(40px)' }} />
      </div>

      <div className="w-full max-w-md anim-fadeInUp">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 anim-float"
               style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(52,211,153,0.1) 100%)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <Leaf className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-gradient">Naaz Field Collector</h1>
          <p className="text-slate-400 mt-2 text-sm">Secure access for field operations</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8">
          <h2 className="text-lg font-semibold text-slate-200 mb-6">Sign in to continue</h2>

          <form className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="email"
                  className="input-glass pl-10"
                  name="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="password"
                  className="input-glass pl-10"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error */}
            {message && (
              <div className="p-3.5 rounded-xl text-sm text-red-300 flex items-start gap-2"
                   style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)' }}>
                <span>⚠</span>
                <span>{message}</span>
              </div>
            )}

            {/* Submit */}
            <SubmitButton
              id="login-submit"
              formAction={login}
              className="btn-primary w-full py-3.5 rounded-2xl mt-2 text-base"
              pendingText="Signing in…"
            >
              Sign In
            </SubmitButton>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Protected by end-to-end encryption
        </p>
      </div>
    </div>
  )
}
