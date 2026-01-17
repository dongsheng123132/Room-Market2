import { ethers } from 'ethers';
import { MONAD_TESTNET_CHAIN_ID, MONAD_TESTNET_RPC } from '../constants';

// Check if address is a demo address
export const isDemoAddress = (addr: string) => addr.toLowerCase().includes("demo");

export const connectWallet = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  const eth = (window as any).ethereum;

  if (!eth) {
    alert("请先安装 MetaMask 或 Rabby 钱包，然后刷新页面重新连接。\n当前将使用演示模式继续体验。");
    return "0x71C...Demo";
  }

  try {
    const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
    if (!accounts || accounts.length === 0) {
      alert("未获取到账户，请在钱包中解锁后重试。");
      return null;
    }

    const account = accounts[0];

    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + MONAD_TESTNET_CHAIN_ID.toString(16) }]
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x" + MONAD_TESTNET_CHAIN_ID.toString(16),
            chainName: "Monad Testnet",
            rpcUrls: [MONAD_TESTNET_RPC],
            nativeCurrency: {
              name: "MON",
              symbol: "MON",
              decimals: 18
            },
            blockExplorerUrls: ["https://testnet.monadexplorer.com"]
          }]
        });
      } else {
        console.error("Switch chain failed", switchError);
      }
    }

    return account;
  } catch (error) {
    console.error("Connection failed", error);
    alert("连接钱包失败，请确认已在浏览器中解锁钱包并允许站点访问。");
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
