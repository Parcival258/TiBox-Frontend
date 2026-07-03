export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) {
    return
  }

  const isNativeShell =
    window.location.protocol === 'capacitor:' ||
    (window.location.hostname === 'localhost' && !window.location.port)

  if (isNativeShell) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister()
        })
      })
      .catch(() => undefined)
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // The app stays fully usable even if the browser blocks service workers.
    })
  })
}
