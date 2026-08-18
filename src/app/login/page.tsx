import { login } from './actions'
import { SubmitButton } from './submit-button'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams;

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto pt-24">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-emerald-800">Naaz Field Collector</h1>
        <p className="text-gray-600 mt-2">Secure access for field operations</p>
      </div>

      <form className="flex-1 flex flex-col w-full justify-center gap-4 text-foreground">
        <label className="text-md font-medium" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-3 bg-inherit border border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        <label className="text-md font-medium mt-4" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-3 bg-inherit border border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        <SubmitButton
          formAction={login}
          className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-md px-4 py-3 text-foreground font-semibold mb-2 mt-6 transition-colors"
          pendingText="Signing In..."
        >
          Sign In
        </SubmitButton>
        {message && (
          <p className="mt-4 p-4 bg-red-100 text-red-700 text-center rounded-md text-sm">
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
