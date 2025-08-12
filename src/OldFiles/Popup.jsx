// import React, { useState, useRef, useEffect } from "react";
// import { speakWord } from "./utils/speech";
// import {
//   Box,
//   Button,
//   CircularProgress,
//   IconButton,
//   Stack,
//   Typography,
// } from "@mui/material";
// import { CloseOutlined } from "@mui/icons-material";
// import ReplayIcon from "@mui/icons-material/Replay";
// import Recorder from "./Recorder";
// import { computeScore } from "./utils/score";
// import phonicly_config from "../config";

// // Declare chrome variable if it's not available globally
// const chrome = typeof window !== "undefined" && window.chrome;

// const logoUrl =
//   chrome && chrome.runtime
//     ? chrome.runtime.getURL("icons/Logo.png")
//     : "/placeholder.svg";

// const Popup = ({ text, position, onClose }) => {
//   // Reference audio state
//   const [isReferencePlaying, setIsReferencePlaying] = useState(false);
//   const [referenceBlob, setReferenceBlob] = useState(null);
//   // User recording states
//   const [recordedBlob, setRecordedBlob] = useState(null);
//   const [isUserPlaying, setIsUserPlaying] = useState(false);
//   const [recorderError, setRecorderError] = useState(false);
//   const [score, setScore] = useState("__");
//   const userAudioRef = useRef(null);
//   const referenceAudioRef = useRef(null);
//   const [loading, setLoading] = useState(false);
//   // New state to disable mic while processing the audio sequence
//   const [isProcessing, setIsProcessing] = useState(false);
//   // New states for replay functionality
//   const [referenceURL, setReferenceURL] = useState(null);
//   const [userURL, setUserURL] = useState(null);
//   const [showReplay, setShowReplay] = useState(false);
//   // Flag to track if audio sequence has been played
//   const [audioSequencePlayed, setAudioSequencePlayed] = useState(false);

//   // Preload the reference audio when popup opens or text changes
//   useEffect(() => {
//     const abortController = new AbortController();
//     const preloadAudio = async () => {
//       try {
//         const blob = await speakWord(text, abortController.signal);
//         if (blob) {
//           setReferenceBlob(blob);
//         }
//       } catch (error) {
//         console.error("Error preloading audio", error);
//       }
//     };

//     preloadAudio();

//     // Cleanup when text changes or component unmounts:
//     return () => {
//       abortController.abort();
//       stopAllAudios();
//       setReferenceBlob(null);
//     };
//   }, [text, position]);

//   const stopAllAudios = () => {
//     // Pause & reset any playing audio elements
//     if (referenceAudioRef.current) {
//       referenceAudioRef.current.pause();
//       referenceAudioRef.current.currentTime = 0;
//       referenceAudioRef.current = null;
//     }
//     if (userAudioRef.current) {
//       userAudioRef.current.pause();
//       userAudioRef.current.currentTime = 0;
//       userAudioRef.current = null;
//     }

//     // Revoke old object URLs for replay
//     if (referenceURL) {
//       URL.revokeObjectURL(referenceURL);
//       setReferenceURL(null);
//     }
//     if (userURL) {
//       URL.revokeObjectURL(userURL);
//       setUserURL(null);
//     }

//     setIsProcessing(false);
//     setIsReferencePlaying(false);
//     setIsUserPlaying(false);
//     setShowReplay(false);
//   };

//   const playAudio = (audioUrl) => {
//     return new Promise((resolve, reject) => {
//       const audio = new Audio(audioUrl);
//       audio.play();
//       audio.addEventListener("ended", () => {
//         resolve();
//       });
//       audio.addEventListener("error", (e) => {
//         console.error("Audio playback error:", e);
//         reject(e);
//       });
//     });
//   };

//   const handleSequencePlay = async () => {
//     if (isProcessing || !referenceBlob) return;
//     setIsProcessing(true);

//     try {
//       // // 1. Play chime
//       // await playAudio(phonicly_config.CHIME_SOUND_URL);

//       // 2. Play Reference Audio
//       setIsReferencePlaying(true);
//       const refAudioUrl = URL.createObjectURL(referenceBlob);
//       setReferenceURL(refAudioUrl);
//       await playAudio(refAudioUrl);
//       setIsReferencePlaying(false);

//       // 3. Play User Audio (if available)
//       if (recordedBlob) {
//         const userAudioUrl = URL.createObjectURL(recordedBlob);
//         setUserURL(userAudioUrl);
//         setIsUserPlaying(true);
//         await playAudio(userAudioUrl);
//         setIsUserPlaying(false);
//       }

//       // // 4. Play end beep
//       // await playAudio(phonicly_config.BEEP_END_URL);

//       // 5. Reveal replay links
//       setShowReplay(true);
//     } catch (error) {
//       console.error("Error during audio sequence:", error);
//     }

//     setIsProcessing(false);
//     setAudioSequencePlayed(true);
//   };

//   // Play audio sequence as soon as we have both blobs
//   // This happens BEFORE score computation
//   useEffect(() => {
//     if (referenceBlob && recordedBlob && !audioSequencePlayed) {
//       handleSequencePlay();
//       // Start score computation in parallel
//       setLoading(true);
//     }
//   }, [referenceBlob, recordedBlob, audioSequencePlayed]);

//   // Compute the score if both blobs are available
//   useEffect(() => {
//     const compute = async () => {
//       try {
//         const scor = await computeScore(referenceBlob, recordedBlob, text);
//         setScore(scor);
//       } catch (error) {
//         console.error("Score computation failed", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (referenceBlob && recordedBlob) {
//       compute();
//     }
//   }, [referenceBlob, recordedBlob, text]);

//   // Inject bounce keyframes
//   useEffect(() => {
//     const style = document.createElement("style");
//     style.innerHTML = bounceKeyframes;
//     document.head.appendChild(style);
//     return () => document.head.removeChild(style);
//   }, []);

//   const bounceKeyframes = `
//     @keyframes bounce {
//       0%, 100% { transform: translateY(0); }
//       50% { transform: translateY(-6px); }
//     }
//   `;

//   const popupStyle = {
//     position: "absolute",
//     top: position.top + 10 + "px",
//     left: position.left + "px",
//     padding: "10px",
//     background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
//     boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
//     borderRadius: "8px",
//     zIndex: 9999,
//     minWidth: "250px",
//     border: "1px solid #1D6F17",
//     fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
//     color: "#333",
//     transition: "all 0.3s ease-in-out",
//   };

//   const handleReplayClick = async () => {
//     if (!referenceURL) return;
//     try {
//       setIsProcessing(true);
//       // play reference
//       await playAudio(referenceURL);
//       // then user recording (if any)
//       if (userURL) {
//         await playAudio(userURL);
//       }
//     } catch (e) {
//       console.error("Replay error:", e);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div style={popupStyle}>
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//         p={1}
//       >
//         <a href="https://phonicly.ai" target="_blank" rel="noopener noreferrer">
//           <img
//             src={logoUrl || "/placeholder.svg"}
//             alt="Phonicly Logo"
//             style={{ height: "33px" }}
//           />
//         </a>
//         <IconButton size="small" onClick={onClose}>
//           <CloseOutlined />
//         </IconButton>
//       </Box>

//       <Box display="flex" justifyContent="flex-end">
//         {recorderError && (
//           <p style={{ color: "red", fontSize: "small", margin: 0 }}>
//             No audio!
//           </p>
//         )}
//       </Box>

//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           p: "0.5rem",
//           borderBottomLeftRadius: "10px",
//           borderBottomRightRadius: "10px",
//           backgroundColor: "#f8f9fa",
//         }}
//       >
//         <Stack>
//           <Recorder
//             setScore={setScore}
//             onError={setRecorderError}
//             onRecordingComplete={(blob) => {
//               setRecordedBlob(blob);
//               setAudioSequencePlayed(false); // Reset flag for new recording
//             }}
//             onStart={() => {
//               // New recording: clear previous data
//               stopAllAudios();
//               setRecordedBlob(null);
//               setScore("__");
//               setAudioSequencePlayed(false);
//             }}
//             loading={loading}
//             disabled={isProcessing}
//             isProcessing={isProcessing}
//           />
//         </Stack>

//         <Stack>
//           <Box
//             sx={{
//               width: "40px",
//               height: "40px",
//               borderRadius: "50%",
//               backgroundColor: "#1D6F17",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "#fff",
//               fontWeight: 600,
//               fontSize: "22px",
//             }}
//           >
//             {loading ? (
//               <CircularProgress size={24} sx={{ color: "white" }} />
//             ) : (
//               score
//             )}
//           </Box>
//           <p style={{ fontSize: "13px", textAlign: "center" }}>Score</p>
//         </Stack>
//       </Box>

//       <Box mt={1} textAlign="center">
//         <Typography
//           onClick={showReplay ? handleReplayClick : null}
//           sx={{
//             cursor: !showReplay || isProcessing ? "not-allowed" : "pointer",
//             display: "inline-flex",
//             alignItems: "center",
//             fontSize: "14px",
//             color: showReplay ? phonicly_config.DARK_GREEN : "grey",
//             userSelect: "none",
//             opacity: isProcessing ? 0.5 : 1,
//           }}
//         >
//           Click to replay&nbsp;
//           <ReplayIcon sx={{ fontSize: "16px" }} />
//         </Typography>
//       </Box>

//       <Box display="flex" justifyContent="center">
//         <Button
//           sx={{
//             p: "7px 0",
//             height: "40px",
//             textTransform: "none",
//             color: "black !important",
//             fontSize: "14px",
//             cursor: "pointer",
//             "&:hover": { backgroundColor: "transparent" },
//           }}
//         >
//           To learn more visit&nbsp;
//           <a
//             href="https://phonicly.ai"
//             target="_blank"
//             rel="noopener noreferrer"
//             style={{
//               color: phonicly_config.DARK_GREEN,
//               textDecoration: "underline",
//               fontWeight: "bold",
//             }}
//           >
//             phonicly.ai
//           </a>
//         </Button>
//       </Box>
//     </div>
//   );
// };

// export default Popup;

// const animatedTextStyle = {
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   fontSize: "16px",
//   fontWeight: "bold",
//   margin: "12px 0",
//   color: "#1D6F17",
//   animation: "bounce 1.2s infinite",
// };

{
  /* <Box sx={{ textAlign: "center", fontSize: "18px", color: "#333" }}>
          <Box
            onClick={!isDisabled ? handleReferencePlay : undefined}
            sx={{
              cursor: isDisabled ? "not-allowed" : "pointer",
              opacity: isDisabled ? 0.5 : 1,
            }}
          >
            {isReferencePlaying ? (
              <Pause
                sx={{
                  fontSize: "33px",
                  backgroundColor: "green",
                  padding: "4px",
                  color: "white",
                  borderRadius: "50%",
                  fontWeight: "bold",
                }}
              />
            ) : (
              <PlayArrow
                sx={{
                  fontSize: "33px",
                  backgroundColor: "green",
                  padding: "4px",
                  color: "white",
                  borderRadius: "50%",
                  fontWeight: "bold",
                }}
              />
            )}
          </Box>
        </Box> */
}

// // Play or pause the recorded audio
// const handleUserRecordingPlay = () => {
//   if (!recordedBlob) return;
//   if (!isUserPlaying) {
//     const audioUrl = URL.createObjectURL(recordedBlob);
//     const audio = new Audio(audioUrl);
//     userAudioRef.current = audio;
//     audio.play();
//     setIsUserPlaying(true);
//     audio.addEventListener("ended", () => {
//       setIsUserPlaying(false);
//     });
//   } else {
//     if (userAudioRef.current) {
//       userAudioRef.current.pause();
//     }
//     setIsUserPlaying(false);
//   }
// };

{
  /* Row for User Recorded Audio */
}
{
  /* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: "pointer" }}>
                <Box display="flex" alignItems="center">
                    <IconButton
                        disableRipple
                        onClick={recordedBlob ? handleUserRecordingPlay : undefined}
                        disabled={!recordedBlob}
                        sx={{
                            padding: 0,
                            marginRight: 0.5,
                            '&:hover': { backgroundColor: 'transparent' },
                            '&:focus': { backgroundColor: 'transparent' },
                        }}
                    >
                        {isUserPlaying ? (
                            <PauseIcon sx={{ color: "#6DC251" }} />
                        ) : (
                            <PlayArrowIcon sx={{ color: "#6DC251" }} />
                        )}
                    </IconButton>
                    <p style={{ fontSize: 'small', margin: 0 }}>
                        {recordedBlob ? "Your Recording" : "No Recording"}
                    </p>
                </Box>
                {recorderError && (
                    <p style={{ color: 'red', fontSize: 'small', margin: 0 }}>
                        No audio!
                    </p>
                )}
            </Box> */
}

{
  /* <Box sx={{ display: 'flex', alignItems: 'center', cursor: "pointer", marginBottom: 1 }}>
                <IconButton
                    disableRipple
                    onClick={!isDisabled ? handleReferencePlay : undefined}
                    sx={{
                        padding: 0,
                        marginRight: 0.5,
                        '&:hover': { backgroundColor: 'transparent' },
                        '&:focus': { backgroundColor: 'transparent' },
                    }}
                >
                    {isReferencePlaying ? (
                        <PauseIcon sx={{ color: "#6DC251" }} />
                    ) : (
                        <PlayArrowIcon sx={{ color: "#6DC251" }} />
                    )}
                </IconButton>
                <p style={{ fontSize: 'small', margin: 0 }}>Reference Audio</p>
            </Box> */
}

{
  /* Row for User Recorded Audio */
}
{
  /* <Box sx={{ display: 'flex', alignItems: 'center', cursor: "pointer", marginBottom: 1 }}>
                <IconButton
                    disableRipple
                    onClick={handleUserRecordingPlay}
                    sx={{
                        padding: 0,
                        marginRight: 0.5,
                        '&:hover': { backgroundColor: 'transparent' },
                        '&:focus': { backgroundColor: 'transparent' },
                    }}
                >
                    {isUserPlaying ? (
                        <PauseIcon sx={{ color: "#6DC251" }} />
                    ) : (
                        <PlayArrowIcon sx={{ color: "#6DC251" }} />
                    )}
                </IconButton>
                <p style={{ fontSize: 'small', margin: 0 }}>
                    {recordedBlob ? "Your Recording" : "No Recording"}
                </p>
            </Box> */
}

{
  /* Recorder Component */
}
{
  /* <Box sx={{ marginBottom: 1 }}>
                <Recorder
                    onError={setRecorderError}
                    onRecordingComplete={(blob) => setRecordedBlob(blob)}
                />
                {recorderError && (
                    <p style={{ color: 'red', fontSize: 'small', margin: 0 }}>
                        Recording error: No audio detected.
                    </p>
                )}
            </Box> */
}

{
  /* Optional: Score or other info */
}
{
  /* <Box
                sx={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: "#1D6F17",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '22px'
                }}
            >
              
                --
            </Box> */
}

import React, { useState } from "react";

const Popup = ({ text, position, onClose }) => {


  const popupStyle = {
    position: "absolute",
    top: position.top + 10 + "px",
    left: position.left + "px",
    padding: "10px",
    background: "white",
    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
    borderRadius: "5px",
    zIndex: 9999,
    minWidth: "200px"
  };

  return (
    <div style={popupStyle}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <p style={{ margin: 0 }}>Selected: </p>
        <button >✖</button>
      </div>
      <div style={{ marginTop: "10px" }}>
        <button >🔊 Listen</button>
        <button >🎤 Record</button>
      </div>
      <p>Score: </p>
    </div>
  );
};

export default Popup;
