import phonicly_config from "../../config";

export async function speakWord(word) {
    const API_URL = "https://api.phonicly.ai/api/text-to-speech/";

    const modifyResponse = (response) => {
        const baseUrl = phonicly_config.BASE_URL;
        return `${baseUrl}${response.full_paragraph_audio_url}/`;

    };

    try {
        const startTime = performance.now();
        console.log(
            `[${(startTime / 1000).toFixed(2)}s] 🎙 Generating audio for: ${word}...`
        );

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sentences: [word] }),
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        const audioUrl = modifyResponse(data);

        console.log("modified data", audioUrl)


        if (audioUrl) {
            console.log(
                `[${(performance.now() / 1000).toFixed(2)}s] 🔊 Audio Ready: ${audioUrl}`
            );
            // Fetch the audio blob so we can return it without playing it
            const audioBlob = await fetch(audioUrl).then((res) => res.blob());
            return audioBlob;
        } else {
            console.error("❌ No valid audio URL received.");
        }
    } catch (error) {
        console.error("❌ Error fetching speech:", error);
        throw error;
    }
}





// export async function speakWord(word) {
//     const API_URL = "https://api.phonicly.ai/api/text-to-speech/";
//     const BASE_URL = "https://api.phonicly.ai";

//     const modifyResponse = (response) => ({
//         ...response,
//         sentence_audio_urls: response?.sentence_audio_urls?.map((item) => ({
//             ...item,
//             audio_url: `${BASE_URL}${item.audio_url}`
//         })) || [],
//         full_paragraph_audio_url: `${BASE_URL}${response?.full_paragraph_audio_url}`
//     });

//     try {
//         const startTime = performance.now();
//         console.log(`[${(startTime / 1000).toFixed(2)}s] 🎙 Generating audio for: ${word}...`);

//         const response = await fetch(API_URL, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ sentences: [word] })
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP Error: ${response.status}`);
//         }

//         const data = await response.json();
//         const apiResponseTime = performance.now();
//         console.log(`[${(apiResponseTime / 1000).toFixed(2)}s] ✅ API response received`, data);

//         const modifiedData = modifyResponse(data);
//         const audioUrl =
//             modifiedData?.full_paragraph_audio_url ||
//             modifiedData?.sentence_audio_urls?.[0]?.audio_url;

//         if (audioUrl) {
//             console.log(`[${(performance.now() / 1000).toFixed(2)}s] 🔊 Audio Ready: ${audioUrl}`);

//             const audio = new Audio(audioUrl);
//             let playbackStartTime = 0;

//             audio.addEventListener("play", () => {
//                 playbackStartTime = performance.now();
//                 console.log(`[${(playbackStartTime / 1000).toFixed(2)}s] ▶️ Audio is playing now`);
//                 const totalDelay = ((playbackStartTime - startTime) / 1000).toFixed(2);
//                 console.log(`⏳ Total delay: ${totalDelay} seconds`);
//             });

//             audio.addEventListener("ended", () => {
//                 const playbackEndTime = performance.now();
//                 const playbackDuration = ((playbackEndTime - playbackStartTime) / 1000).toFixed(2);
//                 console.log(
//                     `[${(playbackEndTime / 1000).toFixed(2)}s] ⏹ Audio finished playing (Duration: ${playbackDuration} seconds)`
//                 );
//             });

//             audio.play();
//         } else {
//             console.error("❌ No valid audio URL received.");
//         }
//     } catch (error) {
//         console.error("❌ Error fetching speech:", error);
//     }
// }
