// frontend/src/utils/mediaTrimmer.js

/**
 * Encode an AudioBuffer into a WAV Blob (PCM 16-bit) with high performance.
 * Avoids slow element-by-element DataView writes.
 * 
 * @param {AudioBuffer} audioBuffer
 * @returns {Blob}
 */
function encodeWAV(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const numSamples = audioBuffer.length;
  const bytesPerSample = 2; // 16-bit
  const dataLength = numSamples * numChannels * bytesPerSample;
  
  const headerBuffer = new ArrayBuffer(44);
  const view = new DataView(headerBuffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');

  // fmt subchunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);                           // subchunk size (PCM = 16)
  view.setUint16(20, 1, true);                             // audio format (1 = PCM)
  view.setUint16(22, numChannels, true);                   // number of channels
  view.setUint32(24, sampleRate, true);                    // sample rate
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // byte rate
  view.setUint16(32, numChannels * bytesPerSample, true);  // block align
  view.setUint16(34, bytesPerSample * 8, true);            // bits per sample

  // data subchunk
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  // PCM data conversion - specialized loops for high performance
  const pcmData = new Int16Array(numSamples * numChannels);
  
  if (numChannels === 2) {
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    let pcmIndex = 0;
    for (let i = 0; i < numSamples; i++) {
      let lVal = left[i];
      let rVal = right[i];
      // clamp float32 to [-1, 1]
      lVal = lVal < -1 ? -1 : (lVal > 1 ? 1 : lVal);
      rVal = rVal < -1 ? -1 : (rVal > 1 ? 1 : rVal);
      // convert to int16
      pcmData[pcmIndex++] = lVal < 0 ? lVal * 0x8000 : lVal * 0x7FFF;
      pcmData[pcmIndex++] = rVal < 0 ? rVal * 0x8000 : rVal * 0x7FFF;
    }
  } else if (numChannels === 1) {
    const mono = audioBuffer.getChannelData(0);
    for (let i = 0; i < numSamples; i++) {
      let val = mono[i];
      val = val < -1 ? -1 : (val > 1 ? 1 : val);
      pcmData[i] = val < 0 ? val * 0x8000 : val * 0x7FFF;
    }
  } else {
    // fallback for multi-channel
    let pcmIndex = 0;
    const channelData = [];
    for (let ch = 0; ch < numChannels; ch++) {
      channelData.push(audioBuffer.getChannelData(ch));
    }
    for (let i = 0; i < numSamples; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        let val = channelData[ch][i];
        val = val < -1 ? -1 : (val > 1 ? 1 : val);
        pcmData[pcmIndex++] = val < 0 ? val * 0x8000 : val * 0x7FFF;
      }
    }
  }

  return new Blob([headerBuffer, pcmData], { type: 'audio/wav' });
}

/**
 * Trim an already-decoded AudioBuffer to the [startSec, endSec] range.
 */
function trimBuffer(decoded, startSec, endSec, ctx) {
  const sr = decoded.sampleRate;
  const startSample = Math.max(0, Math.floor(startSec * sr));
  const endSample = Math.min(decoded.length, Math.floor(endSec * sr));
  const frameCount = Math.max(1, endSample - startSample);

  const trimmed = ctx.createBuffer(decoded.numberOfChannels, frameCount, sr);
  for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
    trimmed.copyToChannel(
      decoded.getChannelData(ch).subarray(startSample, endSample),
      ch
    );
  }
  return trimmed;
}

/**
 * Fetch and trim Audio exactly using Web Audio API.
 * Compatible with Safari and older browsers.
 */
export async function trimAudio(mediaUrlOrBlob, startSec, endSec, onProgress) {
  onProgress(10, 'Leyendo datos de audio...');
  
  let arrayBuffer;
  if (mediaUrlOrBlob instanceof Blob) {
      arrayBuffer = await mediaUrlOrBlob.arrayBuffer();
  } else {
      const response = await fetch(mediaUrlOrBlob);
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      arrayBuffer = await response.arrayBuffer();
  }

  onProgress(40, 'Decodificando audio...');
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();

  try {
    // Cross-browser decodeAudioData using promises & callbacks fallback
    const decoded = await new Promise((resolve, reject) => {
      ctx.decodeAudioData(arrayBuffer, resolve, (err) => {
        reject(err || new Error('Error al decodificar los datos de audio.'));
      });
    });

    onProgress(70, 'Recortando fragmento...');
    const clampedEnd = Math.min(endSec, decoded.duration);
    const clampedStart = Math.min(startSec, clampedEnd);
    const trimmed = trimBuffer(decoded, clampedStart, clampedEnd, ctx);

    onProgress(90, 'Codificando WAV...');
    const blob = encodeWAV(trimmed);
    onProgress(100, 'Listo');
    return blob;
  } finally {
    ctx.close();
  }
}

/**
 * Trim Video (and audio) using MediaRecorder and captureStream in real-time.
 */
export async function trimVideo(videoElement, startSec, endSec, onProgress) {
  if (!videoElement || !videoElement.captureStream) {
    throw new Error('El navegador no soporta captureStream para video.');
  }

  const duration = endSec - startSec;
  if (duration <= 0) throw new Error('Duración inválida.');

  onProgress(5, 'Preparando captura de video...');

  return new Promise((resolve, reject) => {
    videoElement.currentTime = startSec;
    videoElement.muted = false;

    // request 30 FPS stream
    const stream = videoElement.captureStream(30); 
    if (stream.getTracks().length === 0) {
        reject(new Error('No hay pistas en el stream de video.'));
        return;
    }

    const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm'
    ];
    let selectedMime = '';
    for (let mt of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mt)) {
            selectedMime = mt;
            break;
        }
    }

    const recorder = new MediaRecorder(stream, { mimeType: selectedMime });
    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      onProgress(90, 'Finalizando archivo de video...');
      const blob = new Blob(chunks, { type: recorder.mimeType });
      onProgress(100, 'Listo');
      resolve({ blob, ext: 'webm' });
    };

    recorder.onerror = (e) => {
      reject(e.error || new Error('Error en MediaRecorder'));
    };

    const onSeeked = () => {
      videoElement.removeEventListener('seeked', onSeeked);
      recorder.start(1000); // chunk every second
      videoElement.play().catch(() => {});

      onProgress(15, `Grabando fragmento (${duration.toFixed(1)}s)...`);

      const progressInterval = setInterval(() => {
        if (videoElement.currentTime >= endSec || videoElement.paused) {
          clearInterval(progressInterval);
          return;
        }
        const elapsed = videoElement.currentTime - startSec;
        const pct = Math.min(85, 15 + (elapsed / duration) * 70);
        onProgress(pct, `Grabando... ${elapsed.toFixed(1)}s / ${duration.toFixed(1)}s`);
      }, 250);

      const checkEnd = () => {
        if (videoElement.currentTime >= endSec) {
          clearInterval(progressInterval);
          videoElement.pause();
          videoElement.removeEventListener('timeupdate', checkEnd);
          recorder.stop();
        }
      };
      videoElement.addEventListener('timeupdate', checkEnd);

      setTimeout(() => {
        clearInterval(progressInterval);
        if (recorder.state === 'recording') {
          videoElement.pause();
          videoElement.removeEventListener('timeupdate', checkEnd);
          recorder.stop();
        }
      }, (duration + 2) * 1000);
    };

    videoElement.addEventListener('seeked', onSeeked);
    if (Math.abs(videoElement.currentTime - startSec) < 0.1) {
      videoElement.removeEventListener('seeked', onSeeked);
      onSeeked();
    }
  });
}
