export default function AppShell({ children, className = "" }) {
  return <main className={`app-shell ${className}`.trim()}>{children}</main>;
}
