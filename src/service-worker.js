import { clientsClaim } from "workbox-core";
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

clientsClaim();
self.skipWaiting();

registerRoute(
  ({ url }) =>
    url.href.indexOf("dwt-resources") != -1,
  new StaleWhileRevalidate({
    cacheName: "dwt-resources",
  })
);

registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style",
  new StaleWhileRevalidate({
    cacheName: "static-resources",
  })
);


precacheAndRoute(self.__WB_MANIFEST);

