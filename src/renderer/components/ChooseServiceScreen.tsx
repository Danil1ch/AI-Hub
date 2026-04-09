import type { CSSProperties } from 'react'
import { SERVICES, type ServiceId } from '../../shared/services'
import { useHubStore } from '../store'
import { ServiceAccentDot, ServiceBrandIcon } from './ServiceBrandIcon'

interface ChooseServiceScreenProps {
  onSelect: (id: ServiceId) => void
}

export function ChooseServiceScreen({ onSelect }: ChooseServiceScreenProps) {
  const lastSessionId = useHubStore((s) => s.lastSessionId)

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {/* Base + radial depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 78% 58% at 50% 22%, rgba(129, 140, 248, 0.22) 0%, transparent 50%), radial-gradient(ellipse 88% 72% at 50% 32%, rgba(99, 102, 241, 0.14) 0%, transparent 58%), radial-gradient(ellipse 65% 48% at 50% 94%, rgba(37, 99, 235, 0.11) 0%, transparent 48%), #09090b'
        }}
      />
      {/* Soft bloom orbs */}
      <div
        className="pointer-events-none absolute -left-[18%] top-[8%] h-[min(58vw,480px)] w-[min(58vw,480px)] rounded-full bg-violet-400/24 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-[12%] top-[32%] h-[min(48vw,400px)] w-[min(48vw,400px)] rounded-full bg-blue-500/20 blur-[95px]"
        aria-hidden
      />
      {/* Noise */}
      <div className="choose-screen-noise pointer-events-none absolute inset-0 opacity-[0.22]" aria-hidden />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 pb-14 pt-[clamp(2.75rem,7vh,5.5rem)] max-[599px]:px-5 max-[599px]:pb-12 max-[599px]:pt-10">
          <div className="mx-auto flex w-full max-w-[880px] flex-col">
          <header className="mb-10 text-center max-[599px]:mb-8">
            <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.035em] text-stone-100 min-[640px]:text-[30px] min-[900px]:text-[32px]">
              Where do you want to start?
            </h1>
            <p className="mx-auto mt-2.5 max-w-xl text-[14px] font-medium leading-snug tracking-[-0.015em] text-stone-400 min-[900px]:text-[15px]">
              All your AI tools in one place
            </p>
          </header>

          <div className="grid max-[599px]:grid-cols-1 max-[599px]:gap-3 min-[600px]:grid-cols-2 min-[600px]:gap-3.5 min-[900px]:grid-cols-3 min-[900px]:gap-4 min-[1280px]:grid-cols-4">
            {SERVICES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                className="choose-service-card group flex min-h-[52px] items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-[17px] py-[17px] text-left transition-[transform,box-shadow,border-color] duration-200 ease-out hover:z-10 hover:scale-[1.02] hover:border-white/[0.12] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
                style={
                  {
                    '--accent-glow': s.accent,
                    animation: 'choose-card-enter 0.58s cubic-bezier(0.22, 1, 0.36, 1) backwards',
                    animationDelay: `${i * 52}ms`
                  } as CSSProperties
                }
              >
                <ServiceBrandIcon
                  id={s.id}
                  accent={s.accent}
                  width={s.id === 'character' ? 22 : 18}
                  height={s.id === 'character' ? 22 : 18}
                />
                <ServiceAccentDot accent={s.accent} />
                <span className="min-w-0 flex-1 truncate text-[14px] font-semibold tracking-[-0.02em] text-stone-100 min-[900px]:text-[15px]">
                  {s.label}
                </span>
              </button>
            ))}
          </div>

          <footer className="mt-12 flex flex-col items-center gap-3.5 max-[599px]:mt-10">
            {lastSessionId != null ? (
              <button
                type="button"
                onClick={() => onSelect(lastSessionId)}
                className="rounded-lg px-4 py-2.5 text-[14px] font-medium tracking-[-0.01em] text-stone-400 transition-colors duration-200 hover:bg-white/[0.06] hover:text-stone-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
              >
                Open last session
              </button>
            ) : null}
            <p className="text-center text-[13px] font-medium tracking-[-0.01em] text-stone-500">
              You can switch anytime
            </p>
          </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
