import { HDNodeWallet, Mnemonic, Wallet } from "ethers";
// Optional fallback for utility

export const getOrCreateMnemonic = () => {
    let savedMnemonic = localStorage.getItem("metaplay-mnemonic");

    if (!savedMnemonic) {
        const wallet = Wallet.createRandom();

        if (!wallet.mnemonic || !wallet.mnemonic.phrase) {
            throw new Error("Mnemonic generation failed.");
        }

        savedMnemonic = wallet.mnemonic.phrase;
        localStorage.setItem("metaplay-mnemonic", savedMnemonic);
    }

    return savedMnemonic;
};


// ✅ Accept index as parameter
export function generateWalletFromMnemonic(mnemonicPhrase, index = 0) {
    const mnemonic = Mnemonic.fromPhrase(mnemonicPhrase);

    const path = `m/44'/60'/0'/0/${index}`;
    const hdWallet = HDNodeWallet.fromMnemonic(mnemonic, path);

    return {
        address: hdWallet.address,
        privateKey: hdWallet.privateKey,
    };
}
