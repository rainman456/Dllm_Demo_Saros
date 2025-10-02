import { Route, Switch } from "wouter"
import Dashboard from "./pages/Dashboard"
import Analytics from "./pages/Analytics"
import Simulator from "./pages/Simulator"
import Settings from "./pages/Settings"

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/simulator" component={Simulator} />
      <Route path="/settings" component={Settings} />
      <Route>404 - Not Found</Route>
    </Switch>
  )
}
