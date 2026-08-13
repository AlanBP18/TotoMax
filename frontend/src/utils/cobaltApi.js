// frontend/src/utils/cobaltApi.js

const COBALT_INSTANCES = [
  'https://rue-cobalt.xenon.zone/',
  'https://cobaltapi.kittycat.boo/',
  'https://subito-c.meowing.de/',
  'https://bergung-api.hoffnungfuerdiezukunft.net/'
];

/**
 * Calls the Cobalt.tools API to get a direct download link for the given URL.
 * 
 * @param {Object} options
 * @param {string} options.url - The URL of the media (YouTube, Twitter, TikTok, etc.)
 * @param {string} options.videoQuality - e.g. "1080", "720", "480", "360", "max"
 * @param {string} options.audioFormat - e.g. "mp3", "wav", "m4a", "best"
 * @param {boolean} options.isAudioOnly - true to extract audio only
 * @param {string} options.format - e.g. "mp4", "mkv", "webm" (used if isAudioOnly is false)
 * @returns {Promise<string>} The direct download URL or stream URL
 */
export async function fetchCobaltDownloadUrl({
  url,
  videoQuality = '1080',
  audioFormat = 'mp3',
  isAudioOnly = false,
  format = 'mp4'
}) {
  let lastError = null;

  for (const apiRoot of COBALT_INSTANCES) {
    // ponytail: try v10 payload, fall back to v7, then to minimal to handle different server versions
    const payloads = [
      // v10+ schema
      {
        url: url,
        videoQuality: videoQuality,
        audioFormat: audioFormat === 'm4a' ? 'best' : audioFormat,
        downloadMode: isAudioOnly ? 'audio' : 'auto',
        audioBitrate: '320'
      },
      // v7-v8 schema
      {
        url: url,
        vQuality: videoQuality,
        aFormat: audioFormat === 'm4a' ? 'best' : audioFormat,
        isAudioOnly: isAudioOnly
      },
      // minimal fallback
      {
        url: url
      }
    ];

    for (const payload of payloads) {
      try {
        const response = await fetch(apiRoot, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data.status === 'error') {
          throw new Error(data.text || data.error?.code || 'Error devuelto por la API');
        }

        if (data.url) {
          return data.url;
        }
      } catch (err) {
        console.warn(`Instancia ${apiRoot} con payload ${JSON.stringify(payload).substring(0, 40)}... falló:`, err.message);
        lastError = err;
      }
    }
  }

  throw new Error(`Todos los servidores Cobalt fallaron o requieren autenticación. Último error: ${lastError?.message || 'desconocido'}`);
}

/**
 * Helper to download a Blob from a direct URL with progress tracking.
 */
export async function downloadBlobFromUrl(url, onProgress) {
  let lastError = null;

  // Try downloading directly first if the URL is hosted on one of the Cobalt domains (which support CORS)
  const isCobaltDomain = COBALT_INSTANCES.some(inst => {
    try {
      return new URL(url).hostname === new URL(inst).hostname;
    } catch {
      return false;
    }
  });

  if (isCobaltDomain) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await readResponseBlob(response, onProgress);
    } catch (err) {
      console.warn(`Direct download from Cobalt domain failed, falling back to proxies:`, err.message);
      lastError = err;
    }
  }

  // Fallback to CORS proxies if direct download is not possible or fails
  const proxyBuilders = [
    (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
    (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`
  ];

  for (const buildProxyUrl of proxyBuilders) {
    try {
      const proxyUrl = buildProxyUrl(url);
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} (${response.statusText})`);
      }
      return await readResponseBlob(response, onProgress);
    } catch (err) {
      console.warn(`Proxy download failed:`, err.message);
      lastError = err;
    }
  }

  throw new Error(`Error descargando archivo: ${lastError?.message || 'todos los intentos fallaron'}`);
}

/**
 * Reads a response body stream as a Blob and reports progress.
 */
async function readResponseBlob(response, onProgress) {
  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  
  let loaded = 0;
  const chunks = [];
  
  if (!response.body) {
    const blob = await response.blob();
    onProgress(100, `Descargando: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
    return blob;
  }
  
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
    loaded += value.length;
    
    if (total) {
      const percent = (loaded / total) * 100;
      onProgress(percent, `Descargando: ${(loaded / 1024 / 1024).toFixed(2)} MB / ${(total / 1024 / 1024).toFixed(2)} MB`);
    } else {
      onProgress(50, `Descargando: ${(loaded / 1024 / 1024).toFixed(2)} MB`);
    }
  }

  return new Blob(chunks, { type: response.headers.get('content-type') || 'application/octet-stream' });
}
