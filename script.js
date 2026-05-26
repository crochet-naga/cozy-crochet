// Local application running state parameters
let shoppingCart = [];
let currentUserSession = null;

// --- CONFIGURATION: PASTE YOUR FREE SUPABASE CLOUD API LINKS HERE ---
const SUPABASE_URL = "https://ftpqjaqixafsnwgfvckd.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_UBB-hxBmMsJFGWgeGLOiTA_w5PpA1Gg";  

// --- CONFIGURATION: SET YOUR INDIAN MERCHANT PAYMENT HANDLES HERE ---
const MERCHANT_UPI_ID = "psydozo@okicici"; 
const MERCHANT_NAME = "kpsy";    

// --- TEXT-BASED LOCATION REGULATION MATRIX ---
const ALLOWED_COD_CITIES = ["mon", "kohima", "dimapur"];

// Initialize connection to your Supabase Client safely
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// RUN AT SYSTEM INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    const savedSession = localStorage.getItem("activeUserSession");
    if (savedSession) {
        currentUserSession = JSON.parse(savedSession);
        updateHeaderWithProfile();
        renderOrderHistory();
    }
    renderCart();
    setupAddressTextListener(); // Listens directly to structural keywords inside address box
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

// Scans user's address field input dynamically for specific words to unlock COD
function setupAddressTextListener() {
    const addressField = document.getElementById('cust-address');
    if(!addressField) return;

    addressField.addEventListener('input', function() {
        const textContent = this.value.toLowerCase();
        const codContainer = document.getElementById('cod-payment-container');
        const warningLabel = document.getElementById('cod-blocked-warning');
        const upiRadioBtn = document.getElementById('pay-method-upi');
        const codRadioBtn = document.getElementById('pay-method-cod');

        // Check if the text matches any permitted cities
        const matchesLocation = ALLOWED_COD_CITIES.some(city => textContent.includes(city));

        if (matchesLocation) {
            if (codContainer) codContainer.style.display = 'block';
            if (warningLabel) warningLabel.style.display = 'none';
        } else {
            if (codContainer) codContainer.style.display = 'none';
            if (warningLabel) warningLabel.style.display = 'block';
            if (codRadioBtn && codRadioBtn.checked) {
                upiRadioBtn.checked = true; // Roll back over safely to prepaid UPI
            }
        }
    });
}

// --- ORDER HISTORY MANAGEMENT ENGINE ---
function saveOrderToHistory(orderData) {
    if (!currentUserSession) return; // Ignore tracking metrics for guest checkouts
    
    const trackingKey = `orders_${currentUserSession.email}`;
    let previousOrders = [];
    
    try {
        const stored = localStorage.getItem(trackingKey);
        if (stored) previousOrders = JSON.parse(stored);
    } catch(e) { console.error(e); }

    previousOrders.unshift(orderData); // Place new orders at the top of the history list
    localStorage.setItem(trackingKey, JSON.stringify(previousOrders));
    renderOrderHistory();
}

function renderOrderHistory() {
    const sectionBlock = document.getElementById('customer-history-section');
    const logsContainer = document.getElementById('history-items-container');
    if (!sectionBlock || !logsContainer) return;

    if (!currentUserSession) {
        sectionBlock.style.display = 'none';
        return;
    }

    sectionBlock.style.display = 'block';
    const trackingKey = `orders_${currentUserSession.email}`;
    let userOrders = [];

    try {
        const stored = localStorage.getItem(trackingKey);
        if (stored) userOrders = JSON.parse(stored);
    } catch(e) { console.error(e); }

    if (userOrders.length === 0) {
        logsContainer.innerHTML = `<p style="color: #777; font-size: 0.9rem; margin: 0;">No purchase records registered yet under this profile account line.</p>`;
        return;
    }

    let logsHtml = '<div style="max-height: 250px; overflow-y: auto; padding-right: 5px;">';
    userOrders.forEach(order => {
        logsHtml += `
            <div style="background: #ffffff; padding: 10px; margin-bottom: 8px; border-radius: 4px; border-left: 4px solid #6b8e23; font-size: 0.85rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px;">
                    <span style="color: #2c3e50;">${order.id}</span>
                    <span style="color: #6b8e23;">${order.billTotal}</span>
                </div>
                <div style="color: #555; margin-bottom: 4px;"><strong>Items:</strong> ${order.items}</div>
                <div style="font-size: 0.75rem; color: #888;">Method: ${order.method} | Status: <span style="font-style: italic; color:#444;">${order.status}</span></div>
            </div>`;
    });
    logsHtml += '</div>';
    logsContainer.innerHTML = logsHtml;
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

async function handleUserSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value;

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: { data: { display_name: name } }
    });

    if (error) {
        alert(`Cloud Core Registry Alert: ${error.message}`);
    } else {
        alert(`👋 Signup processed for ${name}! Please login now with your selected credentials.`);
        closeAuthModal();
    }
}

async function handleUserLogin(event) {
    // Intercept default routing so authentication loops never fire twice or submit hidden carts
    event.preventDefault();
    event.stopImmediatePropagation(); 

    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert(`Access Verification Denied: ${error.message}`);
    } else {
        currentUserSession = {
            name: data.user.user_metadata.display_name,
            email: data.user.email
        };
        
        localStorage.setItem("activeUserSession", JSON.stringify(currentUserSession));
        updateHeaderWithProfile();
        renderOrderHistory(); // Load previous order database logs cleanly
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
    
    const historyPanel = document.getElementById('customer-history-section');
    if (historyPanel) historyPanel.style.display = 'none';
    
    alert("Logged out successfully.");
}

function updateHeaderWithProfile() {
    if (currentUserSession) {
        document.getElementById('user-profile-status').innerHTML = `
            <span> Namaste, <strong>${currentUserSession.name}</strong></span>
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
    // Structural security layer stopping multiple clicks or double submissions
    event.preventDefault();
    event.stopImmediatePropagation();

    const name = document.getElementById('cust-name').value.trim();
    const pincode = document.getElementById('cust-pincode').value.trim();
    const checkedMethodInput = document.querySelector('input[name="Payment_Method"]:checked');
    const paymentMethod = checkedMethodInput ? checkedMethodInput.value : "UPI";
    
    // Explicit Validation Check targeting the verified container element securely
    if (typeof hcaptcha !== 'undefined') {
        const hCaptchaResponse = hcaptcha.getResponse();
        if (!hCaptchaResponse) {
            alert("Please complete the security hCaptcha check before placing your order.");
            return;
        }
    }

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

    // Compile local structured recording values
    const structuredOrderRecord = {
        id: orderId,
        items: cartSummary,
        billTotal: `₹${rawPrice}`,
        method: paymentMethod,
        status: paymentMethod === "COD" ? "Pending Approval (COD)" : "Processed Securely"
    };

    if (paymentMethod === "COD") {
        document.getElementById('hidden-payment-status').value = "Pending (Cash on Delivery)";
        saveOrderToHistory(structuredOrderRecord);
        alert(`🎉 Order ${orderId} registered! Dispatching details to our shop workspace inbox...`);
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
            saveOrderToHistory(structuredOrderRecord);
            window.location.href = upiDeepLinkUrl;
            setTimeout(() => { this.submit(); clearCartSession(); }, 2500);
        } else {
            const simulatePaid = confirm(`💻 [DESKTOP TEST SANDBOX]\n\nSimulating mobile intent handoffs for ₹${rawPrice}.\n\nClick 'OK' to process checkout operations.`);
            if (simulatePaid) {
                document.getElementById('hidden-payment-status').value = "Paid (Simulated Desktop UPI Sandbox Core)";
                saveOrderToHistory(structuredOrderRecord);
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
    
    // Hide COD choice options cleanly for safety resets
    const codContainer = document.getElementById('cod-payment-container');
    const warningLabel = document.getElementById('cod-blocked-warning');
    if (codContainer) codContainer.style.display = 'none';
    if (warningLabel) warningLabel.style.display = 'block';

    // Safely flush hCaptcha checkbox widget state references
    if (typeof hcaptcha !== 'undefined') {
        const captchaWidget = document.getElementById('checkout-captcha');
        if (captchaWidget) {
            try {
                hcaptcha.reset(); 
            } catch(e) {
                const widgetId = captchaWidget.getAttribute('data-widget-id');
                if (widgetId !== null) hcaptcha.reset(widgetId);
            }
        }
    }
    
    renderCart();
    if(currentUserSession) updateHeaderWithProfile();
    switchPage('keychains');
}
