// src/components/AccountSwitcher.jsx
import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const AccountSwitcher = ({ accounts, selectedIndex, onSelect }) => (
    <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Switch Account</InputLabel>
        <Select
            value={selectedIndex}
            onChange={(e) => onSelect(Number(e.target.value))}
            label="Switch Account"
        >
            {accounts ? accounts.map((wallet, idx) => (
                <MenuItem key={wallet.address} value={idx}>
                    Account {idx + 1} ({wallet.address.slice(0, 6)}...{wallet.address.slice(-4)})
                </MenuItem>
            ))
                :
                <p>Not Found</p>
            }
        </Select>
    </FormControl>
);

export default AccountSwitcher;
