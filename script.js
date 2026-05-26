// Local application running state parameters
let shoppingCart = [];
let currentUserSession = null;

// --- CONFIGURATION: PASTE YOUR FREE SUPABASE CLOUD API LINKS HERE ---
const SUPABASE_URL = "https://ftpqjaqixafsnwgfvckd.supabase.co"; // Replace with your real Supabase project link URL
const SUPABASE_ANON_KEY = "sb_publishable_UBB-hxBmMsJFGWgeGLOiTA_w5PpA1Gg";  // Replace with your real Project Anon API string

// --- CONFIGURATION: SET YOUR INDIAN MERCHANT PAYMENT HANDLES HERE ---
const MERCHANT_UPI_ID = "psydozo@okcici"; 
const MERCHANT_NAME = "kpsy";   

// Fixed initialization to eliminate script variable library scope crash
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// RUN AT SYSTEM INITIALIZATION: Evaluate persistent account cookies inside active session caches
document.addEventListener("DOMContentLoaded", () => {
    const savedSession = localStorage.getItem("activeUserSession");
    if (savedSession) {
        currentUserSession = JSON.parse(savedSession);
        updateHeaderWithProfile();
    }
    renderCart();
});

// View Workspace Page Switching Engine Controller
function switchPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const navButtons = document.querySelectorAll('.nav-link');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(pageId).classList.add('active');
    
    if(window.event) {
        window.event.currentTarget.classList.add('active');
    }
}

// --- CLOUD INFRASTRUCTURE AUTHENTICATION LOGIC SUBSYSTEMS ---
function openAuthModal() {
    document.getElementById('auth-modal-overlay').style.display = 'flex';
    toggleAuthView('login');
}

function closeAuthModal() {
    document.getElementById('auth-modal-overlay').style.display = 'none';
}

function toggleAuthView(viewType) {
    if (viewType === 'login') {
        document.getElementById('login-form-view').style.display = 'block';
        document.getElementById('signup-form-view').style.display = 'none';
    } else {
        document.getElementById('login-form-view').style.display = 'none';
        document.getElementById('signup-form-view').style.display = 'block';
    }
}

// Subsystem Handler: Cloud Database Account Registration
async function handleUserSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value;

    // Secure async remote call to Supabase auth client
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { display_name: name } 
        }
    });

    if (error) {
        alert(`Cloud Core Registry Alert: ${error.message}`);
    } else {
        alert(`👋 Signup processed for ${name}! Please attempt logging in now with your selected credentials.`);
        closeAuthModal();
    }
}

// Subsystem Handler: Cloud Database Identity Verification
async function handleUserLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    // Secure async login validation processing loop 
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert(`Access Verification Denied: ${error.message}`);
    } else {
        // Build tracking memory properties
        currentUserSession = {
            name: data.user.user_metadata.display_name,
            email: data.user.email
        };
        
        localStorage.setItem("activeUserSession", JSON.stringify(currentUserSession));
        updateHeaderWithProfile();
        alert(`Welcome back, ${currentUserSession.name}!`);
        closeAuthModal();
    }
}

function handleUserLogout() {
    currentUserSession = null;
    localStorage.removeItem("activeUserSession");
    
    document.getElementById('user-profile-status').innerHTML = `
        <button class="auth-trigger-btn" onclick="openAuthModal()">👤 Login / Signup</button>
    `;
    document.getElementById('hidden-buyer-account').value = "Guest User";
    document.getElementById('cust-name').value = '';
    alert("Logged out successfully.");
}

function updateHeaderWithProfile() {
    if (currentUserSession) {
        document.getElementById('user-profile-status').innerHTML = `
            <span>🇮🇳 Namaste, <strong>${currentUserSession.name}</strong></span>
            <span class="logout-link" onclick="handleUserLogout()">Logout</span>
        `;
        document.getElementById('hidden-buyer-account').value = `${currentUserSession.name} (${currentUserSession.email})`;
        
        const nameField = document.getElementById('cust-name');
        if(nameField && !nameField.value) nameField.value = currentUserSession.name;
    }
}

// --- SECURE BASKET / CART CALCULATION LOGIC ENGINE ---
function addToCart(name, price) {
    const existingItem = shoppingCart.find(item => item.productName === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        shoppingCart.push({ productName: name, productPrice: price, quantity: 1 });
    }
    renderCart();
    alert(`🛒 ${name} added to cart!`);
}

function renderCart() {
    const listElement = document.getElementById('cart-items-list');
    const totalElement = document.getElementById('cart-total-price');
    const formSection = document.getElementById('checkout-form-section');
    
    if (shoppingCart.length === 0) {
        listElement.innerHTML = `Your cart is empty. Add some handmade items to get started!`;
        totalElement.innerText = `₹0`;
        formSection.style.display = 'none';
        return;
    }
    
    let htmlOutput = '<ul style="list-style: none; padding: 0;">';
    let totalCost = 0;
    
    shoppingCart.forEach((item, index) => {
        const itemTotal = item.productPrice * item.quantity;
        totalCost += itemTotal;
        htmlOutput += `
            <li style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; border-bottom: 1px solid #f0f0f0; padding-bottom: 0.5rem;">
                <div><strong>${item.productName}</strong> <span style="color:#777;">(x${item.quantity})</span></div>
                <div><span>₹${itemTotal}</span><button type="button" onclick="removeFromCart(${index})" style="background: none; border: none; color: #cc0000; margin-left: 10px; cursor: pointer; font-size: 0.85rem;">✕ Remove</button></div>
            </li>`;
    });
    
    htmlOutput += '</ul>';
    listElement.innerHTML = htmlOutput;
    totalElement.innerText = `₹${totalCost}`;
    formSection.style.display = 'block';
}

function removeFromCart(index) {
    shoppingCart.splice(index, 1);
    renderCart();
}

// --- SUBMIT COMPILATION & INDIAN UPI SYSTEM DEEP-LINKS ---
document.getElementById('ecom-order-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('cust-name').value.trim();
    const pincode = document.getElementById('cust-pincode').value.trim();
    const paymentMethod = document.querySelector('input[name="Payment_Method"]:checked').value;
    
    if (pincode.length !== 6 || isNaN(pincode)) {
        alert("Please enter a valid 6-digit Indian Pincode.");
        return;
    }

    const orderId = 'CRCH-IN-' + Math.floor(1000 + Math.random() * 9000);
    const rawPrice = document.getElementById('cart-total-price').innerText.replace('₹', '');
    let cartSummary = shoppingCart.map(item => `${item.productName} (x${item.quantity})`).join(', ');

    document.getElementById('hidden-order-id').value = orderId;
    document.getElementById('hidden-cart-data').value = cartSummary;
    document.getElementById('hidden-total-bill').value = `₹${rawPrice}`;

    if (paymentMethod === "COD") {
        document.getElementById('hidden-payment-status').value = "Pending (Cash on Delivery)";
        alert(`🎉 Order ${orderId} placed via COD! Transferring metadata metrics to your shop dashboard email inbox...`);
        this.submit(); 
        clearCartSession();
    } 
    else if (paymentMethod === "UPI") {
        const encodedName = encodeURIComponent(MERCHANT_NAME);
        const encodedNote = encodeURIComponent(`Order ${orderId}`);
        const upiDeepLinkUrl = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodedName}&am=${rawPrice}&cu=INR&tn=${encodedNote}`;
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isMobile) {
            document.getElementById('hidden-payment-status').value = "Paid/Initiated via Mobile UPI Application Link";
            window.location.href = upiDeepLinkUrl;
            setTimeout(() => { this.submit(); clearCartSession(); }, 1000);
        } else {
            const simulatePaid = confirm(`💻 [DESKTOP TEST SANDBOX]\n\nOn mobile web layers, this triggers installed financial transaction apps automatically configured for ₹${rawPrice}.\n\nClick 'OK' to simulate a successful client bank account payment capture trace layout.`);
            if (simulatePaid) {
                document.getElementById('hidden-payment-status').value = "Paid (Simulated Desktop UPI Sandbox Core)";
                alert(`✅ Test Payment Approved!\nOrder ID: ${orderId}\n\nShipping compilation logs directly to your dashboard inbox variables...`);
                this.submit();
                clearCartSession();
            } else {
                alert("❌ Checkout Aborted: Sandbox check rejected.");
            }
        }
    }
});

function clearCartSession() {
    shoppingCart = [];
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-address').value = '';
    document.getElementById('cust-pincode').value = '';
    renderCart();
    if(currentUserSession) updateHeaderWithProfile();
    switchPage('keychains');
}