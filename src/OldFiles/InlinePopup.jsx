import React, { useState, useRef } from "react";
import { Box, IconButton, CircularProgress } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import { speakWord } from "./utils/speech";

const InlinePopup = ({ selectedWord }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [score, setScore] = useState("N/A");
    const audioRef = useRef(null);

    // Handle Play/Pause button click
    const handlePlayPause = async () => {
        if (!audioRef.current) {
            // Fetch the audio URL using your TTS API
            const audioUrl = await speakWord(selectedWord);
            if (audioUrl) {
                audioRef.current = new Audio(audioUrl);
                audioRef.current.addEventListener("ended", () => setIsPlaying(false));
                audioRef.current.play();
                setIsPlaying(true);
            }
        } else {
            if (audioRef.current.paused) {
                audioRef.current.play();
                setIsPlaying(true);
            } else {
                audioRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    // Handle Record button click (dummy implementation)
    const handleRecord = () => {
        setIsRecording(true);
        // Simulate recording by turning on an animation for 3 seconds
        setTimeout(() => {
            setIsRecording(false);
            // TODO: After recording, send the audio for scoring and update `score`
        }, 3000);
    };

    return (
        <Box
            sx={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                padding: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
            }}
        >
            {/* Play/Pause Button */}
            <IconButton onClick={handlePlayPause} color="primary">
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>

            {/* Record Button */}
            <IconButton onClick={handleRecord} color="secondary">
                {isRecording ? <StopIcon /> : <MicIcon />}
            </IconButton>

            {/* Score Display */}
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "#2196F3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "14px",
                }}
            >
                {score}
            </Box>
        </Box>
    );
};

export default InlinePopup;
