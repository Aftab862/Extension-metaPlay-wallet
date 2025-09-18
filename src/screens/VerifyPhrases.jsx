import React, { useState } from "react";
import {
    Button,
    Typography,
    Container,
    Box,
    TextField,
} from "@mui/material";
import Logo from "../../public/icons/Logo.svg";

const VerifyPhraseScreen = ({ mnemonic, onContinue }) => {
    const words = mnemonic.split(" ");

    // randomly pick 3 positions to blank out
    const missingIndexes = React.useMemo(() => {
        const allIndexes = Array.from({ length: words.length }, (_, i) => i);
        return allIndexes.sort(() => 0.5 - Math.random()).slice(0, 3);
    }, [mnemonic]);

    const [inputs, setInputs] = useState(
        words.map((w, i) => (missingIndexes.includes(i) ? "" : w))
    );

    const handleChange = (value, idx) => {
        const newInputs = [...inputs];
        newInputs[idx] = value.trim();
        setInputs(newInputs);
    };

    const isCorrect =
        inputs.join(" ") === words.join(" ") &&
        missingIndexes.every((idx) => inputs[idx] !== "");

    return (
        <Container
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <img src={Logo} alt="centered logo" style={{ width: "100px" }} />
            </Box>

            <Typography variant="h6" gutterBottom align="center">
                Verify Your Secret Phrase
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
                align="center"
            >
                Please fill in the missing words to confirm your secret phrase.
            </Typography>

            {/* Phrase grid */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 2,
                    mb: 3,
                    width: "100%",
                }}
            >
                {words.map((word, i) =>
                    missingIndexes.includes(i) ? (
                        <TextField
                            key={i}
                            placeholder={`Word ${i + 1}`}
                            value={inputs[i]}
                            onChange={(e) => handleChange(e.target.value, i)}
                            size="small"
                            fullWidth
                        />
                    ) : (
                        <TextField
                            key={i}
                            value={word}
                            disabled
                            sx={{ background: "lightgrey" }}
                            size="small"
                            fullWidth
                        />
                    )
                )}
            </Box>

            <Button
                variant="contained"
                fullWidth
                onClick={onContinue}
                disabled={!isCorrect}
                sx={{ textTransform: "none" }}
            >
                Continue
            </Button>
        </Container>
    );
};

export default VerifyPhraseScreen;
