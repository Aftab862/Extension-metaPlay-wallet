import { keyframes } from "@emotion/react";
import { FiberManualRecord, MicNone } from "@mui/icons-material";
import React, { useState, useRef, useEffect } from "react";
import phonicly_config from "../config";
import { resampleAudioTo16kHz } from "./utils/helper";

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;
const handStyle = {
  position: "absolute",
  width: "100px",
  top: "80px",
  left: "20px",
};

const Recorder = ({
  onError,
  onRecordingComplete,
  setScore,
  loading,
  disabled,
  onStart,
  isProcessing,
}) => {
  const handAnimation = chrome.runtime.getURL("icons/hand.gif");

  const [recordingState, setRecordingState] = useState("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [message, setMessage] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const initialTimeoutRef = useRef(null);
  const dataChunksRef = useRef([]);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);
  const recordingStateRef = useRef(recordingState);
  const noAudioRef = useRef(false);

  useEffect(() => {
    recordingStateRef.current = recordingState;
  }, [recordingState]);

  // Setup MediaRecorder onstop callback
  const setupMediaRecorder = () => {
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        dataChunksRef.current.push(event.data);
      }
    };
    mediaRecorderRef.current.onstop = async () => {
      if (noAudioRef.current) {
        console.log("No audio detected, discarding recording.");
        if (typeof onError === "function") {
          onError(true);
        }
        dataChunksRef.current = []; // Discard data
        return;
      }
      if (typeof onError === "function") {
        onError(false);
      }
      const blob = new Blob(dataChunksRef.current, { type: "audio/wav" });
      console.log("Recording finished, audio blob:", blob);
      const resampledBlob = await resampleAudioTo16kHz(blob);
      console.log("REsampled Blob :", resampledBlob);

      if (typeof onRecordingComplete === "function") {
        onRecordingComplete(resampledBlob);
      }
    };
  };

  // Start recording process
  const startRecording = async () => {
    setScore("__");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      source.connect(analyserRef.current);

      mediaRecorderRef.current = new MediaRecorder(stream);
      setupMediaRecorder();
      dataChunksRef.current = [];
      mediaRecorderRef.current.start();

      setRecordingState("initial");
      setMessage("Listening for audio...");
      noAudioRef.current = false;

      // 3-second timeout to check if any sound is detected
      initialTimeoutRef.current = setTimeout(() => {
        if (recordingStateRef.current === "initial") {
          noAudioRef.current = true;
          stopRecording(true);
        }
      }, 3000);

      monitorAudioLevel();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setMessage("Microphone access error");
    }
  };

  const monitorAudioLevel = () => {
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const threshold = 10; // Adjust as needed

    const update = () => {
      analyserRef.current.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] - 128;
        sum += value * value;
      }
      const rms = Math.sqrt(sum / bufferLength);
      setAudioLevel(rms);

      // Transition from initial to recording if sound detected
      if (recordingStateRef.current === "initial" && rms > threshold) {
        clearTimeout(initialTimeoutRef.current);
        setRecordingState("recording");
        setMessage("Recording...");
      }

      // When recording, detect silence (1 second of low volume stops recording)
      if (recordingStateRef.current === "recording") {
        if (rms < threshold) {
          if (!silenceTimeoutRef.current) {
            silenceTimeoutRef.current = setTimeout(() => {
              stopRecording(false);
            }, 1000);
          }
        } else {
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(update);
    };
    update();
  };

  const stopRecording = (noAudio = false) => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setRecordingState(noAudio ? "noAudio" : "stopped");
    setMessage(noAudio ? "No audio found" : "Recording stopped");
    if (initialTimeoutRef.current) clearTimeout(initialTimeoutRef.current);
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
  };

  const handleRecordClick = () => {
    if (
      recordingState === "idle" ||
      recordingState === "stopped" ||
      recordingState === "noAudio"
    ) {
      onStart();
      setRecordingState("idle");
      setMessage("");
      startRecording();
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      if (initialTimeoutRef.current) clearTimeout(initialTimeoutRef.current);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    };
  }, []);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div
        onClick={!disabled && handleRecordClick}
        style={{ cursor: "pointer", zIndex: 1000, marginLeft: "10px" }}
      >
        {recordingState === "initial" || recordingState === "recording" ? (
          <FiberManualRecord
            sx={{
              fontSize: "50px",
              color: "red",
              animation: `${pulseAnimation} 1.5s infinite`,
            }}
          />
        ) : (
          <MicNone
            sx={{
              fontSize: "50px",
              color: disabled ? "grey" : phonicly_config.NEW_LIGHTER_GREEN,
              fontWeight: "bold",
              cursor: disabled ? "progress" : "pointer",
            }}
          />
        )}
      </div>
      {/* <div style={{ marginTop: 10 }}>{message}</div>
            <div style={{ marginTop: 10 }}>Audio Level: {Math.round(audioLevel)}</div> */}
      {/* {(recordingState === "idle" ||
        recordingState === "stopped" ||
        (recordingState === "noAudio" && !isProcessing)) && (
        <img src={handAnimation} style={handStyle} />
      )} */}

      <img
        src={handAnimation}
        style={{
          ...handStyle,
          visibility:
            recordingState === "idle" ||
            recordingState === "stopped" ||
            (recordingState === "noAudio" && !isProcessing)
              ? "visible"
              : "hidden",
          transition: "opacity 0.3s ease-in-out",
          opacity:
            recordingState === "idle" ||
            recordingState === "stopped" ||
            (recordingState === "noAudio" && !isProcessing)
              ? 1
              : 0,
        }}
      />
    </div>
  );
};

export default Recorder;

// import React, { useState, useRef } from "react";

// const Recorder = () => {
//     const [isRecording, setIsRecording] = useState(false);
//     const mediaRecorderRef = useRef(null);
//     const audioChunksRef = useRef([]);

//     const handleRecord = async () => {
//         if (!isRecording) {
//             // Start recording
//             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//             mediaRecorderRef.current = new MediaRecorder(stream);
//             mediaRecorderRef.current.ondataavailable = (event) => {
//                 if (event.data.size > 0) {
//                     audioChunksRef.current.push(event.data);
//                 }
//             };
//             mediaRecorderRef.current.onstop = async () => {
//                 // Combine audio chunks and process the result (e.g., send to backend for scoring)
//                 const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
//                 // Reset for next recording
//                 audioChunksRef.current = [];
//                 // For now, just play back the recorded audio:
//                 const audioUrl = URL.createObjectURL(audioBlob);
//                 const audio = new Audio(audioUrl);
//                 audio.play();
//                 // Later, integrate your score API and update the score display
//             };
//             mediaRecorderRef.current.start();
//             setIsRecording(true);
//         } else {
//             // Stop recording
//             mediaRecorderRef.current.stop();
//             setIsRecording(false);
//         }
//     };

//     return (
//         <button onClick={handleRecord}>
//             {isRecording ? "Stop Recording" :
//                 <MicNone sx={{ fontSize: "45px", color: "lightgreen" }} />

//             }
//         </button>
//     );
// };

// export default Recorder;

// import React, { useState } from "react";

// const Recorder = ({ word, onScoreUpdate }) => {
//     const [recording, setRecording] = useState(false);

//     const startRecording = async () => {
//         setRecording(true);
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         const mediaRecorder = new MediaRecorder(stream);
//         let audioChunks = [];

//         mediaRecorder.ondataavailable = (event) => {
//             audioChunks.push(event.data);
//         };

//         mediaRecorder.onstop = async () => {
//             const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
//             setRecording(false);

//             // Send audio to backend AI model for analysis
//             const score = Math.floor(Math.random() * 100); // Simulated AI score
//             onScoreUpdate(score);
//         };

//         mediaRecorder.start();
//         setTimeout(() => mediaRecorder.stop(), 3000);
//     };

//     return <button onClick={startRecording}>{recording ? "🎙 Recording..." : "🎤 Speak"}</button>;
// };

// export default Recorder;
