/* ==========================================================================
   Service Worker
   Stale-while-revalidate caching strategy for offline support
   ========================================================================== */

const CACHE_NAME = "dsotm-v1";
const STATIC_CACHE = "dsotm-static-v1";
const DATA_CACHE = "dsotm-data-v1";
const IMAGE_CACHE = "dsotm-images-v1";

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/assets/css/main.css",
  "/assets/css/neomorphic.css",
  "/assets/css/themes.css",
  "/assets/js/main.js",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("[SW] Static assets cached");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[SW] Failed to cache static assets:", error);
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old versioned caches
            if (
              cacheName.startsWith("dsotm-") &&
              cacheName !== STATIC_CACHE &&
              cacheName !== DATA_CACHE &&
              cacheName !== IMAGE_CACHE
            ) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("[SW] Activated");
        return self.clients.claim();
      }),
  );
});

// Fetch event - stale-while-revalidate strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip external requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle different resource types
  if (isDataRequest(request)) {
    event.respondWith(handleDataRequest(request));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

/**
 * Check if request is for data (JSON)
 */
function isDataRequest(request) {
  return (
    request.url.includes("/data/") ||
    request.url.endsWith(".json") ||
    request.headers.get("Accept")?.includes("application/json")
  );
}

/**
 * Check if request is for images
 */
function isImageRequest(request) {
  return (
    request.destination === "image" ||
    /\.(webp|png|jpg|jpeg|svg|gif)$/i.test(request.url)
  );
}

/**
 * Check if request is for HTML pages
 */
function isPageRequest(request) {
  return (
    request.mode === "navigate" ||
    request.destination === "document" ||
    request.url.endsWith(".html")
  );
}

/**
 * Handle data requests - stale-while-revalidate
 * Returns cached data immediately, updates cache in background
 */
async function handleDataRequest(request) {
  const cache = await caches.open(DATA_CACHE);
  const cached = await cache.match(request);

  // Return cached version immediately if available
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      console.error("[SW] Data fetch failed:", error);
      // Return cached version on network error
      return cached;
    });

  return cached || fetchPromise;
}

/**
 * Handle image requests - cache first, fallback to network
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    // Update cache in background
    fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response);
        }
      })
      .catch(() => {});

    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error("[SW] Image fetch failed:", error);
    // Return a placeholder or offline fallback
    return new Response("Image unavailable offline", { status: 503 });
  }
}

/**
 * Handle page requests - network first with offline fallback
 */
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful page loads
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.error("[SW] Page fetch failed:", error);
  }

  // Try to return cached version
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  // Return offline page
  const offlinePage = await cache.match("/offline.html");
  if (offlinePage) {
    return offlinePage;
  }

  // Last resort - simple offline message
  return new Response(
    "<h1>Offline</h1><p>You are currently offline. Please check your connection.</p>",
    {
      status: 503,
      headers: { "Content-Type": "text/html" },
    },
  );
}

/**
 * Handle static asset requests - cache first
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    // Update cache in background (stale-while-revalidate)
    fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response);
        }
      })
      .catch(() => {});

    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error("[SW] Static asset fetch failed:", error);
    return new Response("Resource unavailable offline", { status: 503 });
  }
}

// Message handling from main thread
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});

// Background sync for offline form submissions (future enhancement)
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    console.log("[SW] Background sync triggered");
    // Handle deferred actions here
  }
});

console.log("[SW] Service Worker loaded");
