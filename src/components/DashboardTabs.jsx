import React, { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";

// A reusable TabPanel component
function TabPanel({ children, value, index }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

// Accessibility helper
function a11yProps(index) {
    return {
        id: `tab-${index}`,
        "aria-controls": `tabpanel-${index}`,
    };
}

// Example placeholder components
const Tokens = () => <div>Your Tokens Component</div>;
const Activity = () => <div>Your Activity Component</div>;

export default function DashboardTabs() {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (_, newValue) => setActiveTab(newValue);

    // Define all your tabs here
    const tabs = [
        { label: "Tokens", content: <Tokens /> },
        { label: "Activity", content: <Activity /> },
    ];

    return (
        <Box sx={{ width: "100%" }}>
            {/* Tab Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    aria-label="Dashboard Tabs"
                    variant="fullWidth"
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
