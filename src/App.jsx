import { useSessionStore } from './store/sessionStore'
import { AuthScreen } from './screens/AuthScreen'
import { HubScreen } from './screens/HubScreen'
import { GameScreen } from './screens/GameScreen'
import { GameBoard } from './components/GameBoard'

export default function App() {
  const screen = useSessionStore((s) => s.screen)

  if (screen === 'auth') return <AuthScreen />
  if (screen === 'hub') return <HubScreen />
  if (screen === 'game') return <GameScreen />
  return <GameBoard />
}
