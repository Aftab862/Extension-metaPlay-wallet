import { Avatar } from '@mui/material';
import React, { useState } from 'react';
// Assuming Avatar is imported from @mui/material

const TokenAvatar = ({ iconUrl, symbol, size = 30, ...props }) => {
    const [imgError, setImgError] = useState(false);

    // Reset error state if the URL changes (e.g., chain switch)
    React.useEffect(() => {
        setImgError(false);
    }, [iconUrl]);

    if (iconUrl && !imgError) {
        return (
            <Avatar
                src={iconUrl}
                alt={symbol}
                onError={() => setImgError(true)} // Crucial for fallback
                sx={{ width: size, height: size, mr: 1, p: 0 }}
                imgProps={{ style: { objectFit: 'contain' } }}
                {...props}
            />
        );
    }

    // Fallback: Use the symbol if the image URL is bad or load failed.
    return (
        <Avatar
            sx={{
                width: size,
                height: size,
                mr: 1,
                bgcolor: 'primary.main', // Use a consistent default color here or mapColors if available
                fontSize: size * 0.35,
            }}
            {...props}
        >
            {symbol?.slice(0, 2) || "?"}
        </Avatar>
    );
};

export default TokenAvatar;