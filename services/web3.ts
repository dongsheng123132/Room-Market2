import { ethers } from 'ethers';
import { MONAD_TESTNET_CHAIN_ID, MONAD_TESTNET_RPC } from '../constants';

// Check if address is a demo address
export const isDemoAddress = (addr: string) => addr.toLowerCase().includes("demo");

// Basic Web3 wrapper
export const connectWallet = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    alert("请安装 Rabby 或 MetaMask 钱包以体验完整功能！\n(暂以演示模式继续)");
    return "0x71C...Demo";
  }

  const provider = new ethers.BrowserProvider((window as any).ethereum);
  
  try {
    const accounts = await provider.send("eth_requestAccounts", []);
    
    // Enforce Monad Testnet
    try {
        await provider.send("wallet_switchEthereumChain", [{ chainId: "0x" + MONAD_TESTNET_CHAIN_ID.toString(16) }]);
    } catch (switchError: any) {
        if (switchError.code === 4902) {
            await provider.send("wallet_addEthereumChain", [{
                chainId: "0x" + MONAD_TESTNET_CHAIN_ID.toString(16),
                chainName: "Monad Testnet",
                rpcUrls: [MONAD_TESTNET_RPC],
                nativeCurrency: {
                    name: "MON",
                    symbol: "MON",
                    decimals: 18
                },
                blockExplorerUrls: ["https://testnet.monadexplorer.com"]
            }]);
        }
    }
    
    return accounts[0];
  } catch (error) {
    console.error("Connection failed", error);
    return null;
  }
};

export const sendTransaction = async (to: string, amount: number): Promise<boolean> => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return false;
    
    try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        
        // Validate Address
        if (!ethers.isAddress(to)) {
            console.warn("Invalid address, burning to null address for demo");
            to = "0x000000000000000000000000000000000000dEaD";
        }

        const tx = await signer.sendTransaction({
            to: to,
            value: ethers.parseEther(amount.toString())
        });

        console.log("Transaction Sent:", tx.hash);
        // In a real hackathon app, we might wait for 1 confirmation
        // await tx.wait(); 
        return true;
    } catch (error) {
        console.error("Payment failed", error);
        return false;
    }
};

export const shortenAddress = (addr: string) => {
    if (isDemoAddress(addr)) return "演示用户";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};