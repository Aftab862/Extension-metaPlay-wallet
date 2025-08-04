import React from "react";

const Loader = ({ message = "Loading..." }) => {
    const loaderStyles = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "93vh",
        width: "100%",
        color: "#333",
        fontFamily: "Arial, sans-serif",
        fontSize: "1.2rem",
    };

    const spinnerStyles = {
        width: "50px",
        height: "50px",
        border: "6px solid #ccc",
        borderTop: "6px solid #007bff",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
    };

    const textStyles = {
        marginTop: "20px",
        opacity: 0.8,
    };

    return (
        <div style={loaderStyles}>
            <div style={{ ...spinnerStyles, animation: "spin 1s linear infinite" }} />
            <div style={textStyles}>{message}</div>

            <style>
                {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
            </style>
        </div>
    );
};

export default Loader;
