// import React, { useState, useRef } from "react";
// import { IconButton } from "@mui/material";
// import PlayArrowIcon from "@mui/icons-material/PlayArrow";
// import PauseIcon from "@mui/icons-material/Pause";
// import { speakWord } from "./utils/speech";

// const AudioPlayer = ({ word }) => {
//     const [isPlaying, setIsPlaying] = useState(false);
//     const audioRef = useRef(null);

//     const handlePlayPause = async () => {
//         if (!audioRef.current) {
//             // Fetch audio URL using your TTS API
//             const audioUrl = await speakWord(word);
//             if (audioUrl) {
//                 audioRef.current = new Audio(audioUrl);
//                 audioRef.current.onended = () => setIsPlaying(false);
//                 audioRef.current.play();
//                 setIsPlaying(true);
//             }
//         } else {
//             if (isPlaying) {
//                 audioRef.current.pause();
//                 setIsPlaying(false);
//             } else {
//                 audioRef.current.play();
//                 setIsPlaying(true);
//             }
//         }
//     };

//     return (
//         <IconButton onClick={handlePlayPause} color="primary">
//             {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
//         </IconButton>
//     );
// };

// export default AudioPlayer;


import React from "react";

const AudioPlayer = ({ word }) => {
    const playAudio = () => {
        const audio = new Audio(`https://api.dictionaryapi.dev/media/pronunciations/en/${word}-us.mp3`);
        audio.play();
    };

    return <button onClick={playAudio}>🔊 Listen</button>;
};

export default AudioPlayer;
