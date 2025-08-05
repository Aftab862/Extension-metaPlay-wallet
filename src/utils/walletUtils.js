import { HDNodeWallet, Mnemonic, Wallet } from "ethers";
// Optional fallback for utility

export const generateMnemonic = () => {
    const wallet = Wallet.createRandom();
    if (!wallet.mnemonic?.phrase) {
        throw new Error("Mnemonic generation failed.");
    }
    return wallet.mnemonic.phrase;
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
