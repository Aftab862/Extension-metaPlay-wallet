// FILE: src/screens/WelcomeScreen.jsx
import React from "react";
import { Button, Typography, Stack, Container, Box } from "@mui/material";
import Logo from '../../public/icons/Logo.svg'

const WelcomeScreen = ({ onCreateWallet, onImportWallet }) => {
    return (
        <Container
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: 550

            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",

                }}
            >
                <img
                    src={Logo}
                    alt="centered logo"
                    style={{
                        width: "100px",
                        marginBottom: "24px"
                    }}
                />
            </Box>


            <Typography variant="h5" gutterBottom>
                Welcome to MetaPlay Wallet
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={3}>
                Get started by creating or importing your Seed
            </Typography>

            <Stack spacing={2} width="100%">
                <Button variant="contained" fullWidth sx={{ textTransform: "none" }} onClick={onCreateWallet}>
                    Create a New Wallet
                </Button>
                <Button variant="outlined" fullWidth sx={{ textTransform: "none" }} onClick={onImportWallet}>
                    Import Using Recovery Phrase
                </Button>
            </Stack>



            <Typography variant="body1" mt={3}>
                Need help? Contact
                <a target="_blank" href="https://metaplaywallet.org/support" style={{ textDecoration: "none", color: "#1976d2" }}>
                    &nbsp; Metaplay Support
                </a>
            </Typography>
        </Container>
    );
};

export default WelcomeScreen;
