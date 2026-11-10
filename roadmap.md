# Roadmap

- [ ] Reduce backend load: slow dashboard auto-refresh (30s → 2 min, 1 min → 5 min)
- [ ] Stop the workspace check re-running (and dimming the page) on every sign-in token refresh
- [ ] Never lock the page when the backend is slow: cached workspace, timeout, retry, connection-trouble notice
- [ ] Fix scheduled AI lead jobs rejected for missing sign-in (scores stale since June)
- [ ] Only wake the every-minute scheduled-calls job when calls are actually due
- [ ] Top menu buttons (Communications page): icons only, labels moved to tooltips
