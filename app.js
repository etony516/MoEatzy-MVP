// ==========================================================================
// MoEatzy - Application Controller (SPA, AI Scan, & Recipe Rescue Integration)
// ==========================================================================

// Application State
let currentTab = 'inventory';
let activeFilter = 'dday'; // 'dday' | 'category' | 'location'
let isAlreadyScanned = false; // Scan lock flag
let activeRescueRecipe = null; // Storing active recipe for subtraction

/**
 * Switch between bottom navigation tabs
 * @param {string} tabName 
 */
function switchTab(tabName) {
    currentTab = tabName;
    console.log(`[MoEatzy] Switched to tab: ${tabName}`);
    
    // 1. Control Header Scan Button Visibility based on Tab
    const scanBtn = document.getElementById('header-scan-btn');
    if (scanBtn) {
        if (tabName === 'inventory') {
            scanBtn.style.display = 'flex';
        } else {
            scanBtn.style.display = 'none';
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

/**
 * Sorts and draws ingredients based on the selected filter
 */
function renderSortedIngredients() {
    const listContainer = document.getElementById('inventory-list');
    if (!listContainer) return;
    
    // Clone original data to avoid mutation side effects
    let itemsToRender = [...ingredients];
    
    // Sort according to activeFilter
    if (activeFilter === 'dday') {
        itemsToRender.sort((a, b) => a.dday - b.dday);
    } else if (activeFilter === 'category') {
        itemsToRender.sort((a, b) => a.category.localeCompare(b.category));
    } else if (activeFilter === 'location') {
        itemsToRender.sort((a, b) => a.location.localeCompare(b.location));
    }
    
    listContainer.innerHTML = ''; // Clear prior items
    
    if (itemsToRender.length === 0) {
        listContainer.innerHTML = `
            <div class="placeholder-container">
                <span class="placeholder-icon">📭</span>
                <h3 class="placeholder-title">냉장고가 비어있습니다</h3>
                <p class="placeholder-desc">상단의 스캔 기능을 이용해 식재료를 채워보세요!</p>
            </div>
        `;
        return;
    }
    
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
            title = '스마트 바잉 & 리포트';
            subtitle = '이번 달 절약 효과를 파악하고, 현명한 소비 계획을 세웁니다.';
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
                <h3 class="fake-modal-title">지불 의사 신호 전송 성공 (Signal Logged)</h3>
                <p class="fake-modal-desc">
                    현재 베타 테스트 중인 프리미엄 기능입니다.<br>
                    소중한 지불 의사 신호가 개발팀 서버에 100% 안전하게 기록되었습니다!<br><br>
                    정식 버전 출시 시 최우선 할인 혜택을 보내드리겠습니다. 감사합니다.
                </p>
                <button class="btn-fake-confirm" onclick="closeFakeDoorModal()">확인</button>
            </div>
        </div>
    `;
    appEl.insertAdjacentHTML('beforeend', fakeModalHTML);
}

/**
 * Open the Smart Scan Modal
 */
function openScanModal() {
    if (isAlreadyScanned) {
        showToast('이미 냉장고 식재료 스캔이 완료되었습니다!', 'ℹ️');
        return;
    }

    const overlay = document.getElementById('scan-modal-overlay');
    if (overlay) {
        document.getElementById('modal-initial-view').style.display = 'block';
        document.getElementById('modal-loading-view').style.display = 'none';
        
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
            
            ingredients.push(...mockScanResult);
            isAlreadyScanned = true;

            const scanBtn = document.getElementById('header-scan-btn');
            if (scanBtn) {
                scanBtn.classList.add('scanned');
                scanBtn.innerHTML = '<span class="scan-btn-icon">✅</span><span class="scan-btn-text">스캔 완료</span>';
            }

            setTimeout(() => {
                closeScanModal();
                
                if (currentTab === 'inventory') {
                    renderInventory(document.getElementById('content'));
                }
                
                showToast('장보기 내역 3건이 입력되었습니다! (새송이버섯, 우유, 베이컨)', '🎉');
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
// Phase 3: AI Recipe Matched Renderer & Confetti Physics Mechanics
// ==========================================================================

/**
 * Render matched recipes or an elegant empty placeholder
 * @param {HTMLElement} container 
 */
function renderRecipePage(container) {
    const headerHTML = `
        <h2 class="page-title">AI 현실형 레시피</h2>
        <p class="page-subtitle">냉장고에 부재료 매수 없이, 오직 현재 있는 식재료만으로 100% 만드는 15분 식탁.</p>
    `;

    // 1. Scan available matching recipes
    const matchedRecipes = recipes.filter(recipe => {
        return recipe.ingredients.every(reqName => {
            return ingredients.some(myIng => myIng.name === reqName);
        });
    });

    let listHTML = '';

    if (matchedRecipes.length === 0) {
        listHTML = `
            <div class="placeholder-container" style="min-height: 250px; margin-top: 10px;">
                <span class="placeholder-icon">🥣</span>
                <h3 class="placeholder-title">구출 가능한 레시피가 없습니다</h3>
                <p class="placeholder-desc">현재 보유 중인 재료(대파, 계란 등)가 소모되어 조리 가능한 요리가 없습니다. 상단 스캔 버튼을 눌러 새 식재료를 채워보세요!</p>
            </div>
        `;
    } else {
        listHTML = `<div class="recipe-list">`;
        matchedRecipes.forEach((recipe, rIdx) => {
            listHTML += `
                <div class="recipe-card" style="animation-delay: ${rIdx * 0.1}s">
                    <div class="recipe-card-header">
                        <span class="recipe-title">${recipe.title}</span>
                        <div class="recipe-meta-badges">
                            <span class="recipe-meta-badge">⚡ ${recipe.time}</span>
                            <span class="recipe-meta-badge">🔥 ${recipe.difficulty}</span>
                        </div>
                    </div>
                    
                    <div class="recipe-ingredients-required">
                        <span class="recipe-ing-title">구출 대상 식재료</span>
                        ${recipe.ingredients.map(ingName => {
                            const matchedIng = ingredients.find(i => i.name === ingName);
                            const emoji = matchedIng ? matchedIng.emoji : '🥬';
                            return `<span class="recipe-ing-tag">${emoji} ${ingName}</span>`;
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
                        <button class="btn-rescue-success" onclick="executeRescue('${recipe.title}')">
                            🎉 식재료 구출 성공 (취식)
                        </button>
                        <button class="btn-rescue-fail" onclick="executeDiscard('${recipe.title}')">
                            🗑️ 구출 실패 (폐기)
                        </button>
                    </div>
                </div>
            `;
        });
        listHTML += `</div>`;
    }

    container.innerHTML = headerHTML + listHTML;
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
document.addEventListener('DOMContentLoaded', () => {
    console.log('[MoEatzy] App bootstrap initialized.');
    
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
        <h2 class="page-title">스마트 바잉 & 리포트</h2>
        <p class="page-subtitle">이번 달 식재료 구출로 아낀 예산과 탄소 발자국 절감액을 한눈에 체감하세요.</p>
    `;

    // 2. Savings Report Card
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

    // 3. Locked E-Commerce Basket Section
    const lockedSectionHTML = `
        <div class="locked-buying-section">
            <h3 class="section-head-title">AI 스마트 바잉 큐레이션</h3>
            
            <!-- Free Preview Item (Fully Visible) -->
            <div class="mock-shop-card" style="margin-bottom: 12px; border: 1px solid rgba(144, 202, 249, 0.3); background: rgba(227, 242, 253, 0.15);">
                <div class="mock-shop-left">
                    <span class="mock-shop-emoji">🥬</span>
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span class="mock-shop-name" style="display: flex; align-items: center; gap: 6px;">
                            친환경 대파 1단
                            <span style="font-size: 8px; font-weight: 800; background: #E8F5E9; color: #2E7D32; padding: 1px 5px; border-radius: 6px; border: 1px solid rgba(46, 125, 50, 0.15)">무료체험</span>
                        </span>
                        <span style="font-size: 9px; color: var(--text-muted);">남은 대파 D-1 구출 최저가 연동</span>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
                    <span class="mock-shop-right">3,200원</span>
                    <span style="font-size: 8.5px; font-weight: 700; color: #E91E63; background: #FFEBEE; padding: 1px 4px; border-radius: 4px;">최저가 보장</span>
                </div>
            </div>
            
            <!-- Blur Area containing the rest of the cards -->
            <div class="locked-blur-area" style="margin-top: 8px;">
                <div class="mock-shop-card">
                    <div class="mock-shop-left">
                        <span class="mock-shop-emoji">🥚</span>
                        <span class="mock-shop-name">신선 특란 10구</span>
                        <span class="mock-shop-mall">쿠팡프레시</span>
                    </div>
                    <span class="mock-shop-right">4,500원</span>
                </div>
                <div class="mock-shop-card">
                    <div class="mock-shop-left">
                        <span class="mock-shop-emoji">🧈</span>
                        <span class="mock-shop-name">국산 단단한 두부 1모</span>
                        <span class="mock-shop-mall">이마트몰</span>
                    </div>
                    <span class="mock-shop-right">2,100원</span>
                </div>
            </div>
            
            <!-- Lock Floating Card on top of the blur area -->
            <div class="lock-floating-card">
                <span class="lock-badge-icon">🔒</span>
                <h4 class="lock-card-title">AI 스마트 바잉 엔진 잠금</h4>
                <p class="lock-card-desc">
                    현재 냉장고에 남은 재료와 딱 연동되는 가장 저렴한 마켓 장바구니 묶음을 1초 만에 구성합니다.
                </p>
                <button class="btn-premium-unlock" onclick="openFakeDoorModal()">
                    월 990원에 AI 바잉 엔진 잠금 해제하기
                </button>
            </div>
        </div>
    `;

    container.innerHTML = headerHTML + reportCardHTML + lockedSectionHTML;

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
 * Open the Premium Subscription (Fake Door) Modal
 */
function openFakeDoorModal() {
    console.log("[WTP LOG] Premium Subscription 990 KRW clicked at " + new Date().toISOString());
    const overlay = document.getElementById('fake-modal-overlay');
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
 * Render the premium glassmorphic My Page (Phase 5)
 * @param {HTMLElement} container 
 */
function renderMyPage(container) {
    // 1. Header Information
    const headerHTML = `
        <h2 class="page-title">마이 모잇지</h2>
        <p class="page-subtitle">개인화 설정과 그동안 식재료를 수호하며 얻은 친환경 기여도를 관리합니다.</p>
    `;

    // 2. Profile Card
    const profileCardHTML = `
        <div class="profile-card">
            <div class="profile-header">
                <div class="profile-avatar">👤</div>
                <div class="profile-info">
                    <div class="profile-name-row">
                        <span class="profile-name">김지은님</span>
                        <span class="profile-badge">식재료 수호자 Lv.2</span>
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

    // 3. User Preferences Toggle Chips
    const preferencesHTML = `
        <h3 class="section-sub-title">⚙️ 맞춤 식생활 설정</h3>
        <div class="preference-toggle-group">
            <button class="toggle-chip active" onclick="togglePreferenceChip(this)">
                <span>🏠</span> 1인 가구
            </button>
            <button class="toggle-chip" onclick="togglePreferenceChip(this)">
                <span>🌱</span> 채식 지향
            </button>
            <button class="toggle-chip active" onclick="togglePreferenceChip(this)">
                <span>🔥</span> 매운맛 선호
            </button>
            <button class="toggle-chip" onclick="togglePreferenceChip(this)">
                <span>🥜</span> 견과류 알레르기
            </button>
            <button class="toggle-chip" onclick="togglePreferenceChip(this)">
                <span>🥛</span> 유당 불내증
            </button>
        </div>
    `;

    // 4. Cumulative Achievement Stats
    const statsHTML = `
        <h3 class="section-sub-title">🏆 누적 식재료 구출 업적</h3>
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

    // 5. Future Roadmap Banner
    const roadmapHTML = `
        <div class="roadmap-banner">
            <span class="roadmap-icon">🔔</span>
            <div class="roadmap-info">
                <span class="roadmap-title">가족 공유 및 알림 연동 (개발 예정)</span>
                <span class="roadmap-desc">식재료 유통기한 만료 24시간 전 푸시 알림 및 가족 구성원 냉장고 통합 관리 기능이 준비 중입니다.</span>
            </div>
        </div>
    `;

    container.innerHTML = headerHTML + profileCardHTML + preferencesHTML + statsHTML + roadmapHTML;
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
