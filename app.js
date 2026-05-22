// ==========================================================================
// MoEatzy - Application Controller (SPA, AI Scan, & Recipe Rescue Integration)
// ==========================================================================

// Application State
let currentTab = 'inventory';
let activeFilter = 'dday'; // 'dday' | 'category' | 'location'
let isAlreadyScanned = false; // Scan lock flag
let activeRescueRecipe = null; // Storing active recipe for subtraction
let tempScanResults = []; // Temporary storage for OCR scanning before final merge

// Premium User Subscription State (Demo bypass)
let isPremiumUser = localStorage.getItem('moeatzy_is_premium') === 'true';

// AI Generator State
let isAiGenerating = false;

// User Diet & Allergy Preferences State
let userPreferencesState = {
    householdSize: '1인 가구', // '1인 가구' | '2인 가구' | '3인 이상'
    dietType: '일반식', // '일반식' | '비건' | '락토-오보' | '키토/저탄고지' | '저당/다이어트' | '글루텐프리'
    spiciness: '보통', // '아주순한맛' | '순한맛' | '보통' | '매운맛'
    lactoseIntolerant: false, // 유당불내증 여부
    allergies: {
        nuts: false, // 견과류
        meat: false, // 육류
        veggies: false, // 채소류
        other: false // 기타
    },
    allergyVeggiesInput: '', // 채소류 알레르기 주관식 입력 (예: "오이, 가지")
    allergyOtherInput: '' // 기타 알레르기 주관식 입력
};

// Draft preferences state during active editing (Form-like submission)
let tempPreferencesState = null;

// Refrigerator Teacher selected ingredients tracking
let teacherSelectedIngredients = [];
let attemptedThirdSelection = false;

const freshnessStorageGuideDb = {
    "대파": {
        emoji: "🥬",
        tips: "송송 썬 파는 밀폐용기 바닥에 키친타월을 깔고 보관하면 수분이 흡수되어 오래 보관할 수 있습니다. 뿌리가 붙은 대파는 세워서 보관하세요.",
        effect: "D-day +5일 연장 효과"
    },
    "계란": {
        emoji: "🥚",
        tips: "계란은 물로 씻지 않고 뾰족한 곳이 아래로 가게 꽂아 보관하세요. 냉장고 문 쪽 보다는 온도가 일정한 안쪽에 두는 것이 신선함 유지에 좋습니다.",
        effect: "D-day +7일 연장 효과"
    },
    "양파": {
        emoji: "🧅",
        tips: "껍질을 벗기지 않은 양파는 통풍이 잘되는 망에 넣어 서늘한 상온에 두고, 깐양파는 수분을 제거한 뒤 랩으로 꼼꼼하게 낱개 포장해 냉장실에 넣으세요.",
        effect: "D-day +10일 연장 효과"
    },
    "두부": {
        emoji: "🧈",
        tips: "남은 두부는 밀폐용기에 담아 두부가 완전히 잠기도록 깨끗한 수돗물이나 생수를 붓고 소금을 한 꼬집 뿌려 냉장 보관하면 3~4일 더 보관할 수 있습니다.",
        effect: "D-day +4일 연장 효과"
    },
    "비엔나 소세지": {
        emoji: "🌭",
        tips: "칼집을 내어 뜨거운 물에 가볍게 데친 뒤 물기를 빼고 밀폐용기에 담아 냉장 보관하거나, 오래 두고 드실 경우 지퍼백에 넓게 펴서 냉동하세요.",
        effect: "D-day +6일 연장 효과"
    },
    "애호박": {
        emoji: "🥒",
        tips: "물기를 완전히 말린 후 키친타월이나 랩으로 감싸 냉장실 채소칸에 줄기 쪽이 위를 향하도록 세워 두시면 무름 현상을 방지할 수 있습니다.",
        effect: "D-day +5일 연장 효과"
    },
    "김치": {
        emoji: "🌶️",
        tips: "공기 노출을 차단하는 것이 가장 중요합니다. 김치가 국물 속에 완전히 잠기게 누름독으로 누르거나 위생 봉지를 덮어 냉장 온도를 0~2℃로 유지하세요.",
        effect: "D-day +30일 연장 효과"
    },
    "새송이버섯": {
        emoji: "🍄",
        tips: "씻지 않은 채로 키친타월에 하나씩 말아서 밀폐용기나 위생팩에 담아 냉장실 채소칸에 넣어 두시면 습기 없이 뽀송하게 오래 유지됩니다.",
        effect: "D-day +5일 연장 효과"
    },
    "우유": {
        emoji: "🥛",
        tips: "개봉한 우유는 집게나 집게 클립으로 공기 흡입을 막고 냉장고 문 쪽 칸 대신 온도 변화가 거의 없는 선반 중간이나 가장 안쪽에 보관하는 것이 현명합니다.",
        effect: "D-day +3일 연장 효과"
    },
    "베이컨": {
        emoji: "🥓",
        tips: "개봉한 베이컨은 한 장씩 종이호일 위에 펼쳐서 샌드위치처럼 겹겹이 쌓아 올린 뒤 지퍼백에 밀폐해 냉동해 두면 한 장씩 꺼내 쓰기 좋습니다.",
        effect: "D-day +7일 연장 효과"
    }
};

// Load preferences from localStorage if exists
try {
    const savedPrefs = localStorage.getItem('moeatzy_user_preferences');
    if (savedPrefs) {
        userPreferencesState = JSON.parse(savedPrefs);
    }
} catch (e) {
    console.error("Failed to parse user preferences from localStorage:", e);
}

function saveUserPreferences() {
    localStorage.setItem('moeatzy_user_preferences', JSON.stringify(userPreferencesState));
}

/**
 * Asynchronously fetch local environment credentials from Environment Variables.md if available
 */
async function loadApiKeyFromEnvironmentFile() {
    try {
        const res = await fetch('Environment%20Variables.md');
        if (res.ok) {
            let text = await res.text();
            // Strip markdown backslash escapes (e.g. \_ → _)
            text = text.replace(/\\_/g, '_');
            const match = text.match(/GOOGLE_API_KEY\s*=\s*["']?([^"'\s\r\n]+)["']?/);
            if (match && match[1]) {
                const apiKey = match[1].trim();
                window.GOOGLE_API_KEY = apiKey;
                localStorage.setItem('moeatzy_google_api_key', apiKey);
                console.log("[MoEatzy AI] Successfully loaded GOOGLE_API_KEY from Environment Variables.md");
            }
        }
    } catch (e) {
        console.warn("[MoEatzy AI] Could not auto-load Environment Variables.md:", e);
    }
}

/**
 * Retrieve current active GOOGLE_API_KEY from environment variables (window object)
 * or local storage fallback.
 */
function getGoogleApiKey() {
    return window.GOOGLE_API_KEY || localStorage.getItem('moeatzy_google_api_key') || '';
}

/**
 * Retrieve Gemma 4 model priority 1 designation variable
 */
function getGemmaModel1() {
    let model = window.GEMMA_MODEL_PRIORITY_1 || localStorage.getItem('moeatzy_gemma_model_1') || 'gemma-4-31b-it';
    if (!model || model.includes('gemini') || model === 'gemma-4-31b') {
        model = 'gemma-4-31b-it';
    }
    return model;
}

/**
 * Retrieve Gemma 4 model priority 2 designation variable
 */
function getGemmaModel2() {
    let model = window.GEMMA_MODEL_PRIORITY_2 || localStorage.getItem('moeatzy_gemma_model_2') || 'gemma-4-26b-a4b-it';
    if (!model || model.includes('gemini') || model === 'gemma-4-31b' || model === 'gemma-4-26b' || model === 'gemma-4-31b-it') {
        model = 'gemma-4-26b-a4b-it';
    }
    return model;
}

/**
 * Retrieve the active AI engine model text description
 */
function getGemmaModel() {
    return `${getGemmaModel1()} (1순위) | ${getGemmaModel2()} (2순위)`;
}




/**
 * Switch between bottom navigation tabs
 * @param {string} tabName 
 */
function switchTab(tabName) {
    currentTab = tabName;
    console.log(`[MoEatzy] Switched to tab: ${tabName}`);
    
    // 1. Control Header Scan Button & Floating FAB Visibility based on Tab
    const scanBtn = document.getElementById('header-scan-btn');
    if (scanBtn) {
        if (tabName === 'inventory') {
            scanBtn.style.display = 'flex';
        } else {
            scanBtn.style.display = 'none';
        }
    }

    const floatScanBtn = document.getElementById('floating-scan-btn');
    if (floatScanBtn) {
        if (tabName === 'inventory') {
            floatScanBtn.classList.add('visible');
        } else {
            floatScanBtn.classList.remove('visible');
        }
    }
    
    // 2. Update Tab Bar UI State
    const tabs = document.querySelectorAll('.tab-item');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTabButton = document.getElementById(`tab-${tabName}`);
    if (activeTabButton) {
        activeTabButton.classList.add('active');
    }
    
    // 3. Render Page Content
    const contentArea = document.getElementById('content');
    contentArea.innerHTML = ''; // Clear previous content
    
    switch (tabName) {
        case 'inventory':
            renderInventory(contentArea);
            break;
        case 'preferences':
            renderPreferencesPage(contentArea);
            break;
        case 'recipe':
            renderRecipePage(contentArea);
            break;
        case 'shopping':
            renderShoppingPage(contentArea);
            break;
        case 'my':
            renderMyPage(contentArea);
            break;
        default:
            renderInventory(contentArea);
    }
}

/**
 * Render the main Inventory (Refrigerator) tab
 * @param {HTMLElement} container 
 */
function renderInventory(container) {
    // 1. Header Information
    const headerHTML = `
        <h2 class="page-title">냉장고 인벤토리</h2>
        <p class="page-subtitle">보유 중인 식재료가 신선도 기준(D-day)으로 정렬되어 있습니다.</p>
    `;
    
    // 2. Filter Bar
    const filterBarHTML = `
        <div class="filter-bar">
            <button class="filter-btn ${activeFilter === 'dday' ? 'active' : ''}" onclick="changeFilter('dday')">신선도순</button>
            <button class="filter-btn ${activeFilter === 'category' ? 'active' : ''}" onclick="changeFilter('category')">종류별</button>
            <button class="filter-btn ${activeFilter === 'location' ? 'active' : ''}" onclick="changeFilter('location')">위치별</button>
        </div>
    `;
    
    // 3. Ingredient List Container
    const listHTML = `<div class="inventory-list" id="inventory-list"></div>`;
    
    container.innerHTML = headerHTML + filterBarHTML + listHTML;
    
    // 4. Sort and Render items
    renderSortedIngredients();
}

/**
 * Handle filtering/sorting buttons on the Inventory tab
 * @param {string} filterName 
 */
function changeFilter(filterName) {
    activeFilter = filterName;
    
    // Update active class on filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText === (filterName === 'dday' ? '신선도순' : filterName === 'category' ? '종류별' : '위치별')) {
            btn.classList.add('active');
        }
    });
    
    // Re-render items
    renderSortedIngredients();
}

// Emoji maps for grouped sections in Refrigerator Inventory
const categoryEmojis = {
    "채소": "🥬",
    "알류/유제품": "🥚",
    "두부/콩류": "🧈",
    "육류": "🥩",
    "반찬/양념": "🌶️",
    "수산물": "🐟",
    "과일": "🍎",
    "기타": "📦"
};

const locationEmojis = {
    "채소칸": "🧺",
    "냉장실": "❄️",
    "냉동실": "🧊",
    "기타": "📍"
};

/**
 * Sorts and draws ingredients based on the selected filter.
 * Category and Location filters render nested compartment boxes, while Freshness remains flat.
 */
function renderSortedIngredients() {
    const listContainer = document.getElementById('inventory-list');
    if (!listContainer) return;
    
    // Clone original data to avoid mutation side effects
    let itemsToRender = [...ingredients];
    
    listContainer.innerHTML = ''; // Clear prior items
    
    if (itemsToRender.length === 0) {
        listContainer.innerHTML = `
            <div class="placeholder-container">
                <span class="placeholder-icon">📭</span>
                <h3 class="placeholder-title">냉장고가 비어있습니다</h3>
                <p class="placeholder-desc">우측 하단의 스마트 스캔 기능을 이용해 식재료를 채워보세요!</p>
            </div>
        `;
        return;
    }

    // Render Urgent warning panel (D-3 or less)
    const urgentItems = ingredients.filter(item => item.dday <= 3).sort((a, b) => a.dday - b.dday);
    if (urgentItems.length > 0) {
        let urgentHTML = `
            <div class="urgent-warning-container">
                <div class="urgent-header">
                    <span class="urgent-icon">🚨</span>
                    <span class="urgent-title">빨리 먹어야 해요!</span>
                    <span class="urgent-count">${urgentItems.length}개의 재료 유통기한 임박</span>
                </div>
                <div class="urgent-scroll-wrapper">
        `;
        urgentItems.forEach(item => {
            let badgeClass = 'badge-danger';
            if (item.dday > 1 && item.dday <= 3) {
                badgeClass = 'badge-warn';
            }
            urgentHTML += `
                <div class="urgent-item-card">
                    <span class="urgent-item-emoji">${item.emoji}</span>
                    <span class="urgent-item-name">${item.name}</span>
                    <span class="urgent-item-badge dday-badge ${badgeClass}">D-${item.dday}</span>
                </div>
            `;
        });
        urgentHTML += `
                </div>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', urgentHTML);
    }
    
    if (activeFilter === 'dday') {
        // Flat chronological list sorted by freshness
        itemsToRender.sort((a, b) => a.dday - b.dday);
        
        itemsToRender.forEach((item, index) => {
            let badgeClass = 'badge-safe';
            if (item.dday <= 1) {
                badgeClass = 'badge-danger';
            } else if (item.dday <= 3) {
                badgeClass = 'badge-warn';
            }
            
            const cardHTML = `
                <div class="ingredient-card" style="animation-delay: ${index * 0.08}s">
                    <div class="card-left">
                        <div class="ingredient-icon-container">
                            ${item.emoji}
                        </div>
                        <div class="ingredient-info">
                            <span class="ingredient-name">${item.name}</span>
                            <span class="ingredient-location">${item.category} • ${item.location}</span>
                        </div>
                    </div>
                    <div class="card-right">
                        <span class="dday-badge ${badgeClass}">D-${item.dday}</span>
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
    } else if (activeFilter === 'category') {
        // Group by category into visual list boxes
        const groups = {};
        itemsToRender.forEach(item => {
            if (!groups[item.category]) {
                groups[item.category] = [];
            }
            groups[item.category].push(item);
        });
        
        // Sort categories alphabetically
        const groupKeys = Object.keys(groups).sort();
        
        groupKeys.forEach((groupName, gIdx) => {
            const groupItems = groups[groupName];
            // Sort items inside this group by urgency (D-day)
            groupItems.sort((a, b) => a.dday - b.dday);
            const groupEmoji = categoryEmojis[groupName] || "📦";
            
            let groupHTML = `
                <div class="fridge-group-box" style="animation-delay: ${gIdx * 0.1}s">
                    <div class="fridge-group-header">
                        <span class="fridge-group-title">${groupEmoji} ${groupName}</span>
                        <span class="fridge-group-count">${groupItems.length}개</span>
                    </div>
                    <div class="fridge-group-content">
            `;
            
            groupItems.forEach(item => {
                let badgeClass = 'badge-safe';
                if (item.dday <= 1) {
                    badgeClass = 'badge-danger';
                } else if (item.dday <= 3) {
                    badgeClass = 'badge-warn';
                }
                
                groupHTML += `
                    <div class="ingredient-card">
                        <div class="card-left">
                            <div class="ingredient-icon-container">
                                ${item.emoji}
                            </div>
                            <div class="ingredient-info">
                                <span class="ingredient-name">${item.name}</span>
                                <span class="ingredient-location">위치: ${item.location}</span>
                            </div>
                        </div>
                        <div class="card-right">
                            <span class="dday-badge ${badgeClass}">D-${item.dday}</span>
                        </div>
                    </div>
                `;
            });
            
            groupHTML += `
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', groupHTML);
        });
    } else if (activeFilter === 'location') {
        // Group by compartment location into visual list boxes
        const groups = {};
        itemsToRender.forEach(item => {
            if (!groups[item.location]) {
                groups[item.location] = [];
            }
            groups[item.location].push(item);
        });
        
        // Sort locations alphabetically
        const groupKeys = Object.keys(groups).sort();
        
        groupKeys.forEach((groupName, gIdx) => {
            const groupItems = groups[groupName];
            // Sort items inside this group by urgency (D-day)
            groupItems.sort((a, b) => a.dday - b.dday);
            const groupEmoji = locationEmojis[groupName] || "📍";
            
            let groupHTML = `
                <div class="fridge-group-box" style="animation-delay: ${gIdx * 0.1}s">
                    <div class="fridge-group-header">
                        <span class="fridge-group-title">${groupEmoji} ${groupName}</span>
                        <span class="fridge-group-count">${groupItems.length}개</span>
                    </div>
                    <div class="fridge-group-content">
            `;
            
            groupItems.forEach(item => {
                let badgeClass = 'badge-safe';
                if (item.dday <= 1) {
                    badgeClass = 'badge-danger';
                } else if (item.dday <= 3) {
                    badgeClass = 'badge-warn';
                }
                
                groupHTML += `
                    <div class="ingredient-card">
                        <div class="card-left">
                            <div class="ingredient-icon-container">
                                ${item.emoji}
                            </div>
                            <div class="ingredient-info">
                                <span class="ingredient-name">${item.name}</span>
                                <span class="ingredient-location">종류: ${item.category}</span>
                            </div>
                        </div>
                        <div class="card-right">
                            <span class="dday-badge ${badgeClass}">D-${item.dday}</span>
                        </div>
                    </div>
                `;
            });
            
            groupHTML += `
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', groupHTML);
        });
    }
}

/**
 * Render gorgeous glassmorphic placeholders for subsequent phases
 * @param {HTMLElement} container 
 * @param {string} tabType 
 */
function renderPlaceholder(container, tabType) {
    let title = '';
    let subtitle = '';
    let icon = '';
    let placeholderTitle = '';
    let placeholderDesc = '';
    
    switch (tabType) {
        case 'shopping':
            title = '신선 백과 & 리포트';
            subtitle = '보관 비법을 통해 식재료의 신선함을 유지하고 절약 효과를 확인하세요.';
            icon = '📉';
            placeholderTitle = '절약 대시보드 및 잠금 해제 준비 중';
            placeholderDesc = '사용자가 냉장고를 비우며 절약한 비용의 누적 가치를 그래프로 체감하고, 유료 바잉 가이드 잠금 해제 버튼을 통한 지불 의사 검증 실험 장치가 완성됩니다.';
            break;
        case 'my':
            title = '마이 모잇지';
            subtitle = '개인 맞춤형 정보 입력 및 지표 분석을 다룹니다.';
            icon = '👤';
            placeholderTitle = '내 프로필 연동 대기 중';
            placeholderDesc = '1인 가구 세대 정보 관리, 선호 식습관 알러지 필터링, 그리고 그동안 구출에 성공한 요리 역대 기록들을 세련되게 모아보는 페이지가 업데이트될 예정입니다.';
            break;
    }
    
    container.innerHTML = `
        <h2 class="page-title">${title}</h2>
        <p class="page-subtitle">${subtitle}</p>
        <div class="placeholder-container">
            <span class="placeholder-icon">${icon}</span>
            <h3 class="placeholder-title">${placeholderTitle}</h3>
            <p class="placeholder-desc">${placeholderDesc}</p>
        </div>
    `;
}

// ==========================================================================
// Phase 2: AI Refrigerator Smart Scan Logic
// ==========================================================================

/**
 * Create Scan Modal, Toast, and Reward Overlay Elements dynamically
 */
function initializeDynamicUI() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    // 1. Scan Modal Overlay
    const modalHTML = `
        <div id="scan-modal-overlay" class="scan-modal-overlay">
            <div class="scan-modal-card">
                <button class="modal-close-btn" onclick="closeScanModal()">✕</button>
                
                <!-- Initial Option View -->
                <div id="modal-initial-view">
                    <h3 class="modal-title">📸 AI 스마트 스캔</h3>
                    <p class="modal-desc">영수증을 스캔하거나 냉장고 사진을 업로드하여 식재료를 자동으로 빠르게 채워보세요.</p>
                    <div class="scan-options-container">
                        <button class="scan-option-btn" onclick="startTechnicalScan('receipt')">
                            <span class="emoji-icon">🧾</span>
                            <div class="scan-option-info">
                                <span class="scan-option-title">영수증 업로드 스캔</span>
                                <span class="scan-option-desc">장보기 종이 영수증 글자 분석 등록</span>
                            </div>
                        </button>
                        <button class="scan-option-btn" onclick="startTechnicalScan('camera')">
                            <span class="emoji-icon">🧊</span>
                            <div class="scan-option-info">
                                <span class="scan-option-title">냉장고 촬영 스캔</span>
                                <span class="scan-option-desc">카메라 사진으로 냉장고 내부 식재료 판별</span>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Technical Scanning Loading View -->
                <div id="modal-loading-view" class="scan-loading-area">
                    <h3 class="modal-title">👁️ AI 실시간 분석</h3>
                    <p class="modal-desc">초경량 AI Vision 모델이 이미지를 분석 중입니다.</p>
                    <div class="scanner-viewfinder">
                        <div class="scanner-laser-line"></div>
                        <div id="scanner-viewfinder-icon" class="scanner-viewfinder-graphic">🧾</div>
                    </div>
                    <span class="scan-loading-label" id="scan-loading-label">이미지 판별 개시...</span>
                    <div class="progress-track">
                        <div class="progress-fill" id="scanner-progress-fill"></div>
                    </div>
                    <span class="progress-pct" id="scanner-progress-pct">0%</span>
                </div>

                <!-- OCR Verification & Edit View -->
                <div id="modal-verification-view" class="scan-verification-area" style="display: none;">
                    <h3 class="modal-title">🧐 AI 인식 결과 검토</h3>
                    <p class="modal-desc">AI가 분석해낸 식재료 목록입니다. 잘못 인식된 품목이나 유통기한(D-Day)을 자유롭게 수정해 보세요.</p>
                    
                    <div id="verif-items-list" class="verif-items-list">
                        <!-- Dynamically filled with input rows -->
                    </div>
                    
                    <div class="verif-actions-container">
                        <button class="btn-verif-add" onclick="addTempItem()">➕ 재료 추가</button>
                        <button class="btn-verif-save" onclick="finalizeScanRegistration()">냉장고에 최종 저장</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    appEl.insertAdjacentHTML('beforeend', modalHTML);

    // 2. Toast Notification Container
    const toastHTML = `
        <div id="toast-container" class="toast-notification">
            <span class="toast-icon" id="toast-icon">🎉</span>
            <span class="toast-message" id="toast-message">장보기 내역 2건이 입력되었습니다!</span>
        </div>
    `;
    appEl.insertAdjacentHTML('beforeend', toastHTML);

    // 3. Phase 3: Rescue Reward Success Glassmorphic Overlay
    const rewardHTML = `
        <div id="reward-overlay" class="reward-overlay">
            <div class="reward-card">
                <span class="reward-badge-icon">🏆</span>
                <h3 class="reward-title">식재료 구출 대성공!</h3>
                <p class="reward-desc">냉장고 안 시들어가던 식재료를 폐기하지 않고 맛있게 소모하였습니다.</p>
                <div class="reward-stats-container">
                    <div class="reward-stat-box">
                        <span class="reward-stat-val saving">+6,500원</span>
                        <span class="reward-stat-label">이번 한끼 절감액</span>
                    </div>
                    <div class="reward-stat-box">
                        <span class="reward-stat-val waste">-320g</span>
                        <span class="reward-stat-label">음식 폐기량 감소</span>
                    </div>
                </div>
                <button class="btn-confirm-reward" onclick="confirmRescueConsumption()">인벤토리 반영하기</button>
            </div>
        </div>
    `;
    appEl.insertAdjacentHTML('beforeend', rewardHTML);

    // 4. Phase 4: Fake Door Premium Unlock Modal Overlay
    const fakeModalHTML = `
        <div id="fake-modal-overlay" class="fake-modal-overlay">
            <div class="fake-modal-card">
                <span class="fake-badge-icon">🛡️</span>
                <h3 id="fake-modal-title" class="fake-modal-title">지불 의사 신호 전송 성공 (Signal Logged)</h3>
                <p id="fake-modal-desc" class="fake-modal-desc">
                    현재 베타 테스트 중인 프리미엄 기능입니다.<br>
                    소중한 지불 의사 신호가 개발팀 서버에 100% 안전하게 기록되었습니다!<br><br>
                    정식 버전 출시 시 최우선 할인 혜택을 보내드리겠습니다. 감사합니다.
                </p>
                <button class="btn-fake-confirm" onclick="closeFakeDoorModal()">확인</button>
            </div>
        </div>
    `;
    appEl.insertAdjacentHTML('beforeend', fakeModalHTML);

    // 5. AI Hologram spinner overlay
    const aiLoadingHTML = `
        <div id="ai-loading-overlay" class="ai-loading-overlay">
            <div class="ai-loading-card">
                <div class="ai-hologram-spinner">
                    <div class="spinner-ring"></div>
                    <span class="ai-spinner-icon">✨</span>
                </div>
                <h3 class="ai-loading-title">스마트 AI 레시피 추천 중</h3>
                <p class="ai-loading-desc" id="ai-loading-desc">AI가 냉장고 속 식재료의 영양과 궁합을 분석하여 맞춤 레시피를 설계하고 있습니다...</p>
                <div class="ai-loading-steps">
                    <span class="loading-step active" id="step-1">● 식재료 최적 매칭 분석 중</span>
                    <span class="loading-step" id="step-2">● 15분 조리 가이드 구성 중</span>
                    <span class="loading-step" id="step-3">● 맞춤형 레시피 완성 중</span>
                </div>
            </div>
        </div>
    `;
    appEl.insertAdjacentHTML('beforeend', aiLoadingHTML);
}

/**
 * Open the Smart Scan Modal
 */
function openScanModal() {
    const overlay = document.getElementById('scan-modal-overlay');
    if (overlay) {
        document.getElementById('modal-initial-view').style.display = 'block';
        document.getElementById('modal-loading-view').style.display = 'none';
        const verifView = document.getElementById('modal-verification-view');
        if (verifView) verifView.style.display = 'none';
        
        overlay.classList.add('active');
    }
}

/**
 * Close the Smart Scan Modal
 */
function closeScanModal() {
    const overlay = document.getElementById('scan-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

/**
 * Simulates a high-fidelity 2-second OCR technical scan
 * @param {string} scanType 'receipt' | 'camera'
 */
function startTechnicalScan(scanType) {
    const initialView = document.getElementById('modal-initial-view');
    const loadingView = document.getElementById('modal-loading-view');
    const label = document.getElementById('scan-loading-label');
    const fill = document.getElementById('scanner-progress-fill');
    const pct = document.getElementById('scanner-progress-pct');
    const vfIcon = document.getElementById('scanner-viewfinder-icon');

    if (!initialView || !loadingView) return;

    initialView.style.display = 'none';
    loadingView.style.display = 'flex';

    vfIcon.innerText = scanType === 'receipt' ? '🧾' : '🧊';

    let progress = 0;
    const duration = 2000; 
    const intervalTime = 50; 
    const totalSteps = duration / intervalTime;
    const stepIncrement = 100 / totalSteps;

    const timer = setInterval(() => {
        progress += stepIncrement;
        if (progress > 100) progress = 100;

        fill.style.width = `${progress}%`;
        pct.innerText = `${Math.floor(progress)}%`;

        if (progress < 25) {
            label.innerText = '이미지 데이터 로드 중...';
        } else if (progress < 60) {
            label.innerText = 'AI Vision 텍스트/객체 디코딩 중...';
        } else if (progress < 90) {
            label.innerText = '인벤토리 인덱스 데이터 정렬 중...';
        } else {
            label.innerText = '동기화 완료!';
        }

        if (progress >= 100) {
            clearInterval(timer);
            
            // Deep-copy mockScanResult into tempScanResults for local correction
            tempScanResults = JSON.parse(JSON.stringify(mockScanResult));
            
            // Smoothly shift to OCR Verification Screen inside the modal
            setTimeout(() => {
                const loadingView = document.getElementById('modal-loading-view');
                const verificationView = document.getElementById('modal-verification-view');
                if (loadingView && verificationView) {
                    loadingView.style.display = 'none';
                    verificationView.style.display = 'block';
                    renderScanVerificationScreen();
                }
            }, 300);
        }
    }, intervalTime);
}

/**
 * Fires a gorgeous slide-up glassmorphic toast notification
 * @param {string} message 
 * @param {string} icon 
 */
function showToast(message, icon = '🎉') {
    const container = document.getElementById('toast-container');
    const msgEl = document.getElementById('toast-message');
    const iconEl = document.getElementById('toast-icon');

    if (!container || !msgEl || !iconEl) return;

    iconEl.innerText = icon;
    msgEl.innerText = message;

    container.classList.add('active');

    setTimeout(() => {
        container.classList.remove('active');
    }, 3000);
}

// ==========================================================================
// Phase 2.5: AI OCR Verification & Correction Interaction Logic
// ==========================================================================

/**
 * Dynamically match optimal emojis for typed Korean ingredient names
 * @param {string} name 
 * @returns {string} Emoji
 */
function getEmojiForIngredient(name) {
    if (!name) return "🏷️";
    name = name.trim();
    if (name.includes("대파") || name.includes("쪽파") || name.includes("실파") || name.includes("파")) return "🥬";
    if (name.includes("양파")) return "🧅";
    if (name.includes("마늘")) return "🧄";
    if (name.includes("고추") || name.includes("피망") || name.includes("파프리카")) return "🌶️";
    if (name.includes("새송이") || name.includes("느타리") || name.includes("팽이") || name.includes("송이") || name.includes("버섯")) return "🍄";
    if (name.includes("토마토") || name.includes("방울토마토")) return "🍅";
    if (name.includes("당근")) return "🥕";
    if (name.includes("감자")) return "🥔";
    if (name.includes("고구마")) return "🍠";
    if (name.includes("가지")) return "🍆";
    if (name.includes("오이")) return "🥒";
    if (name.includes("호박") || name.includes("애호박") || name.includes("단호박")) return "🎃";
    if (name.includes("옥수수")) return "🌽";
    if (name.includes("배추") || name.includes("상추") || name.includes("깻잎") || name.includes("시금치") || name.includes("샐러드") || name.includes("채소")) return "🥬";
    
    if (name.includes("계란") || name.includes("달걀") || name.includes("메추리알")) return "🥚";
    if (name.includes("우유") || name.includes("두유")) return "🥛";
    if (name.includes("치즈") || name.includes("체다") || name.includes("모짜렐라")) return "🧀";
    if (name.includes("두부") || name.includes("순두부") || name.includes("연두부")) return "🧈";
    if (name.includes("버터") || name.includes("마가린")) return "🧈";
    if (name.includes("요거트") || name.includes("요구르트")) return "🥛";

    if (name.includes("베이컨")) return "🥓";
    if (name.includes("삼겹살") || name.includes("목살") || name.includes("돼지") || name.includes("돈")) return "🐖";
    if (name.includes("소고기") || name.includes("등심") || name.includes("안심") || name.includes("우육")) return "🐂";
    if (name.includes("닭고기") || name.includes("닭") || name.includes("치킨") || name.includes("닭가슴살")) return "🐔";
    if (name.includes("햄") || name.includes("소시지") || name.includes("스팸") || name.includes("고기") || name.includes("스테이크")) return "🥩";
    
    if (name.includes("새우") || name.includes("대하")) return "🍤";
    if (name.includes("연어")) return "🐟";
    if (name.includes("참치") || name.includes("동원참치") || name.includes("캔참치")) return "🐟";
    if (name.includes("오징어") || name.includes("문어") || name.includes("낙지") || name.includes("쭈꾸미")) return "🦑";
    if (name.includes("생선") || name.includes("고등어") || name.includes("갈치") || name.includes("조기")) return "🐟";
    if (name.includes("조개") || name.includes("바지락") || name.includes("홍합") || name.includes("굴")) return "🐚";
    
    if (name.includes("사과")) return "🍎";
    if (name.includes("바나나")) return "🍌";
    if (name.includes("포도") || name.includes("샤인머스캣")) return "🍇";
    if (name.includes("딸기")) return "🍓";
    if (name.includes("레몬")) return "🍋";
    if (name.includes("오렌지") || name.includes("귤") || name.includes("한라봉")) return "🍊";
    if (name.includes("수박")) return "🍉";
    if (name.includes("파인애플")) return "🍍";
    if (name.includes("참외") || name.includes("멜론")) return "🍈";
    if (name.includes("복숭아")) return "🍑";

    return "🏷️";
}

/**
 * Automap categories for dynamic inventory allocation based on name rules
 * @param {string} name 
 * @returns {string} Category string
 */
function getCategoryForIngredient(name) {
    if (!name) return "기타";
    name = name.trim();
    if (name.includes("파") || name.includes("양파") || name.includes("마늘") || name.includes("버섯") || name.includes("토마토") || name.includes("당근") || name.includes("감자") || name.includes("고구마") || name.includes("가지") || name.includes("오이") || name.includes("호박") || name.includes("애호박") || name.includes("배추") || name.includes("상추") || name.includes("깻잎") || name.includes("샐러드") || name.includes("시금치")) {
        return "채소";
    }
    if (name.includes("계란") || name.includes("달걀") || name.includes("우유") || name.includes("치즈") || name.includes("요거트") || name.includes("버터")) {
        return "알류/유제품";
    }
    if (name.includes("삼겹살") || name.includes("소고기") || name.includes("닭고기") || name.includes("닭") || name.includes("베이컨") || name.includes("고기") || name.includes("햄") || name.includes("소시지") || name.includes("스팸")) {
        return "육류";
    }
    if (name.includes("새우") || name.includes("생선") || name.includes("고등어") || name.includes("연어") || name.includes("참치") || name.includes("오징어") || name.includes("조개")) {
        return "수산물";
    }
    if (name.includes("두부") || name.includes("순두부") || name.includes("연두부") || name.includes("두유")) {
        return "두부/콩류";
    }
    if (name.includes("사과") || name.includes("바나나") || name.includes("포도") || name.includes("딸기") || name.includes("오렌지") || name.includes("귤") || name.includes("수박")) {
        return "과일";
    }
    return "기타";
}

/**
 * Renders the OCR recognized items for confirmation and live edit
 */
function renderScanVerificationScreen() {
    const listEl = document.getElementById('verif-items-list');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    if (tempScanResults.length === 0) {
        listEl.innerHTML = `
            <div class="verif-empty-state">
                <span class="empty-emoji">🥣</span>
                <p>인식된 식재료가 없습니다.<br>아래의 '재료 추가' 버튼을 눌러 직접 등록해보세요!</p>
            </div>
        `;
        return;
    }
    
    tempScanResults.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'verification-item-row';
        row.innerHTML = `
            <span class="verif-item-emoji" id="verif-emoji-${index}">${item.emoji || '🏷️'}</span>
            <input type="text" class="verif-input-name" value="${item.name}" placeholder="예: 새송이버섯" oninput="updateTempItemName(${index}, this.value)" />
            <div class="verif-dday-wrapper">
                <input type="number" class="verif-input-dday" value="${item.dday}" min="1" max="99" oninput="updateTempItemDday(${index}, this.value)" />
                <span class="verif-dday-label">D-Day</span>
            </div>
            <button class="btn-verif-delete" onclick="deleteTempItem(${index})" title="삭제">🗑️</button>
        `;
        listEl.appendChild(row);
    });
}

/**
 * Handler for editing the ingredient name and automatically updating its emoji & category
 */
function updateTempItemName(index, val) {
    if (tempScanResults[index]) {
        tempScanResults[index].name = val;
        
        // Auto-match emoji and category
        const matchedEmoji = getEmojiForIngredient(val);
        tempScanResults[index].emoji = matchedEmoji;
        tempScanResults[index].category = getCategoryForIngredient(val);
        
        // Live update the emoji container on screen without rendering the whole list to keep cursor focus
        const emojiEl = document.getElementById(`verif-emoji-${index}`);
        if (emojiEl) {
            emojiEl.innerText = matchedEmoji;
        }
    }
}

/**
 * Handler for editing the remaining D-Day
 */
function updateTempItemDday(index, val) {
    if (tempScanResults[index]) {
        let d = parseInt(val, 10);
        if (isNaN(d) || d < 0) d = 0;
        tempScanResults[index].dday = d;
    }
}

/**
 * Deletes an item from temporary list
 */
function deleteTempItem(index) {
    tempScanResults.splice(index, 1);
    renderScanVerificationScreen();
}

/**
 * Adds a new default item row to the temporary list
 */
function addTempItem() {
    tempScanResults.push({
        name: "새로운 재료",
        dday: 5,
        category: "기타",
        location: "냉장실",
        emoji: "🏷️"
    });
    renderScanVerificationScreen();
}

/**
 * Confirms registration of verified temp results and pushes them to inventory
 */
function finalizeScanRegistration() {
    if (tempScanResults.length === 0) {
        showToast('저장할 식재료가 없습니다. 재료를 추가해주세요!', '⚠️');
        return;
    }
    
    // Check if name is blank
    const blankItemIndex = tempScanResults.findIndex(item => !item.name || item.name.trim() === '');
    if (blankItemIndex !== -1) {
        showToast('식재료 이름을 올바르게 입력해주세요!', '⚠️');
        return;
    }
    
    // Final save: push to master ingredients array
    ingredients.push(...tempScanResults);
    
    // Spawn gorgeous Confetti falling shards from AI rescue success style
    triggerConfetti();
    
    // Close modal
    closeScanModal();
    
    // Refresh Inventory View if currently active
    if (currentTab === 'inventory') {
        const contentArea = document.getElementById('content');
        renderInventory(contentArea);
    }
    
    // Alert with Toast
    const savedNamesStr = tempScanResults.map(item => item.name.trim()).join(', ');
    showToast(`식재료 ${tempScanResults.length}건이 냉장고에 수납되었습니다! (${savedNamesStr})`, '🎉');
}

/**
 * Render the AI Recipe screen with collapsible cards
 * @param {HTMLElement} container 
 */
/**
 * Render the AI Recipe screen with collapsible cards
 * @param {HTMLElement} container 
 */
function renderRecipePage(container) {
    const aiGeneratorHTML = `
        <div class="ai-button-wrapper" style="margin-bottom: 24px;">
            <button class="btn-ai-generate" onclick="generateAIRecipe()">
                <span>✨</span> AI 활용하여 레시피 추천받기
            </button>
        </div>
    `;

    const headerHTML = `
        <h2 class="page-title">AI 현실형 레시피</h2>
        <p class="page-subtitle">냉장고에 부재료 매수 없이, 오직 현재 있는 식재료만으로 100% 만드는 15분 식탁.</p>
    `;
    
    // Filter recipes that can be made with current ingredients OR are AI-generated (since AI already generates them using current ingredients!)
    const matchedRecipes = recipes.filter(recipe => {
        if (recipe.isAI) return true;
        return recipe.ingredients.every(reqName => ingredients.some(myIng => myIng.name === reqName));
    });
    
    // Sort recipes by the minimum dday of their required ingredients (ascending - most urgent first)
    const sortedRecipes = [...matchedRecipes].sort((a, b) => {
        const getMinDday = (recipe) => {
            const ddays = recipe.ingredients.map(ingName => {
                const matched = ingredients.find(i => i.name === ingName);
                return matched ? matched.dday : 999;
            });
            return Math.min(...ddays);
        };
        return getMinDday(a) - getMinDday(b);
    });

    let listHTML = '';
    if (sortedRecipes.length === 0) {
        listHTML = `
            <div class="placeholder-container" style="min-height: 250px; margin-top: 10px;">
                <span class="placeholder-icon">🥣</span>
                <h3 class="placeholder-title">구출 가능한 레시피가 없습니다</h3>
                <p class="placeholder-desc">현재 보유 중인 재료가 소모되어 조리 가능한 요리가 없습니다. 상단 스캔 버튼을 눌러 새 식재료를 채워보세요!</p>
            </div>
        `;
    } else {
        listHTML = `<div class="recipe-list">`;
        sortedRecipes.forEach((recipe, rIdx) => {
            const recipeDdays = recipe.ingredients.map(ingName => {
                const matched = ingredients.find(i => i.name === ingName);
                return matched ? matched.dday : 999;
            });
            const minDdayVal = Math.min(...recipeDdays);
            
            let urgencyText = '🥬 신선함 유지 중';
            let urgencyClass = 'color: #2E7D32;';
            if (minDdayVal <= 1) {
                urgencyText = '🚨 즉시 구출 필요';
                urgencyClass = 'color: #C62828;';
            } else if (minDdayVal <= 3) {
                urgencyText = '⚠️ 오늘 구출 권장';
                urgencyClass = 'color: #F57F17;';
            }

            listHTML += `
                <div class="recipe-card collapsed" id="recipe-card-${rIdx}" onclick="toggleRecipeCard(${rIdx})" style="animation-delay: ${rIdx * 0.1}s">
                    <div class="recipe-card-header">
                        <span class="recipe-title">${recipe.title}</span>
                        <div class="recipe-meta-badges">
                            <span class="recipe-meta-badge" style="${urgencyClass} background: rgba(255,255,255,0.8); border: 1px solid currentColor;">${urgencyText}</span>
                            <span class="recipe-meta-badge">⚡ ${recipe.time}</span>
                            <span class="recipe-meta-badge">🔥 ${recipe.difficulty}</span>
                            <a href="${recipe.youtubeUrl || 'https://www.youtube.com/results?search_query=' + encodeURIComponent(recipe.title)}" target="_blank" rel="noopener noreferrer" class="recipe-meta-badge youtube-link" style="text-decoration: none; background: #FFEBEE; color: #D32F2F; border: 1px solid rgba(211, 47, 47, 0.15); transition: var(--transition-smooth);" onclick="event.stopPropagation()">
                                <span>▶️</span> 영상 가이드
                            </a>
                        </div>
                    </div>
                    
                    <div class="recipe-ingredients-required">
                        <span class="recipe-ing-title">구출 대상 식재료 (유통기한 임박순 정렬)</span>
                        ${recipe.ingredients
                            .map(ingName => ingredients.find(i => i.name === ingName))
                            .filter(ing => ing !== undefined)
                            .sort((a, b) => a.dday - b.dday) // Sort individual ingredient tags inside card by D-day
                            .map(matchedIng => {
                                const emoji = matchedIng.emoji;
                                const name = matchedIng.name;
                                const dday = matchedIng.dday;
                                
                                // Color variables aligned with design system
                                let tagStyle = 'background: #E8F5E9; color: #2E7D32; border: 1px solid rgba(46, 125, 50, 0.15);'; // Safe
                                if (dday <= 1) {
                                    tagStyle = 'background: #FFEBEE; color: #C62828; border: 1px solid rgba(198, 40, 40, 0.2); font-weight: 700;';
                                } else if (dday <= 3) {
                                    tagStyle = 'background: #FFF8E1; color: #F57F17; border: 1px solid rgba(245, 127, 23, 0.2); font-weight: 700;';
                                }
                                
                                return `
                                    <span class="recipe-ing-tag" style="${tagStyle} display: inline-flex; align-items: center; gap: 4px;">
                                        <span>${emoji}</span>
                                        <span>${name}</span>
                                        <span style="font-family: 'Outfit', sans-serif; font-size: 9px; font-weight: 800; padding: 1px 4px; border-radius: 4px; background: rgba(255,255,255,0.6); margin-left: 2px;">D-${dday}</span>
                                    </span>
                                `;
                            }).join('')}
                    </div>

                    <div class="recipe-steps-container">
                        <span class="recipe-steps-title">🍳 레시피 조리법</span>
                        ${recipe.steps.map((step, sIdx) => `
                            <div class="recipe-step-item">
                                <span class="step-number">${sIdx + 1}</span>
                                <span class="step-text">${step}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="recipe-action-bar">
                        <button class="btn-rescue-success" onclick="event.stopPropagation(); executeRescue('${recipe.title}')">
                            🎉 식재료 구출 성공
                        </button>
                        <button class="btn-rescue-fail" onclick="event.stopPropagation(); executeDiscard('${recipe.title}')">
                            🗑️ 구출 실패
                        </button>
                        <button class="btn-recipe-share" onclick="event.stopPropagation(); showToast('레시피 공유 링크가 복사되었습니다!', '🔗')">
                            📤 공유
                        </button>
                    </div>

                    <div class="recipe-expand-indicator">
                        <span class="indicator-arrow">▼</span>
                    </div>
                </div>
            `;
        });
        listHTML += `</div>`;
    }

    container.innerHTML = headerHTML + aiGeneratorHTML + listHTML;
}

/**
 * Extract raw JSON string from a potentially decorated conversational response text
 * @param {string} text 
 * @returns {string}
 */
function extractJsonText(text) {
    if (!text) return '';
    
    let jsonText = '';
    
    // 1. Try to find content inside ```json ... ``` code blocks
    const markdownRegex = /```json\s*([\s\S]*?)\s*```/i;
    let match = markdownRegex.exec(text);
    if (match && match[1]) {
        jsonText = match[1].trim();
    } else {
        // 2. Try generic code block ``` ... ```
        const genericCodeRegex = /```\s*([\s\S]*?)\s*```/;
        match = genericCodeRegex.exec(text);
        if (match && match[1]) {
            jsonText = match[1].trim();
        } else {
            // 3. Find the first '[' or '{' and the matching closing bracket/brace to handle both arrays and objects robustly
            const arrayIdx = text.indexOf('[');
            const objectIdx = text.indexOf('{');
            if (arrayIdx !== -1 && (objectIdx === -1 || arrayIdx < objectIdx)) {
                const lastArrayIdx = text.lastIndexOf(']');
                if (lastArrayIdx !== -1 && lastArrayIdx > arrayIdx) {
                    jsonText = text.substring(arrayIdx, lastArrayIdx + 1).trim();
                } else {
                    jsonText = text.trim();
                }
            } else if (objectIdx !== -1) {
                const lastObjectIdx = text.lastIndexOf('}');
                if (lastObjectIdx !== -1 && lastObjectIdx > objectIdx) {
                    jsonText = text.substring(objectIdx, lastObjectIdx + 1).trim();
                } else {
                    jsonText = text.trim();
                }
            } else {
                jsonText = text.trim();
            }
        }
    }
    
    // Perform ultra-resilient sanitization on the extracted JSON block
    // Split into lines to target specific malformations without breaking string contents
    let lines = jsonText.split('\n');
    let cleanedLines = lines.map(line => {
        let trimmed = line.trim();
        
        // A. Remove bullet points or asterisks starting a line before JSON constructs (e.g. * "ingredients" or - [ )
        if (/^[*\-]+\s*(["{\[\]])/.test(trimmed)) {
            line = line.replace(/(\s*)[*\-]+\s*/, '$1');
        }
        
        // B. Remove inline comma bullet points (e.g. , * "step" )
        if (/,\s*[*\-]+\s*(["{\[\]])/.test(line)) {
            line = line.replace(/,\s*[*\-]+\s*(["{\[\]])/, ', $1');
        }
        
        // C. Remove markdown bolding wrapper asterisks around quoted keys (e.g. **"ingredients"**: )
        line = line.replace(/\*+(".*?")\*+:/g, '$1:');
        
        return line;
    });
    
    return cleanedLines.join('\n');
}

/**
 * AI Realtime Recipe Generation Triggering
 * Calling Vertex/Gemini Google AI API Studio and parsing strictly formatted JSON schemas
 */
async function generateAIRecipe() {
    const apiKey = getGoogleApiKey();
    const model1 = getGemmaModel1();
    const model2 = getGemmaModel2();
    if (!apiKey) {
        showToast('AI 레시피 추천 기능을 현재 사용할 수 없습니다.', '⚠️');
        return;
    }
    
    const currentIngs = ingredients.map(i => i.name);
    if (currentIngs.length === 0) {
        showToast('냉장고가 비어있어 레시피를 생성할 수 없습니다!', '⚠️');
        return;
    }
    
    // Show AI Loading holographic overlay screen
    const overlay = document.getElementById('ai-loading-overlay');
    if (overlay) overlay.classList.add('active');
    
    const descEl = document.getElementById('ai-loading-desc');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    
    // Animate loading subtitle phases sequentially
    let phase = 0;
    const interval = setInterval(() => {
        phase = (phase + 1) % 3;
        if (phase === 0) {
            if (step3) step3.classList.remove('active');
            if (step1) step1.classList.add('active');
            if (descEl) descEl.innerText = "AI가 냉장고 속 식재료의 영양과 궁합을 분석하여 맞춤 레시피를 설계하고 있습니다...";
        } else if (phase === 1) {
            if (step1) step1.classList.remove('active');
            if (step2) step2.classList.add('active');
            if (descEl) descEl.innerText = "AI가 최적의 식재료 소요 시간 및 조리 가이드를 구성하고 있습니다...";
        } else if (phase === 2) {
            if (step2) step2.classList.remove('active');
            if (step3) step3.classList.add('active');
            if (descEl) descEl.innerText = "가장 맛있고 실현 가능한 레시피를 다듬어 완성하는 중입니다...";
        }
    }, 2000);
    
    // Construct dynamic diet & allergy preference instructions
    let preferenceInstructions = '';
    
    // 1. Household size
    preferenceInstructions += `- 가구 구성: **${userPreferencesState.householdSize}**에 딱 맞춘 1회 분량 및 적당한 재료 분량으로 조절하세요.\n`;
    
    // 2. Diet type
    if (userPreferencesState.dietType === '비건') {
        preferenceInstructions += `- **식생활 유형: 비건(Vegan)**입니다. 육류, 어패류, 계란, 유제품, 꿀 등 모든 동물성 재료를 절대로 레시피에 1g도 포함하지 마십시오. 순수 100% 식물성 재료만 사용하는 요리만 제안하세요.\n`;
    } else if (userPreferencesState.dietType === '락토-오보') {
        preferenceInstructions += `- **식생활 유형: 락토-오보 채식(Lacto-Ovo Vegetarian)**입니다. 육류와 어패류는 제외하되, 계란(오보)과 우유/버터/치즈 등 유제품(락토)은 사용이 가능합니다. 이 제약을 맞춰 요리를 제안하세요.\n`;
    } else if (userPreferencesState.dietType === '키토/저탄고지') {
        preferenceInstructions += `- **식생활 유형: 키토/저탄고지(Keto/LCHF)**입니다. 순수 당류와 밀가루, 전분, 쌀밥 등 고탄수화물 식재료의 사용을 극도로 제한하고, 좋은 지방과 단백질, 풍부한 채소 중심의 고지방 저탄수화물 식단으로 구성해 주세요.\n`;
    } else if (userPreferencesState.dietType === '저당/다이어트') {
        preferenceInstructions += `- **식생활 유형: 저당/다이어트**입니다. 설탕, 시럽, 가공 탄수화물을 억제하고 고단백 저탄수화물 위주의 건강하고 가벼운 한 끼 식사로 조리법을 조율해 주세요.\n`;
    } else if (userPreferencesState.dietType === '글루텐프리') {
        preferenceInstructions += `- **식생활 유형: 글루텐 프리(Gluten-Free)**입니다. 밀가루, 보리, 호밀 등 글루텐이 포함된 모든 가루나 면류, 소스의 사용을 전면 금지하며, 쌀, 감자, 타피오카 전분 등 글루텐 프리 대체재를 적극 고려해 주세요.\n`;
    } else {
        preferenceInstructions += `- 식생활 유형: 일반식입니다. 균형 잡힌 가공/자연 식재료 배합을 지향해 주세요.\n`;
    }
    
    // 3. Spiciness
    preferenceInstructions += `- **선호 맵기: ${userPreferencesState.spiciness}** 수준에 맞춰 단계별 조리법을 조절해 주세요. `;
    if (userPreferencesState.spiciness === '아주순한맛') {
        preferenceInstructions += `고춧가루, 고추장, 청양고추, 후추, 와사비 등 어떠한 매운맛 성분이나 자극적인 향신료도 일절 제외하여 아이들이나 자극에 민감한 사람도 편하게 먹을 수 있는 극도의 순하고 달콤/담백한 레시피로 만드세요.\n`;
    } else if (userPreferencesState.spiciness === '순한맛') {
        preferenceInstructions += `자극적인 고춧가루, 고추장, 과도한 후추 등을 제외하여 담백하고 부담 없는 부드러운 맛으로 유도해 주세요.\n`;
    } else if (userPreferencesState.spiciness === '매운맛') {
        preferenceInstructions += `고춧가루, 청양고추, 붉은 고추 등을 적극적으로 곁들여 맛있게 칼칼하고 입안이 얼얼할 정도로 화끈하고 매콤한 풍미를 내도록 조리 단계에 기재해 주세요.\n`;
    } else {
        preferenceInstructions += `대중적이고 알맞은 일반적인 매콤함과 간으로 지시하세요.\n`;
    }
    
    // 4. Lactose Intolerance
    if (userPreferencesState.lactoseIntolerant) {
        preferenceInstructions += `- **유당 불내증 경고:** 우유, 생크림, 버터, 일반 슬라이스 치즈 등의 유제품을 절대로 사용하지 마십시오. 대신 아몬드유, 두유, 락토프리 제품을 쓰거나 아예 유제품이 없는 조리법을 권장해 주세요.\n`;
    }
    
    // 5. Allergies
    if (userPreferencesState.allergies.nuts) {
        preferenceInstructions += `- **알레르기 경고 [견과류]:** 땅콩, 호두, 아몬드, 캐슈넛, 잣, 땅콩버터 등 모든 견과류 성분을 레시피에서 철저하게 배제해 주세요.\n`;
    }
    if (userPreferencesState.allergies.meat) {
        preferenceInstructions += `- **알레르기/기피 경고 [육류 기피]:** 모든 종류의 가공육이나 육류(소고기, 돼지고기, 닭고기, 햄, 비엔나 소세지, 베이컨 등)를 절대 재료로 사용하지 마세요.\n`;
    }
    if (userPreferencesState.allergies.veggies) {
        const veggiesStr = userPreferencesState.allergyVeggiesInput.trim();
        if (veggiesStr) {
            preferenceInstructions += `- **알레르기/기피 경고 [채소류 기피]:** 다음 채소류는 절대로 포함되거나 사용되어서는 안 됩니다: [**${veggiesStr}**].\n`;
        }
    }
    if (userPreferencesState.allergies.other) {
        const otherStr = userPreferencesState.allergyOtherInput.trim();
        if (otherStr) {
            preferenceInstructions += `- **기타 제외 요청 재료:** 다음 식재료는 레시피에서 완전히 배제해 주세요: [**${otherStr}**].\n`;
        }
    }

    const prompt = `냉장고 속 재료 목록: [${currentIngs.join(', ')}]
    
    위의 재료들을 메인으로 활용하여 100% 매칭할 수 있고 조리가 가능한 15분 현실형 꿀맛 요리 레시피를 **반드시 서로 다른 종류로 3개** 창조해서 JSON 배열 형태로 반환해줘.
    반드시 위의 제공된 재료들을 메인으로 사용하고, 제공되지 않은 다른 부재료를 필수 주재료로 강제하지 마. (소금, 식용유, 간장, 밥 같은 기본 조미료/기본 재료 정도는 부차적으로 쓸 수 있음)
    
    [사용자 건강 및 맞춤 식생활 제약 조건 (필수 준수!)]
    ${preferenceInstructions}
    
    반드시 정확히 아래 명시된 JSON 배열 포맷으로 반환해줘. 마크다운 기호 없이 순수 JSON만 반환하거나, 마크다운 \`\`\`json 블록으로 감싸서 보내줘.
    
    JSON Schema (배열 형태):
    [
      {
        "title": "요리명 (예: 초간단 파양파 계란볶음밥)",
        "ingredients": ["레시피에 사용된 냉장고 식재료들 중 매칭되는 정확한 이름들의 문자열 배열 (예: 대파, 계란 등)"],
        "time": "조리시간 (예: 12분)",
        "difficulty": "난이도 (예: 쉬움 / 보통 / 어려움 중 택1)",
        "steps": [
          "조리 단계 1 (간결한 한국어)",
          "조리 단계 2",
          "조리 단계 3",
          "조리 단계 4 (최대 5단계)"
        ]
      }
    ]
    
    주의: 요리명 앞이나 제목에 '[AI]'와 같은 수식어는 직접 붙이지 마. 프로그램이 알아서 붙여줄게.`;
    
    const payload = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };
    
    const modelCandidates = [
        { modelName: model1, name: `${model1} (1순위)` },
        { modelName: model2, name: `${model2} (2순위)` }
    ];
    
    let response = null;
    let lastError = null;
    let successfulModelName = '';

    try {
        for (const candidate of modelCandidates) {
            try {
                console.log(`[MoEatzy AI] Actively requesting model: ${candidate.name}`);
                const candidateUrl = `https://generativelanguage.googleapis.com/v1beta/models/${candidate.modelName}:generateContent?key=${apiKey}`;
                
                response = await fetch(candidateUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                
                if (response.ok) {
                    successfulModelName = candidate.name;
                    console.log(`[MoEatzy AI] Success! Connected via: ${successfulModelName}`);
                    break;
                } else {
                    let errMsg = `HTTP Error! Status: ${response.status}`;
                    try {
                        const errData = await response.json();
                        if (errData && errData.error && errData.error.message) {
                            errMsg = `${response.status} - ${errData.error.message}`;
                        }
                    } catch (e) {}
                    console.warn(`[MoEatzy AI] Model failed for ${candidate.name}: ${errMsg}`);
                    lastError = new Error(errMsg);
                }
            } catch (fetchErr) {
                console.warn(`[MoEatzy AI] Fetch error for ${candidate.name}:`, fetchErr);
                lastError = fetchErr;
            }
        }

        if (!response || !response.ok) {
            throw lastError || new Error("AI 서비스 연동 중 오류가 발생했습니다. 키 설정을 다시 확인해 주세요.");
        }
        
        const data = await response.json();
        clearInterval(interval);
        
        let responseText = '';
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
            responseText = data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('API 응답 형식이 올바르지 않습니다.');
        }
        
        // Resiliently extract only the JSON block out of any conversational or markdown responses
        const jsonText = extractJsonText(responseText);
        
        const parsedJson = JSON.parse(jsonText);
        const newRecipes = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
        
        // Reverse array before unshifting so they are inserted in their correct logical order (first recipe at the top)
        [...newRecipes].reverse().forEach(aiRecipeObj => {
            // Mark as AI-generated to bypass strict mock filtering
            aiRecipeObj.isAI = true;
            
            // Add dynamic YouTube Search URL for bulletproof integration
            aiRecipeObj.youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(aiRecipeObj.title)}`;
            
            // Push to global recipes array
            recipes.unshift(aiRecipeObj);
        });
        
        // Clear Loading Overlay
        if (overlay) overlay.classList.remove('active');
        
        // Confetti physics particles triggering
        triggerConfetti();
        
        // Refresh Recipe View to mount new card dynamically
        if (currentTab === 'recipe') {
            const contentArea = document.getElementById('content');
            renderRecipePage(contentArea);
        }
        
        showToast(`AI가 ${newRecipes.length}개의 맞춤 레시피를 제안했습니다!`, '✨');
        
    } catch (err) {
        console.error('[AI RECIPE COMPONENT ERROR] 생성 실패:', err);
        clearInterval(interval);
        if (overlay) overlay.classList.remove('active');
        showToast(`오류: ${err.message}`, '❌');
    }
}

/**
 * Toggles a recipe card's collapsed/expanded state
 * @param {number} rIdx 
 */
function toggleRecipeCard(rIdx) {
    const card = document.getElementById(`recipe-card-${rIdx}`);
    if (!card) return;
    
    if (card.classList.contains('collapsed')) {
        card.classList.remove('collapsed');
        card.classList.add('expanded');
    } else {
        card.classList.add('collapsed');
        card.classList.remove('expanded');
    }
}

/**
 * Triggers zero-dependency multi-colored physics confetti particles
 */
function triggerConfetti() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    const colors = ['#FFC107', '#FF5722', '#4CAF50', '#00BCD4', '#E91E63', '#9C27B0', '#3F51B5', '#42A5F5'];

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('confetti-particle');

        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = 30 + Math.random() * 40; // centered spawn
        const top = 30 + Math.random() * 20;  // upper centered
        const size = 5 + Math.random() * 8;   // 5px to 13px size

        const xDistance = `${(Math.random() - 0.5) * 260}px`; // fly out left/right
        const rotation = `${360 + Math.random() * 720}deg`;
        const delay = Math.random() * 0.4;

        particle.style.background = color;
        particle.style.left = `${left}%`;
        particle.style.top = `${top}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.setProperty('--x-distance', xDistance);
        particle.style.setProperty('--rotation', rotation);
        particle.style.animationDelay = `${delay}s`;

        appEl.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 2200);
    }
}

/**
 * Handle ingredient rescue success event
 * @param {string} recipeTitle 
 */
function executeRescue(recipeTitle) {
    const recipe = recipes.find(r => r.title === recipeTitle);
    if (!recipe) return;

    console.log(`[MoEatzy] Recipe rescue success: ${recipeTitle}`);
    activeRescueRecipe = recipe;

    // 1. Spawning gorgeous confetti particles
    triggerConfetti();

    // 2. Open Success Reward Overlay
    const overlay = document.getElementById('reward-overlay');
    if (overlay) {
        overlay.classList.add('active');
    }
}

/**
 * Consumes matching ingredients from memory array and synchronizes inventory
 */
function confirmRescueConsumption() {
    const overlay = document.getElementById('reward-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }

    if (activeRescueRecipe) {
        // Remove matching recipe ingredients from our ingredients list
        ingredients = ingredients.filter(ing => !activeRescueRecipe.ingredients.includes(ing.name));
        activeRescueRecipe = null;

        // Auto switch back to inventory tab to see updated assets
        switchTab('inventory');
        showToast('식재료 소모 및 조리 반영 완료!', '🍽️');
    }
}

/**
 * Handle ingredient rescue fail (discard) event
 * @param {string} recipeTitle 
 */
function executeDiscard(recipeTitle) {
    const recipe = recipes.find(r => r.title === recipeTitle);
    if (!recipe) return;

    console.log(`[MoEatzy] Recipe rescue failed (discard): ${recipeTitle}`);

    // Remove matching recipe ingredients
    ingredients = ingredients.filter(ing => !recipe.ingredients.includes(ing.name));

    // Redirect to inventory and alert
    switchTab('inventory');
    showToast('식재료가 폐기 처리되었습니다. 다음엔 꼭 구출해주세요!', '😢');
}

// Initial App Bootstrapping
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[MoEatzy] App bootstrap initialized.');
    
    // Auto-load key from local Markdown environment file if available
    await loadApiKeyFromEnvironmentFile();
    
    // Build Phase 2 & 3 Modals/Overlays dynamically
    initializeDynamicUI();
    
    // Boot up main inventory tab
    switchTab('inventory');
});

// ==========================================================================
// Phase 4: Smart Buying Screen & Fake Door Modal Controls
// ==========================================================================

/**
 * Render the Smart Buying & Savings Report (Phase 4) tab
 * @param {HTMLElement} container 
 */
function renderShoppingPage(container) {
    // 1. Header Information
    const headerHTML = `
        <h2 class="page-title">신선 백과 & 리포트</h2>
        <p class="page-subtitle">보관 비법을 통해 식재료의 신선함을 유지하고 절약 효과를 확인하세요.</p>
    `;

    // 2. Refrigerator Teacher Storage Guide Section (Moved to the Top!)
    // Filter out selected items if they are no longer in the refrigerator list
    teacherSelectedIngredients = teacherSelectedIngredients.filter(name => ingredients.some(i => i.name === name));

    const chipsHTML = ingredients.map(ing => {
        const isActive = teacherSelectedIngredients.includes(ing.name);
        return `
            <button class="teacher-chip ${isActive ? 'active' : ''}" onclick="toggleTeacherIngredient('${ing.name}')">
                <span class="teacher-chip-emoji">${ing.emoji || '📦'}</span>
                <span class="teacher-chip-name">${ing.name}</span>
            </button>
        `;
    }).join('');

    let guideContentHTML = '';

    if (attemptedThirdSelection) {
        // Show premium subscription lock card, hide standard results
        guideContentHTML = `
            <div class="teacher-lock-card">
                <div class="lock-glow-effect"></div>
                <span class="lock-icon">🔒</span>
                <h4 class="lock-title">선생님의 보관 비법 한도 초과</h4>
                <p class="lock-desc">
                    무료 등급은 동시에 최대 <strong>2개</strong>의 가이드까지만 조회할 수 있습니다.<br>
                    체험용 프리미엄으로 무제한 신선 보관 꿀팁을 전수받아 보세요!
                </p>
                <button class="btn-lock-unlock" onclick="openFakeDoorModal('냉장고 선생님 무제한 가이드', '월 990원')">
                    👑 체험용 프리미엄 무료 활성화하기 (🔓)
                </button>
            </div>
        `;
    } else if (teacherSelectedIngredients.length === 0) {
        guideContentHTML = `
            <div class="teacher-empty-state">
                <span class="empty-icon">💡</span>
                <p>보관법이 궁금한 냉장고 속 식재료 칩을 선택해 보세요! (최대 2개 무료)</p>
            </div>
        `;
    } else {
        guideContentHTML = `
            <div class="teacher-guides-list">
                ${teacherSelectedIngredients.map(name => {
                    const ingObj = ingredients.find(i => i.name === name);
                    const guide = freshnessStorageGuideDb[name] || {
                        emoji: ingObj ? ingObj.emoji : '📦',
                        tips: "수분을 완전히 닦아내고 밀폐 용기나 지퍼백에 담아 공기 노출을 극도로 줄여 냉장 보관해 주시면 신선함이 극대화됩니다.",
                        effect: "D-day +3일 연장 효과"
                    };
                    return `
                        <div class="teacher-guide-card">
                            <div class="guide-card-header">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span class="guide-emoji-badge">${guide.emoji}</span>
                                    <span class="guide-ingredient-name">${name}</span>
                                </div>
                                <span class="guide-effect-badge">${guide.effect}</span>
                            </div>
                            <p class="guide-card-tips">${guide.tips}</p>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    const teacherSectionHTML = `
        <div class="teacher-container" style="margin-top: 16px;">
            <div class="teacher-header">
                <h3 class="section-head-title" style="margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
                    👨‍🏫 냉장고 선생님의 신선 보관 백과
                </h3>
                <p class="section-subtitle" style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 14px; line-height: 1.4;">
                    보관 온도와 습도를 제어하여 식재료 수명을 연장시키는 꿀팁을 전수합니다.
                </p>
            </div>
            
            <div class="teacher-chips-grid">
                ${chipsHTML}
            </div>
            
            <div class="teacher-guide-result-area">
                ${guideContentHTML}
            </div>
        </div>
    `;

    // 3. Section Divider and Header for Reports (Moved to the Bottom!)
    const reportHeaderHTML = `
        <div style="margin-top: 36px; margin-bottom: 16px;">
            <h3 class="section-head-title" style="margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
                📊 스마트 절약 & 환경 리포트
            </h3>
            <p class="section-subtitle" style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 0; line-height: 1.4;">
                식재료 구출로 아낀 예산과 탄소 발자국 절감액을 한눈에 체감하세요.
            </p>
        </div>
    `;

    // 4. Savings Report Card
    const reportCardHTML = `
        <div class="savings-report-card">
            <div class="savings-stats-row">
                <div class="savings-stat-panel">
                    <span class="savings-stat-title">이번 달 누적 식비 절감액</span>
                    <span class="savings-stat-bigval">47,500원</span>
                </div>
                <div class="savings-stat-panel">
                    <span class="savings-stat-title">음식 폐기 절감량</span>
                    <span class="savings-stat-bigval eco">-3.2kg</span>
                </div>
            </div>
            
            <div class="savings-chart-box">
                <span class="chart-title">주차별 식비 절약 추이</span>
                <div class="bar-graph-container">
                    <div class="bar-graph-column">
                        <span class="bar-val">12,000원</span>
                        <div class="bar-wrapper">
                            <div class="bar-fill" data-height="30%"></div>
                        </div>
                        <span class="bar-label">1주차</span>
                    </div>
                    <div class="bar-graph-column">
                        <span class="bar-val">18,500원</span>
                        <div class="bar-wrapper">
                            <div class="bar-fill" data-height="50%"></div>
                        </div>
                        <span class="bar-label">2주차</span>
                    </div>
                    <div class="bar-graph-column">
                        <span class="bar-val">47,500원</span>
                        <div class="bar-wrapper">
                            <div class="bar-fill" data-height="90%"></div>
                        </div>
                        <span class="bar-label">3주차</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 5. Cumulative Achievement Stats
    const statsHTML = `
        <h3 class="section-sub-title" style="margin-top: 24px;">🏆 누적 식재료 구출 업적</h3>
        <div class="my-stats-grid">
            <div class="my-stat-card">
                <span class="my-stat-emoji">🍲</span>
                <span class="my-stat-val">12회</span>
                <span class="my-stat-label">요리 구출 성공</span>
            </div>
            <div class="my-stat-card">
                <span class="my-stat-emoji">💰</span>
                <span class="my-stat-val">78,000원</span>
                <span class="my-stat-label">누적 식비 절감</span>
            </div>
            <div class="my-stat-card">
                <span class="my-stat-emoji">🌲</span>
                <span class="my-stat-val">5.4kg</span>
                <span class="my-stat-label">온실가스 감축</span>
            </div>
        </div>
    `;

    container.innerHTML = headerHTML + teacherSectionHTML + reportHeaderHTML + reportCardHTML + statsHTML;

    // Trigger the bar-fill height transition after mounting to DOM
    setTimeout(() => {
        const fills = container.querySelectorAll('.bar-fill');
        fills.forEach(fill => {
            const targetHeight = fill.getAttribute('data-height');
            if (targetHeight) {
                fill.style.height = targetHeight;
            }
        });
    }, 50);
}

/**
 * Toggle refrigerator teacher selected ingredient for storage guide
 */
function toggleTeacherIngredient(name) {
    const index = teacherSelectedIngredients.indexOf(name);
    if (index > -1) {
        // Deselect
        teacherSelectedIngredients.splice(index, 1);
        attemptedThirdSelection = false;
    } else {
        // Try to select
        if (!isPremiumUser && teacherSelectedIngredients.length >= 2) {
            attemptedThirdSelection = true;
            showToast('무료 회원은 최대 2개까지만 가이드를 볼 수 있습니다.', '🔒');
        } else {
            teacherSelectedIngredients.push(name);
            attemptedThirdSelection = false;
        }
    }
    
    const contentArea = document.getElementById('content');
    if (contentArea) renderShoppingPage(contentArea);
}

/**
 * Open the Premium Subscription (Fake Door) Modal
 * @param {string} planName 
 * @param {string} price 
 */
function openFakeDoorModal(planName = '월간 프리미엄 멤버십', price = '월 990원') {
    console.log(`[WTP LOG] Premium Subscription ${planName} (${price}) clicked at ` + new Date().toISOString());
    const overlay = document.getElementById('fake-modal-overlay');
    const titleEl = document.getElementById('fake-modal-title');
    const descEl = document.getElementById('fake-modal-desc');
    
    if (titleEl) {
        titleEl.innerHTML = `🛡️ 지불 의사 확인 완료`;
    }
    if (descEl) {
        descEl.innerHTML = `
            선택하신 플랜: <strong style="color: #1A237E; font-size: 12.5px;">${planName} (${price})</strong><br><br>
            현재 베타 테스트 중인 프리미엄 기능입니다.<br>
            소중한 지불 의사 신호가 개발팀 서버에 100% 안전하게 기록되었습니다!<br><br>
            정식 버전 출시 시 최우선 할인 혜택을 보내드리겠습니다. 감사합니다.<br><br>
            <div style="background: rgba(26, 35, 126, 0.05); padding: 12px; border-radius: 12px; border: 1.5px dashed rgba(26, 35, 126, 0.2); margin-top: 10px;">
                <span style="font-size: 12px; font-weight: 800; color: #1A237E; display: block; margin-bottom: 6px;">💡 데모 체험 전용 혜택</span>
                <span style="font-size: 10.5px; color: var(--text-muted); display: block; line-height: 1.45;">아래 버튼을 터치하여 체험용 프리미엄 회원을 활성화하고, <strong>냉장고 선생님 무제한 보관 가이드</strong> 등 프리미엄 혜택을 즉시 체험해 보세요!</span>
            </div>
            
            <button class="btn-fake-confirm" onclick="enableDemoPremium()" style="margin-top: 16px; background: linear-gradient(135deg, #1A237E 0%, #303F9F 100%); color: white; border: none; font-size: 11.5px; font-weight: 800; padding: 12px; border-radius: 12px; cursor: pointer; width: 100%; box-shadow: 0 4px 15px rgba(26, 35, 126, 0.2); transition: transform 0.2s;">
                체험용 프리미엄 무료 활성화하기 🔓
            </button>
            <button class="btn-fake-confirm" onclick="closeFakeDoorModal()" style="margin-top: 8px; background: rgba(0,0,0,0.06); color: #37474F; border: none; font-size: 11px; font-weight: 700; padding: 8px; border-radius: 10px; cursor: pointer; width: 100%;">
                닫기
            </button>
        `;
    }
    
    if (overlay) {
        overlay.classList.add('active');
    }
}

/**
 * Close the Premium Subscription (Fake Door) Modal
 */
function closeFakeDoorModal() {
    const overlay = document.getElementById('fake-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

/**
 * Enable demo premium status and refresh UI
 */
function enableDemoPremium() {
    isPremiumUser = true;
    localStorage.setItem('moeatzy_is_premium', 'true');
    attemptedThirdSelection = false;
    closeFakeDoorModal();
    
    // Show premium confirmation notification
    alert('체험용 프리미엄 회원이 성공적으로 활성화되었습니다! 👑\n\n냉장고 선생님 보관 가이드 및 맞춤 설정이 무제한으로 연동됩니다.');
    
    // Switch to active tab to refresh layout
    switchTab(currentTab);
}

/**
 * Disable demo premium status and refresh UI
 */
function disableDemoPremium() {
    isPremiumUser = false;
    localStorage.setItem('moeatzy_is_premium', 'false');
    attemptedThirdSelection = false;
    
    alert('체험용 프리미엄 멤버십이 해지되었습니다. 🥛\n\n무료 회원 락 상태로 무결하게 롤백 완료되었습니다.');
    
    // Switch to active tab to refresh layout
    switchTab(currentTab);
}

/**
 * Render the premium glassmorphic My Page (Phase 5)
 * @param {HTMLElement} container 
 */
function renderMyPage(container) {
    // 1. Header Information
    const headerHTML = `
        <h2 class="page-title">마이 모잇지</h2>
        <p class="page-subtitle">개인화 서비스 구독 정보 및 활동 등급을 관리합니다.</p>
    `;

    // 2. Profile Card
    const profileCardHTML = `
        <div class="profile-card">
            <div class="profile-header">
                <div class="profile-avatar">👤</div>
                <div class="profile-info">
                    <div class="profile-name-row">
                        <span class="profile-name">김지은님 ${isPremiumUser ? '👑' : ''}</span>
                        <span class="profile-badge">${isPremiumUser ? '프리미엄 요리 메이트' : '식재료 수호자 Lv.2'}</span>
                    </div>
                    <span class="profile-status">지구를 구하는 1인 가구 셰프</span>
                </div>
            </div>
            
            <div class="profile-level-container">
                <div class="profile-level-label">
                    <span>구출 레벨 진행도</span>
                    <span>320 / 500 XP (65%)</span>
                </div>
                <div class="profile-level-bar">
                    <div class="profile-level-fill"></div>
                </div>
            </div>
        </div>
    `;

    // 3. Premium Subscription Plan Card
    const subscriptionHTML = `
        <h3 class="section-sub-title">✨ 프리미엄 요리 메이트 구독</h3>
        <div class="my-subscription-card">
            <div class="sub-card-header">
                <span class="sub-premium-badge">PREMIUM</span>
                <h4 class="sub-card-title">모잇지 프리미엄 멤버십</h4>
                <p class="sub-card-desc">냉장고 선생님 무제한 보관 가이드 및 초개인화 맞춤 레시피를 무제한으로 제공합니다.</p>
            </div>
            
            <div class="sub-tiers-container">
                <div class="sub-tier-option ${selectedSubscriptionTier === 'monthly' ? 'active' : ''}" id="sub-tier-monthly" onclick="selectSubTier('monthly')">
                    <div class="tier-radio">
                        <div class="tier-radio-inner"></div>
                    </div>
                    <div class="tier-info">
                        <span class="tier-name">월간 요리 메이트 플랜</span>
                        <span class="tier-price">월 990원</span>
                    </div>
                    <span class="tier-badge">실속파 추천</span>
                </div>
                
                <div class="sub-tier-option ${selectedSubscriptionTier === 'yearly' ? 'active' : ''}" id="sub-tier-yearly" onclick="selectSubTier('yearly')">
                    <div class="tier-radio">
                        <div class="tier-radio-inner"></div>
                    </div>
                    <div class="tier-info">
                        <span class="tier-name">연간 요리 메이트 플랜</span>
                        <span class="tier-price">연 9,900원</span>
                    </div>
                    <span class="tier-badge discount">16% 할인</span>
                </div>
            </div>

            <div class="sub-benefits-list">
                <div class="sub-benefit-item">
                    <span class="sub-benefit-icon">🧠</span>
                    <div class="sub-benefit-text">
                        <span class="benefit-title">무제한 AI 초개인화 레시피 추천</span>
                        <span class="benefit-desc">나의 가구 수, 선호 맵기, 알레르기 제약을 100% 반영한 맞춤 레시피를 무제한으로 받아보세요.</span>
                    </div>
                </div>
                <div class="sub-benefit-item">
                    <span class="sub-benefit-icon">👨‍🏫</span>
                    <div class="sub-benefit-text">
                        <span class="benefit-title">냉장고 선생님 무제한 보관 가이드</span>
                        <span class="benefit-desc">냉장고 속 재료의 수명을 늘리는 온도·습도 맞춤형 신선도 보관 비법을 제한 없이 무제한으로 학습하세요.</span>
                    </div>
                </div>
                <div class="sub-benefit-item">
                    <span class="sub-benefit-icon">🚨</span>
                    <div class="sub-benefit-text">
                        <span class="benefit-title">유통기한 임박 긴급 카카오 푸시 알림</span>
                        <span class="benefit-desc">식재료 유통기한이 다가오기 전에 알림을 받아 아까운 음식을 제때 구출할 수 있어요.</span>
                    </div>
                </div>
            </div>
            
            ${isPremiumUser ? `
                <button class="btn-sub-trigger cancel" onclick="disableDemoPremium()" style="background: linear-gradient(135deg, #78909C 0%, #546E7A 100%); box-shadow: 0 4px 15px rgba(84, 110, 122, 0.2);">구독 해지하기 (체험용)</button>
            ` : `
                <button class="btn-sub-trigger" onclick="triggerSubscription()">구독 시작하기</button>
            `}
        </div>
    `;

    // 4. Future Roadmap Banner
    const roadmapHTML = `
        <div class="roadmap-banner">
            <span class="roadmap-icon">🔔</span>
            <div class="roadmap-info">
                <span class="roadmap-title">가족 공유 및 알림 연동 (개발 예정)</span>
                <span class="roadmap-desc">식재료 유통기한 만료 24시간 전 푸시 알림 및 가족 구성원 냉장고 통합 관리 기능이 준비 중입니다.</span>
            </div>
        </div>
    `;

    container.innerHTML = headerHTML + profileCardHTML + subscriptionHTML + roadmapHTML;
}

/**
 * Toggles preference active state chip on click
 * @param {HTMLElement} element 
 */
function togglePreferenceChip(element) {
    if (!element) return;
    element.classList.toggle('active');
    
    // Play subtle audio-like click micro-interaction console log
    const name = element.innerText.trim();
    const isActive = element.classList.contains('active');
    console.log(`[MoEatzy preference] Toggled: "${name}" -> ${isActive ? 'ON' : 'OFF'}`);
}

// Premium Subscription tier state and click handlers
let selectedSubscriptionTier = 'monthly';

/**
 * Handle subscription tier selection card clicks
 * @param {string} tier 'monthly' | 'yearly'
 */
function selectSubTier(tier) {
    selectedSubscriptionTier = tier;
    console.log(`[MoEatzy subscription] Selected tier: ${tier}`);
    
    const monthlyBtn = document.getElementById('sub-tier-monthly');
    const yearlyBtn = document.getElementById('sub-tier-yearly');
    
    if (monthlyBtn && yearlyBtn) {
        if (tier === 'monthly') {
            monthlyBtn.classList.add('active');
            yearlyBtn.classList.remove('active');
        } else {
            monthlyBtn.classList.remove('active');
            yearlyBtn.classList.add('active');
        }
    }
}

/**
 * Trigger mock premium subscription checkout overlay
 */
function triggerSubscription() {
    if (selectedSubscriptionTier === 'monthly') {
        openFakeDoorModal('월간 요리 메이트 플랜', '월 990원');
    } else {
        openFakeDoorModal('연간 요리 메이트 플랜', '연 9,900원');
    }
}

let showPreferenceSaveSuccess = false; // Flag to show green banner on save

/**
 * Render the dedicated Preferences Page (Phase 5/6)
 * @param {HTMLElement} container 
 */
function renderPreferencesPage(container) {
    // Initialize temporary state as a deep copy of userPreferencesState if it's null
    if (tempPreferencesState === null) {
        tempPreferencesState = JSON.parse(JSON.stringify(userPreferencesState));
    }

    const headerHTML = `
        <h2 class="page-title">⚙️ 식생활 맞춤 설정</h2>
        <p class="page-subtitle">나의 가구 구성, 식습관 선호도, 알레르기를 설정하여 안전하고 딱 맞는 레시피를 추천 받습니다.</p>
    `;

    const bodyHTML = `
        <div class="preferences-container">
            <!-- 1. Household Size Card -->
            <div class="pref-card">
                <h3 class="pref-card-title">🏠 가구 구성</h3>
                <p class="pref-card-desc">가구 규모에 맞춰 최적화된 식재료 단위와 레시피 분량을 조절합니다.</p>
                <div class="pref-toggle-group">
                    <button class="pref-toggle-btn ${tempPreferencesState.householdSize === '1인 가구' ? 'active' : ''}" onclick="updateTempPreferenceField('householdSize', '1인 가구')">1인 가구</button>
                    <button class="pref-toggle-btn ${tempPreferencesState.householdSize === '2인 가구' ? 'active' : ''}" onclick="updateTempPreferenceField('householdSize', '2인 가구')">2인 가구</button>
                    <button class="pref-toggle-btn ${tempPreferencesState.householdSize === '3인 이상' ? 'active' : ''}" onclick="updateTempPreferenceField('householdSize', '3인 이상')">3인 이상</button>
                </div>
            </div>

            <!-- 2. Diet Type Card -->
            <div class="pref-card">
                <h3 class="pref-card-title">🌱 식생활 유형</h3>
                <p class="pref-card-desc">나만의 특별한 식단 지향점을 설정하여 식문화를 조율합니다.</p>
                <div class="pref-toggle-grid">
                    <button class="pref-toggle-btn ${tempPreferencesState.dietType === '일반식' ? 'active' : ''}" onclick="updateTempPreferenceField('dietType', '일반식')">🥩 일반식</button>
                    <button class="pref-toggle-btn ${tempPreferencesState.dietType === '비건' ? 'active' : ''}" onclick="updateTempPreferenceField('dietType', '비건')">🥬 비건</button>
                    <button class="pref-toggle-btn ${tempPreferencesState.dietType === '락토-오보' ? 'active' : ''}" onclick="updateTempPreferenceField('dietType', '락토-오보')">🍳 락토-오보</button>
                    <button class="pref-toggle-btn ${tempPreferencesState.dietType === '키토/저탄고지' ? 'active' : ''}" onclick="updateTempPreferenceField('dietType', '키토/저탄고지')">🥑 키토/저탄고지</button>
                    <button class="pref-toggle-btn ${tempPreferencesState.dietType === '저당/다이어트' ? 'active' : ''}" onclick="updateTempPreferenceField('dietType', '저당/다이어트')">🥗 저당/다이어트</button>
                    <button class="pref-toggle-btn ${tempPreferencesState.dietType === '글루텐프리' ? 'active' : ''}" onclick="updateTempPreferenceField('dietType', '글루텐프리')">🌾 글루텐프리</button>
                </div>
            </div>

            <!-- 3. Spiciness Card -->
            <div class="pref-card">
                <h3 class="pref-card-title">🔥 선호 맵기</h3>
                <p class="pref-card-desc">조리 시 고춧가루, 후추 등의 강도를 맞춰 드립니다.</p>
                <div class="pref-toggle-grid" style="grid-template-columns: repeat(2, 1fr);">
                    <button class="pref-toggle-btn ${tempPreferencesState.spiciness === '아주순한맛' ? 'active' : ''}" onclick="updateTempPreferenceField('spiciness', '아주순한맛')">👶 아주순한맛</button>
                    <button class="pref-toggle-btn ${tempPreferencesState.spiciness === '순한맛' ? 'active' : ''}" onclick="updateTempPreferenceField('spiciness', '순한맛')">🥛 순한맛</button>
                    <button class="pref-toggle-btn ${tempPreferencesState.spiciness === '보통' ? 'active' : ''}" onclick="updateTempPreferenceField('spiciness', '보통')">🌶️ 보통</button>
                    <button class="pref-toggle-btn ${tempPreferencesState.spiciness === '매운맛' ? 'active' : ''}" onclick="updateTempPreferenceField('spiciness', '매운맛')">🔥 매운맛</button>
                </div>
            </div>

            <!-- 4. Lactose Intolerance Card -->
            <div class="pref-card">
                <h3 class="pref-card-title">🥛 유당 소화능력</h3>
                <p class="pref-card-desc">우유, 버터, 크림 등 유제품 섭취 시 민감도를 조절합니다.</p>
                <div class="pref-toggle-group">
                    <button class="pref-toggle-btn ${!tempPreferencesState.lactoseIntolerant ? 'active' : ''}" onclick="updateTempPreferenceField('lactoseIntolerant', false)">소화 원활</button>
                    <button class="pref-toggle-btn ${tempPreferencesState.lactoseIntolerant ? 'active' : ''}" onclick="updateTempPreferenceField('lactoseIntolerant', true)">🥛 유당 불내증 있음</button>
                </div>
            </div>

            <!-- 5. Allergens Card -->
            <div class="pref-card">
                <h3 class="pref-card-title">🛡️ 알레르기 및 기피 재료</h3>
                <p class="pref-card-desc">체크한 성분이나 식재료는 AI가 레시피 추천 시 철저하게 제외시킵니다.</p>
                
                <div class="pref-allergy-grid">
                    <button class="pref-allergy-chip ${tempPreferencesState.allergies.nuts ? 'active' : ''}" onclick="toggleTempPreferenceAllergen('nuts')">
                        <span class="chip-icon">🥜</span> 견과류
                    </button>
                    <button class="pref-allergy-chip ${tempPreferencesState.allergies.meat ? 'active' : ''}" onclick="toggleTempPreferenceAllergen('meat')">
                        <span class="chip-icon">🥩</span> 육류 기피
                    </button>
                    <button class="pref-allergy-chip ${tempPreferencesState.allergies.veggies ? 'active' : ''}" onclick="toggleTempPreferenceAllergen('veggies')">
                        <span class="chip-icon">🥒</span> 채소류 기피
                    </button>
                    <button class="pref-allergy-chip ${tempPreferencesState.allergies.other ? 'active' : ''}" onclick="toggleTempPreferenceAllergen('other')">
                        <span class="chip-icon">🔍</span> 기타
                    </button>
                </div>

                <!-- Sub segment: Veggies allergy text input -->
                <div class="pref-sub-section ${tempPreferencesState.allergies.veggies ? 'expanded' : ''}" id="section-allergy-veggies">
                    <label class="pref-sub-label">⚠️ 기피하거나 알레르기가 있는 채소를 입력하세요:</label>
                    <input type="text" class="pref-text-input" placeholder="예: 오이, 가지, 당근 (쉼표로 구분)" value="${tempPreferencesState.allergyVeggiesInput}" oninput="updateTempPreferenceTextInput('allergyVeggiesInput', this.value)">
                </div>

                <!-- Sub segment: Other allergy text input -->
                <div class="pref-sub-section ${tempPreferencesState.allergies.other ? 'expanded' : ''}" id="section-allergy-other">
                    <label class="pref-sub-label">🔍 기타 제외를 원하는 재료를 적어주세요:</label>
                    <input type="text" class="pref-text-input" placeholder="예: 복숭아, 고수 (쉼표로 구분)" value="${tempPreferencesState.allergyOtherInput}" oninput="updateTempPreferenceTextInput('allergyOtherInput', this.value)">
                </div>
            </div>
            
            ${showPreferenceSaveSuccess ? `
                <div class="pref-save-banner" style="animation: slide-in 0.3s ease-out; background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); border: 1px solid #4CAF50; color: #2E7D32;">
                    <span class="save-status-icon">✨</span> 맞춤 설정이 성공적으로 저장되었습니다! 💾
                </div>
            ` : `
                <div class="pref-save-banner" style="background: rgba(0, 0, 0, 0.04); color: var(--text-muted); border: 1px solid rgba(0,0,0,0.06);">
                    <span class="save-status-icon">💡</span> 설정을 조정한 후 아래 저장 버튼을 꼭 눌러주세요.
                </div>
            `}

            <!-- 6. Save Form Button -->
            <button class="btn-save-preferences" onclick="savePreferencesForm()">
                💾 맞춤 설정 저장하기
            </button>
        </div>
    `;

    container.innerHTML = headerHTML + bodyHTML;
}

/**
 * Update temporary preferences field and render
 */
function updateTempPreferenceField(field, value) {
    if (tempPreferencesState === null) {
        tempPreferencesState = JSON.parse(JSON.stringify(userPreferencesState));
    }
    tempPreferencesState[field] = value;
    showPreferenceSaveSuccess = false;
    const contentArea = document.getElementById('content');
    renderPreferencesPage(contentArea);
}

/**
 * Toggle temporary preferences allergens
 */
function toggleTempPreferenceAllergen(allergen) {
    if (tempPreferencesState === null) {
        tempPreferencesState = JSON.parse(JSON.stringify(userPreferencesState));
    }
    tempPreferencesState.allergies[allergen] = !tempPreferencesState.allergies[allergen];
    showPreferenceSaveSuccess = false;
    const contentArea = document.getElementById('content');
    renderPreferencesPage(contentArea);
}

/**
 * Update temporary preferences text input silently (avoid focus steal)
 */
function updateTempPreferenceTextInput(field, value) {
    if (tempPreferencesState === null) {
        tempPreferencesState = JSON.parse(JSON.stringify(userPreferencesState));
    }
    tempPreferencesState[field] = value;
    showPreferenceSaveSuccess = false;
}

/**
 * Commit draft temporary preferences state to permanent state & localStorage
 */
function savePreferencesForm() {
    if (tempPreferencesState === null) return;
    
    // Copy temp state to master preference state
    userPreferencesState = JSON.parse(JSON.stringify(tempPreferencesState));
    saveUserPreferences();
    
    showPreferenceSaveSuccess = true;
    const contentArea = document.getElementById('content');
    renderPreferencesPage(contentArea);
    
    // Cleanly disappear success message after 3 seconds
    setTimeout(() => {
        showPreferenceSaveSuccess = false;
        if (currentTab === 'preferences') {
            const contentArea = document.getElementById('content');
            if (contentArea) renderPreferencesPage(contentArea);
        }
    }, 3000);
}
