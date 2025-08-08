// src/components/AccountSwitcher.jsx
import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const AccountSwitcher = ({ accounts = [], selectedIndex = 0, onSelect }) => (
    <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel id="account-switcher-label">Switch Account</InputLabel>
        <Select
            labelId="account-switcher-label"
            value={selectedIndex}
            onChange={(e) => onSelect(Number(e.target.value))}
            label="Switch Account"
        >
            {accounts.length > 0 ? (
                accounts.map((wallet, idx) => {
                    const evm = wallet.chains.find((c) => c.type === "evm");
                    const shortAddress = evm?.address
                        ? `${evm.address.slice(0, 6)}...${evm.address.slice(-4)}`
                        : "No EVM";

                    return (
                        <MenuItem key={idx} value={idx}>
                            Account {idx + 1} ({shortAddress})
                        </MenuItem>
                    );
                })
            ) : (
                <MenuItem disabled>No Accounts</MenuItem>
            )}
        </Select>
    </FormControl>
);

export default AccountSwitcher;
