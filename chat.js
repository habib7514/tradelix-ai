// ==========================================
// 💬 CHAT SYSTEM - Tradelix AI (English Only)
// ==========================================

// 1. Inject Styles
const chatStyles = `
<style>
    /* Floating Button */
    .floating-chat-btn {
        position: fixed;
        bottom: 85px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #F5C518, #E5B000);
        color: #000000;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        box-shadow: 0 4px 20px rgba(245, 197, 24, 0.5);
        cursor: pointer;
        z-index: 99999;
        transition: transform 0.2s;
        animation: floatPulse 2s infinite;
    }
    .floating-chat-btn:active { transform: scale(0.9); }
    @keyframes floatPulse {
        0% { box-shadow: 0 0 0 0 rgba(245, 197, 24, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(245, 197, 24, 0); }
        100% { box-shadow: 0 0 0 0 rgba(245, 197, 24, 0); }
    }
    
    /* Chat Panel */
    .chat-panel {
        position: fixed;
        bottom: 150px;
        right: 20px;
        width: calc(100% - 40px);
        max-width: 380px;
        height: 500px;
        max-height: 70vh;
        background: #141414;
        border: 1px solid #F5C518;
        border-radius: 16px;
        display: none;
        flex-direction: column;
        z-index: 100000;
        box-shadow: 0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(245, 197, 24, 0.2);
        overflow: hidden;
    }
    .chat-panel.active { display: flex; }
    
    .chat-header {
        background: #000000;
        padding: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #1F1F1F;
    }
    .chat-header h3 { color: #F5C518; font-size: 16px; margin: 0; display: flex; align-items: center; gap: 8px; }
    .chat-close { background: transparent; border: none; color: #999; font-size: 20px; cursor: pointer; }
    
    .chat-messages {
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: #0A0A0A;
    }
    
    .chat-msg {
        display: flex;
        flex-direction: column;
        max-width: 85%;
    }
    .chat-msg.mine { align-self: flex-end; }
    .chat-msg.theirs { align-self: flex-start; }
    
    .chat-msg-name { font-size: 10px; color: #888; margin-bottom: 3px; margin-left: 5px; }
    .chat-msg-bubble {
        padding: 10px 14px;
        border-radius: 14px;
        font-size: 13.5px;
        line-height: 1.4;
        word-wrap: break-word;
    }
    .chat-msg.mine .chat-msg-bubble {
        background: #F5C518;
        color: #000;
        border-bottom-right-radius: 4px;
    }
    .chat-msg.theirs .chat-msg-bubble {
        background: #1F1F1F;
        color: #FFF;
        border-bottom-left-radius: 4px;
        border: 1px solid #333;
    }
    .chat-msg.admin .chat-msg-bubble {
        background: #FF4757;
        color: #FFF;
        border: 1px solid #FF4757;
    }
    
    .chat-input-area {
        padding: 10px;
        background: #141414;
        border-top: 1px solid #1F1F1F;
        display: flex;
        gap: 8px;
    }
    .chat-input {
        flex: 1;
        background: #000;
        border: 1px solid #333;
        border-radius: 20px;
        padding: 10px 15px;
        color: #FFF;
        font-family: 'Tajawal', sans-serif;
        outline: none;
    }
    .chat-input:focus { border-color: #F5C518; }
    .chat-send {
        background: #F5C518;
        color: #000;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 16px;
    }
</style>
`;
document.head.insertAdjacentHTML('beforeend', chatStyles);

// 2. Create UI (HTML)
const chatHTML = `
<div id="floatingChatBtn" class="floating-chat-btn" onclick="toggleChatPanel()" style="display:none;">
    <i class="fa-solid fa-comments"></i>
</div>

<div id="chatPanel" class="chat-panel">
    <div class="chat-header">
        <h3><i class="fa-solid fa-comments"></i> Discussion Room</h3>
        <button class="chat-close" onclick="toggleChatPanel()"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div id="chatMessages" class="chat-messages">
        <p style="text-align:center; color:#666; font-size:12px; margin-top:20px;">Loading messages...</p>
    </div>
    <div class="chat-input-area">
        <input type="text" id="chatInput" class="chat-input" placeholder="Type a message..." onkeypress="handleChatEnter(event)">
        <button class="chat-send" onclick="sendChatMessage()"><i class="fa-solid fa-paper-plane"></i></button>
    </div>
</div>
`;
document.body.insertAdjacentHTML('beforeend', chatHTML);

// 3. Global Variables
let chatUnsubscribe = null;
let firebaseFSModules = null;
const ADMIN_EMAILS = ['mmatrix081@gmail.com']; // Add admin emails here

// 4. Open/Close Chat
function toggleChatPanel() {
    const panel = document.getElementById('chatPanel');
    if (panel.classList.contains('active')) {
        panel.classList.remove('active');
    } else {
        panel.classList.add('active');
        scrollToBottom();
        const badge = document.getElementById('chatBadge');
        if (badge) badge.style.display = 'none';
    }
}

function scrollToBottom() {
    const msgs = document.getElementById('chatMessages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

function handleChatEnter(e) {
    if (e.key === 'Enter') sendChatMessage();
}

// 5. Initialize Chat on Login
async function initChat() {
    const userStr = localStorage.getItem('tradelix_user');
    if (!userStr) return;
    
    const user = JSON.parse(userStr);
    if (!user.uid) return;

    document.getElementById('floatingChatBtn').style.display = 'flex';
    
    const oldBtn = document.getElementById('chatButtonContainer');
    if (oldBtn) oldBtn.style.display = 'block';

    if (!window.firebaseDB) {
        setTimeout(initChat, 1000);
        return;
    }

    firebaseFSModules = window.firebaseFS;
    const { collection, query, orderBy, onSnapshot } = firebaseFSModules;

    if (chatUnsubscribe) chatUnsubscribe();

    // Using exact collection name from your Firebase rules
    const q = query(collection(window.firebaseDB, 'tradelix_chat'), orderBy('createdAt', 'asc'));
    
    chatUnsubscribe = onSnapshot(q, (snapshot) => {
        const messagesDiv = document.getElementById('chatMessages');
        messagesDiv.innerHTML = '';
        
        if (snapshot.empty) {
            messagesDiv.innerHTML = '<p style="text-align:center; color:#666; font-size:12px; margin-top:20px;">No messages yet. Start the conversation!</p>';
            return;
        }

        snapshot.forEach((doc) => {
            const msg = doc.data();
            const isMine = msg.senderId === user.uid;
            const isAdmin = ADMIN_EMAILS.includes(msg.senderEmail);
            
            let msgClass = isMine ? 'mine' : 'theirs';
            if (isAdmin && !isMine) msgClass += ' admin';

            let timeStr = '';
            if (msg.createdAt) {
                const date = msg.createdAt.toDate();
                timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            const bubble = `
                <div class="chat-msg ${msgClass}">
                    ${!isMine ? `<div class="chat-msg-name">${isAdmin ? '👑 Admin' : msg.senderName} • ${timeStr}</div>` : ''}
                    <div class="chat-msg-bubble">${msg.text}</div>
                </div>
            `;
            messagesDiv.insertAdjacentHTML('beforeend', bubble);
        });
        
        scrollToBottom();
    }, (error) => {
        console.error("Chat error:", error);
        document.getElementById('chatMessages').innerHTML = '<p style="color:#FF4757; text-align:center; font-size:12px;">Error loading messages. Please check database rules.</p>';
    });
}

// 6. Send Message
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    const userStr = localStorage.getItem('tradelix_user');
    if (!userStr) return showToast('Please login first');
    const user = JSON.parse(userStr);

    if (!window.firebaseDB || !firebaseFSModules) return;
    const { collection, addDoc, serverTimestamp } = firebaseFSModules;

    input.value = '';

    try {
        await addDoc(collection(window.firebaseDB, 'tradelix_chat'), {
            text: text,
            senderId: user.uid,
            senderName: user.name || 'User',
            senderEmail: user.email || '',
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Send error:", error);
        showToast('Failed to send message');
        input.value = text;
    }
}

// 7. Monitor Login State
let lastChatUser = null;
setInterval(() => {
    const userStr = localStorage.getItem('tradelix_user');
    if (userStr) {
        const user = JSON.parse(userStr);
        if (user.uid && user.uid !== lastChatUser) {
            lastChatUser = user.uid;
            initChat();
        }
    } else {
        if (lastChatUser !== null) {
            lastChatUser = null;
            const floatBtn = document.getElementById('floatingChatBtn');
            if (floatBtn) floatBtn.style.display = 'none';
            const oldBtn = document.getElementById('chatButtonContainer');
            if (oldBtn) oldBtn.style.display = 'none';
            const panel = document.getElementById('chatPanel');
            if (panel) panel.classList.remove('active');
            if (chatUnsubscribe) { chatUnsubscribe(); chatUnsubscribe = null; }
        }
    }
}, 2000);

console.log('Chat module loaded successfully');