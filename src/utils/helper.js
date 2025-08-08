// import phonicly_config from "../../config";



function audioBufferToWav(audioBuffer) {
    const numOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const samples = audioBuffer.getChannelData(0);
    const bufferLength = samples.length;
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + bufferLength * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numOfChannels * 2, true);
    view.setUint16(32, numOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, bufferLength * 2, true);
    const wavData = new Uint8Array(44 + bufferLength * 2);
    const dataView = new DataView(wavData.buffer);
    new Uint8Array(wavHeader).forEach((byte, i) => dataView.setUint8(i, byte));
    for (let i = 0; i < bufferLength; i++) {
        const sample = Math.max(-1, Math.min(1, samples[i]));
        dataView.setInt16(44 + i * 2, sample * 32767, true);
    }
    return wavData.buffer;
    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}

export async function resampleAudioTo16kHz(blob) {
    console.log("Starting resampleAudioTo16kHz");

    // Initialize AudioContext and resume if needed
    const audioContext = new AudioContext({ sampleRate: phonicly_config.SAMPLE_RATE });
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log("AudioContext resumed");
    }

    const arrayBuffer = await blob.arrayBuffer();
    console.log("Blob converted to ArrayBuffer");

    let audioBuffer;
    try {
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        console.log("Audio decoded", audioBuffer);
    } catch (error) {
        console.error("Error decoding audio data:", error);
        throw error;
    }

    // Ensure that the audioBuffer properties are valid
    console.log("AudioBuffer channels:", audioBuffer.numberOfChannels, "length:", audioBuffer.length, "sampleRate:", audioBuffer.sampleRate);

    const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        phonicly_config.SAMPLE_RATE
    );
    console.log("OfflineAudioContext created", offlineContext);

    const bufferSource = offlineContext.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.connect(offlineContext.destination);
    bufferSource.start(0);
    console.log("BufferSource started");

    let renderedBuffer;
    try {
        renderedBuffer = await offlineContext.startRendering();
        console.log("Offline rendering completed", renderedBuffer);
    } catch (error) {
        console.error("Error during offline rendering:", error);
        throw error;
    }

    const wavData = audioBufferToWav(renderedBuffer);
    console.log("WAV data created");

    const resampledBlob = new Blob([wavData], { type: 'audio/wav' });
    console.log("Resampled blob created", resampledBlob);

    return resampledBlob;
};


export async function urlToBlob(audioUrl) {


    try {
        const response = await fetch(audioUrl);
        if (!response.ok) {
            throw new Error('Audio file fetch failed');
        }
        const audioBlob = await response.blob();
        return audioBlob;
    } catch (error) {
        console.error('Error fetching audio file:', error);
    }



}


export async function fetchNewToken(userId) {
    try {
        const response = await fetch(`${phonicly_config.BASE_URL}/api/get-jwt/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: userId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        const newToken = data.JWT;
        console.log("New token fetched:", newToken);
        return newToken;
    } catch (error) {
        console.error("Error fetching new token:", error);
        throw new Error("Unable to fetch token.");
    }
}

export async function sendUmamiEvent(score, text) {
    try {
        const payload = {
            type: "event",
            payload: {
                website: phonicly_config.UMAMI_WEBSITE_ID,
                url: window.location.href || "chrome-extension://popup.html",
                hostname: window.location.hostname || "extension",
                screen: `${window.screen.width}x${window.screen.height}`,
                language: navigator.language,
                title: document.title || "Phonicly Extension",
                name: "extension_shadowing", // 🔥 custom event name
                data: {
                    score,
                    text,
                },
            },
        };

        await fetch(phonicly_config.UMAMI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${phonicly_config.UMAMI_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        console.log("📊 Umami event sent successfully:", payload);
    } catch (error) {
        console.warn("Umami event tracking failed:", error);
    }
}
export function mapColors(symbol) {

    console.log("symbol :", symbol)
    switch (symbol) {
        case "EVM": // EVM
            return 'dodgerblue'; // blue
        case "SOL": // Solana
            return 'purple';
        case 3: // Bitcoin
            return '#f7931a'; // orange
        default:
            return '#9e9e9e'; // grey (fallback)
    }
}

export function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

