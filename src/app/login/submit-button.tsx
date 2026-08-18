'use client'

import { useFormStatus } from 'react-dom'
import { type ComponentProps } from 'react'
import { Loader2 } from 'lucide-react'

type Props = ComponentProps<'button'> & {
  pendingText?: string
}

export function SubmitButton({ children, pendingText = 'Submitting...', className = '', ...props }: Props) {
  const { pending } = useFormStatus()

  return (
    <button
      {...props}
      type="submit"
      disabled={pending || props.disabled}
      aria-disabled={pending}
      className={className}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 anim-spin" />
          <span>{pendingText}</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}
