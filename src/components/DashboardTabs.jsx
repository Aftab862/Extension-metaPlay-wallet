import React, { useState } from "react";
import { Box, Tab, Tabs, } from "@mui/material";
import TokensTab from "./TokensTab";
import Activity from "./Activity";

function TabPanel({ children, value, index }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
        >
            {value === index && <Box >{children}</Box>}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `tab-${index}`,
        "aria-controls": `tabpanel-${index}`,
    };
}


export default function DashboardTabs({ selectedChain, setAllChains, referesh, setReferesh, userWalletAddress }) {


    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (_, newValue) => setActiveTab(newValue);

    const tabs = [
        {
            label: "Tokens", content: <TokensTab selectedChain={selectedChain} setAllChains={setAllChains}
                referesh={referesh}
                setReferesh={setReferesh}
                userWalletAddress={userWalletAddress}
            />
        },
        { label: "Activity", content: <Activity selectedChain={selectedChain} /> },
    ];

    return (
        <Box mt={3} sx={{ width: "100%" }}>
            {/* Tab Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>

                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    aria-label="Dashboard Tabs"
                    variant="fullWidth"
                    sx={{ mx: 2 }}
                >
                    {tabs.map((tab, index) => (
                        <Tab sx={{ textTransform: "none" }} key={index} label={tab.label} {...a11yProps(index)} />
                    ))}
                </Tabs>
            </Box>

            {/* Tab Panels */}
            {tabs.map((tab, index) => (
                <TabPanel key={index} value={activeTab} index={index}>
                    {tab.content}
                </TabPanel>
            ))}
        </Box>
    );
}
