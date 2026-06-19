import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

/* eslint-disable no-restricted-globals */

clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

const fileExtensionRegexp = /\/[^/?]+\.[^/]+$/;

registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') {
      return false;
    }

    if (url.pathname.startsWith('/_')) {
      return false;
    }

    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }

    return true;
  },
  createHandlerBoundToURL(`${process.env.PUBLIC_URL}/index.html`)
);

registerRoute(
  ({ request, url }) =>
    url.origin === self.location.origin && request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'sgrfs-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);
