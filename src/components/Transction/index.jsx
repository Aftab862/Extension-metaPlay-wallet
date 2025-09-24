import { Avatar, Box, Grid, Typography } from "@mui/material";
import React from "react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ReceiveModal from "./Receive";

const Transction = ({ userWalletAddress, wallet }) => {


    console.log("userWalletAddress transction : ", wallet)
    const [open, setOpen] = React.useState(false);

    function handleSendTrx() {
        console.log("Send clicked");
        // TODO: implement send modal later
    }

    function handleReciveTrx() {
        setOpen(true);
    }

    const actionItems = [
        { label: "Send", icon: <ArrowUpwardIcon />, onClick: handleSendTrx },
        { label: "Receive", icon: <ArrowDownwardIcon />, onClick: handleReciveTrx },
    ];


    return (
        <>
            <Box display="flex" flexDirection="column" alignItems="center" my={2}>
                <Typography variant="h5" color="text.secondary">
                    $0.00
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                    Total Balance
                </Typography>
            </Box>

            <Grid
                p={1}
                container
                spacing={2}
                textAlign="center"
                justifyContent="space-evenly"
            >
                {actionItems.map((item, index) => (
                    <Grid
                        key={index}
                        item
                        xs={3}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="space-evenly"
                        onClick={item.onClick} // ✅ fixed
                        sx={{ cursor: "pointer" }}
                    >
                        <Avatar sx={{ bgcolor: "#1976d2" }}>{item.icon}</Avatar>
                        <Typography>{item.label}</Typography>
                    </Grid>
                ))}
            </Grid>

            {/* Receive Modal */}
            {open &&
                <ReceiveModal
                    open={open}
                    onClose={() => setOpen(false)}
                    address={userWalletAddress}
                    wallet={wallet}

                />}
        </>
    );
};

export default Transction;
