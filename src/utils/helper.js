export function mapColors(symbol) {

    console.log("symbol :", symbol)
    switch (symbol) {
        case "EVM": // EVM
            return 'dodgerblue'; // blue
        case "SOL": // Solana
            return 'purple';
        case 3: // Bitcoin
            return '#f7931a'; // orange
        default:
            return '#9e9e9e'; // grey (fallback)
    }
}

export function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

