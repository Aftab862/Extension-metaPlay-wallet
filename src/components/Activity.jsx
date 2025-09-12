import { Avatar, Box, Typography } from '@mui/material'
import React from 'react'
import { mapColors } from '../utils/helper'

const Activity = ({ selectedChain }) => {
    return (
        <div> <Box p={1}>
            <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <Box display="flex" p={1} alignItems="center"  >
                    <Avatar sx={{ fontSize: "10px", bgcolor: mapColors(selectedChain?.nativeSymbol), mr: 1 }}>
                        {selectedChain?.nativeSymbol}
                    </Avatar>

                    <Typography fontWeight="bold">{selectedChain?.name.split(" ")[0]}</Typography>
                </Box>


            </Box>
            {console.log("selected chain : ", selectedChain?.tokens)}

        </Box>
        </div>
    )
}

export default Activity