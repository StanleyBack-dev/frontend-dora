// Dora service worker: only Web Push. No caching — every page needs the
// server and a session, so there is nothing useful to serve offline.
/* global self */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Payload sent by the API: { title, body, url, tag, actions? }.
// Buttons show where the browser supports them (Chrome, Edge, Firefox); on
// Safari a tap opens the page as before.
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "Dora", body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Dora", {
      body: data.body || "",
      icon: "/pwa-icon/192",
      badge: "/pwa-icon/192",
      tag: data.tag,
      renotify: Boolean(data.tag),
      lang: "pt-BR",
      actions: Array.isArray(data.actions) ? data.actions.slice(0, 2) : [],
      data: { url: data.url || "/notificacoes" },
    }),
  );
});

// Opens a page in an app window that is already open, or a new one.
function openPage(url) {
  const target = new URL(url || "/notificacoes", self.location.origin);
  if (target.origin !== self.location.origin) return Promise.resolve();
  return self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((windows) => {
      const open = windows.find(
        (client) => new URL(client.url).origin === target.origin,
      );
      if (open) {
        return open.focus().then((client) => client.navigate(target.href));
      }
      return self.clients.openWindow(target.href);
    });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // "Abrir" or a tap on the notification itself.
  event.waitUntil(openPage(event.notification.data?.url));
});
