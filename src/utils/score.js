import phonicly_config from "../../config";
import { fetchNewToken } from "./helper";
import { sendUmamiEvent } from "./helper"; // <-- Add this

export async function computeScore(referenceBlob, userBlob, text) {
  const formData = new FormData();
  formData.append("user_audio", userBlob, "recorded_audio.wav");
  formData.append("text", text);
  formData.append("reference_audio", referenceBlob, "tts_audio.wav");

  const authToken = await fetchNewToken(phonicly_config.GUEST_USERID);

  // Define URLs
  const gpuURL = phonicly_config.GPU_SERVER_AUDIO_UPLOAD_URL;
  const fallbackURL = phonicly_config.audioUrl;

  // Function to fetch with timeout
  async function fetchWithTimeout(url, timeout = 300000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${authToken}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn(`Request to ${url} timed out`);
      }
      throw error;
    }
  }

  let response;
  try {
    response = await fetchWithTimeout(gpuURL, 300000);
  } catch (error) {
    console.log("GPU Server failed or timed out, switching to fallback URL...");
    response = await fetch(fallbackURL, {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${authToken}` },
    });
  }

  if (!response.ok) {
    throw new Error("Failed to compute score");
  }

  const data = await response.json();
  console.log("API fetch successful", data);

  const score = data?.overall_similarity_score;

  // 🔥 Send score to Umami
  if (score !== undefined) {
    sendUmamiEvent({
      score: score,  // Send score directly
      text: text     // Send text directly
    });
  }



  //   if (data?.overall_similarity_score > 10) {
  //     console.log("Similarity score is above 10. Attempting to play audio...");

  //     const ding = new Audio(phonicly_config.CHIME_SOUND_URL);
  //     ding.onplay = () => console.log("Audio started playing successfully.");
  //     ding.onended = () => console.log("Audio playback finished.");
  //     ding.onerror = (error) => console.error("Audio error:", error);

  //     ding.play().catch((error) => {
  //       console.error("Audio playback failed:", error);
  //     });
  //   } else {
  //     console.log("Similarity score is below 10. No audio played.");
  //   }

  return data?.overall_similarity_score;
}
