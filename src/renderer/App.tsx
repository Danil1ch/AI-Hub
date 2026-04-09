import { useEffect, useRef } from 'react'
import { ChooseServiceScreen } from './components/ChooseServiceScreen'
import { EmbeddedWorkspace, type EmbeddedWorkspaceHandle } from './components/EmbeddedWorkspace'
import { TopBar } from './components/TopBar'
import { getService } from '../shared/services'
import { useHubStore } from './store'

export default function App() {
  const activeId = useHubStore((s) => s.activeId)
  const lastSessionId = useHubStore((s) => s.lastSessionId)
  const setActive = useHubStore((s) => s.setActive)
  const embeddedRef = useRef<EmbeddedWorkspaceHandle>(null)

  useEffect(() => {
    void window.hub.internetDns.get().then((cfg) => {
      useHubStore.setState({
        internetDnsMode: cfg.mode,
        internetDohUrl: cfg.dohUrl
      })
    })
  }, [])

  useEffect(() => {
    if (activeId != null) return
    if (lastSessionId == null) return
    setActive(lastSessionId)
  }, [activeId, lastSessionId, setActive])

  useEffect(() => {
    if (activeId == null) return
    const { lastSessionId } = useHubStore.getState()
    if (lastSessionId == null) {
      useHubStore.setState({ lastSessionId: activeId })
    }
    const svc = getService(activeId)
    document.documentElement.style.setProperty('--accent', svc.accent)
    document.documentElement.style.setProperty(
      '--accent-muted',
      `color-mix(in srgb, ${svc.accent} 16%, transparent)`
    )
  }, [activeId])

  if (activeId == null) {
    return (
      <div className="flex h-full min-h-0 flex-col text-stone-200">
        <ChooseServiceScreen onSelect={setActive} />
      </div>
    )
  }

  const active = getService(activeId)

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col bg-[var(--canvas)] text-stone-200">
      <div className="relative shrink-0">
        <TopBar
          active={active}
          onSelect={setActive}
          onHardReload={() => embeddedRef.current?.hardReload()}
        />
      </div>
      <EmbeddedWorkspace ref={embeddedRef} />
    </div>
  )
}
