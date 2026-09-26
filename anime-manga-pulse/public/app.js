/**
 * NIJI ANIME & MANGA PULSE - CLIENT APPLICATION CONTROLLER
 * Reactive Frontend for Daily Updates, Schedule, Watchlist & Anti-AI Defense
 */

(function () {
    'use strict';

    // Application State
    const state = {
        updates: [],
        schedule: {},
        watchlist: JSON.parse(localStorage.getItem('niji_watchlist') || '[]'),
        activeTab: 'all-feed',
        activeSource: 'all',
        activeCategory: 'all',
        activeFranchise: 'all',
        searchQuery: '',
        sortBy: 'latest',
        activeDay: 'Sunday'
    };

    // DOM Elements Cache
    const el = {
        grid: document.getElementById('updates-grid'),
        loader: document.getElementById('feed-loader'),
        emptyState: document.getElementById('empty-state'),
        searchInput: document.getElementById('global-search-input'),
        clearSearchBtn: document.getElementById('clear-search-btn'),
        watchlistCount: document.getElementById('watchlist-count'),
        viewTitle: document.getElementById('current-view-title'),
        viewSubtitle: document.getElementById('current-view-subtitle'),
        heroBanner: document.getElementById('hero-banner'),
        feedSection: document.getElementById('feed-view-section'),
        scheduleSection: document.getElementById('schedule-view-section'),
        watchlistSection: document.getElementById('watchlist-view-section'),
        scheduleList: document.getElementById('schedule-list-container'),
        scheduleDaysBar: document.getElementById('schedule-days-bar'),
        watchlistGrid: document.getElementById('watchlist-grid'),
        jstClock: document.getElementById('jst-clock'),
        toastContainer: document.getElementById('toast-container'),
        // Modals
        detailModal: document.getElementById('detail-modal'),
        detailModalBody: document.getElementById('detail-modal-body'),
        postModal: document.getElementById('post-modal'),
        postForm: document.getElementById('post-update-form'),
        shieldModal: document.getElementById('shield-modal'),
        blockedLogBody: document.getElementById('blocked-log-body'),
        modalBlockedCount: document.getElementById('modal-blocked-count'),
        navBlockedCount: document.getElementById('nav-blocked-count'),
        // Stats
        statTotal: document.getElementById('stat-total-updates'),
        statAnime: document.getElementById('stat-anime-count'),
        statManga: document.getElementById('stat-manga-count'),
        statLeak: document.getElementById('stat-leak-count'),
        statBlockedAI: document.getElementById('stat-blocked-ai')
    };

    // Rainbow Card Theme Mappings
    const RAINBOW_ACCENTS = {
        'One Piece': 'linear-gradient(90deg, #ff1744, #ff6d00)',
        'Jujutsu Kaisen': 'linear-gradient(90deg, #00b0ff, #651fff)',
        'Chainsaw Man': 'linear-gradient(90deg, #ff1744, #ffd600)',
        'Bleach': 'linear-gradient(90deg, #651fff, #d500f9)',
        'Demon Slayer': 'linear-gradient(90deg, #00e676, #00b0ff)',
        'Solo Leveling': 'linear-gradient(90deg, #00b0ff, #d500f9)',
        'Hunter x Hunter': 'linear-gradient(90deg, #ffd600, #00e676)',
        'Kagurabachi': 'linear-gradient(90deg, #ff6d00, #ff1744)',
        'Sakamoto Days': 'linear-gradient(90deg, #00e676, #ffd600)',
        'DanDaDan': 'linear-gradient(90deg, #d500f9, #ff1744)',
        'Frieren': 'linear-gradient(90deg, #00b0ff, #00e676)',
        'Berserk': 'linear-gradient(90deg, #651fff, #ff1744)'
    };

    // ==========================================================================
    // INITIALIZATION & DATA FETCHING
    // ==========================================================================
    async function initApp() {
        startJstClock();
        setupEventListeners();
        updateWatchlistBadge();
        
        await Promise.all([
            fetchUpdates(),
            fetchSchedule(),
            fetchStats()
        ]);
        
        // Auto-detect current weekday for schedule
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayDay = days[new Date().getDay()];
        state.activeDay = todayDay;
        highlightActiveDayButton(todayDay);
    }

    async function fetchUpdates() {
        showLoader(true);
        try {
            const res = await fetch('/api/updates');
            if (res.ok) {
                state.updates = await res.json();
                renderFilteredUpdates();
            }
        } catch (err) {
            console.error('Failed to load updates:', err);
            showToast('⚠️ Could not connect to update stream', 'red');
        } finally {
            showLoader(false);
        }
    }

    async function fetchSchedule() {
        try {
            const res = await fetch('/api/schedule');
            if (res.ok) {
                state.schedule = await res.json();
                renderSchedule(state.activeDay);
            }
        } catch (err) {
            console.error('Failed to load schedule:', err);
        }
    }

    async function fetchStats() {
        try {
            const res = await fetch('/api/stats');
            if (res.ok) {
                const data = await res.json();
                if (el.statTotal) el.statTotal.textContent = data.total_updates;
                if (el.statAnime) el.statAnime.textContent = data.anime_count;
                if (el.statManga) el.statManga.textContent = data.manga_count;
                if (el.statLeak) el.statLeak.textContent = data.unofficial_count;
                if (el.statBlockedAI) el.statBlockedAI.textContent = data.ai_bots_blocked;
                if (el.navBlockedCount) el.navBlockedCount.textContent = `${data.ai_bots_blocked} BLOCKED`;
                if (el.modalBlockedCount) el.modalBlockedCount.textContent = data.ai_bots_blocked;
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    }

    // ==========================================================================
    // FILTERING & RENDERING ENGINE
    // ==========================================================================
    function getFilteredUpdates() {
        let list = [...state.updates];

        // 1. Navigation Tab Filtering
        if (state.activeTab === 'anime-wire') {
            list = list.filter(u => u.type === 'anime');
        } else if (state.activeTab === 'manga-radar') {
            list = list.filter(u => u.type === 'manga');
        } else if (state.activeTab === 'leaks-rumors') {
            list = list.filter(u => u.status === 'unofficial');
        }

        // 2. Source Filtering (Official vs Unofficial)
        if (state.activeSource !== 'all') {
            list = list.filter(u => u.status === state.activeSource);
        }

        // 3. Category Filter
        if (state.activeCategory !== 'all') {
            list = list.filter(u => u.category === state.activeCategory);
        }

        // 4. Franchise Filter
        if (state.activeFranchise !== 'all') {
            list = list.filter(u => (u.franchise || '').toLowerCase().includes(state.activeFranchise.toLowerCase()));
        }

        // 5. Search Query
        if (state.searchQuery) {
            const q = state.searchQuery.toLowerCase();
            list = list.filter(u => 
                (u.title && u.title.toLowerCase().includes(q)) ||
                (u.summary && u.summary.toLowerCase().includes(q)) ||
                (u.franchise && u.franchise.toLowerCase().includes(q)) ||
                (u.source && u.source.toLowerCase().includes(q))
            );
        }

        // 6. Sorting
        if (state.sortBy === 'hot') {
            list.sort((a, b) => (b.views || 0) - (a.views || 0));
        } else if (state.sortBy === 'credibility') {
            list.sort((a, b) => (b.credibility || 0) - (a.credibility || 0));
        } else {
            // Latest by date/time
            list.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
        }

        return list;
    }

    function renderFilteredUpdates() {
        const filtered = getFilteredUpdates();
        renderCardGrid(el.grid, filtered);
    }

    function renderCardGrid(container, items) {
        if (!container) return;
        container.innerHTML = '';

        if (!items || items.length === 0) {
            if (el.emptyState) el.emptyState.style.display = 'block';
            return;
        }

        if (el.emptyState) el.emptyState.style.display = 'none';

        items.forEach(item => {
            const card = createUpdateCard(item);
            container.appendChild(card);
        });
    }

    function createUpdateCard(item) {
        const card = document.createElement('article');
        card.className = 'update-card';

        // Rainbow accent gradient for specific franchise
        const accent = RAINBOW_ACCENTS[item.franchise] || 'var(--gradient-rainbow-linear)';
        card.style.setProperty('--card-rainbow-accent', accent);

        const isBookmarked = state.watchlist.includes(item.id);
        const cred = item.credibility || 85;
        const credColor = cred >= 90 ? 'var(--rainbow-green)' : cred >= 75 ? 'var(--rainbow-yellow)' : 'var(--rainbow-orange)';

        card.innerHTML = `
            <div class="card-top-bar">
                <div class="card-badges-left">
                    <span class="badge-type ${item.type}">${item.type === 'anime' ? '📺 Anime' : '📖 Manga'}</span>
                    <span class="badge-status ${item.status}">
                        ${item.status === 'official' ? '🟢 Official' : '🟡 Unofficial / Leak'}
                    </span>
                    ${item.hot ? '<span class="badge-status" style="background:rgba(255,23,68,0.2);color:#ff1744;border:1px solid rgba(255,23,68,0.4)">🔥 Trending</span>' : ''}
                </div>
                <div class="card-actions-right">
                    <button class="btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" data-id="${item.id}" title="${isBookmarked ? 'Remove bookmark' : 'Save to Watchlist'}">
                        ${isBookmarked ? '★' : '☆'}
                    </button>
                </div>
            </div>

            <div class="card-body">
                <span class="card-franchise-tag">⚡ ${escapeHtml(item.franchise || 'Anime & Manga')}</span>
                <h3 class="card-title" data-id="${item.id}">${escapeHtml(item.title)}</h3>
                <p class="card-summary">${escapeHtml(item.summary)}</p>

                <div class="credibility-box">
                    <div class="credibility-label-row">
                        <span class="credibility-title">Verification Credibility</span>
                        <span class="credibility-value" style="color: ${credColor}">${cred}%</span>
                    </div>
                    <div class="credibility-bar-bg">
                        <div class="credibility-bar-fill" style="width: ${cred}%; background: ${credColor}"></div>
                    </div>
                </div>
            </div>

            <div class="card-footer">
                <div class="card-meta-source">
                    Source: <a href="${escapeHtml(item.source_url || '#')}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.source)}</a>
                </div>
                <div class="card-date-time">${item.date} • ${item.time || 'Today'}</div>
                <button class="btn-read-more" data-id="${item.id}">Read Full Details</button>
            </div>
        `;

        // Event listeners for card clicks
        card.querySelector('.card-title').addEventListener('click', () => openDetailModal(item.id));
        card.querySelector('.btn-read-more').addEventListener('click', () => openDetailModal(item.id));
        
        const bookmarkBtn = card.querySelector('.btn-bookmark');
        bookmarkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleBookmark(item.id);
        });

        return card;
    }

    // ==========================================================================
    // SCHEDULE VIEW CONTROLLER
    // ==========================================================================
    function renderSchedule(day) {
        if (!el.scheduleList) return;
        el.scheduleList.innerHTML = '';

        const dayItems = (state.schedule && state.schedule[day]) || [];
        if (dayItems.length === 0) {
            el.scheduleList.innerHTML = `
                <div class="empty-state-card" style="display:block;">
                    <p>No broadcast releases scheduled for ${day}.</p>
                </div>
            `;
            return;
        }

        dayItems.forEach(item => {
            const row = document.createElement('div');
            row.className = 'schedule-row-card';
            row.innerHTML = `
                <div class="schedule-left">
                    <div class="schedule-time-badge">${item.time}</div>
                    <div>
                        <div class="schedule-title">${escapeHtml(item.title)}</div>
                        <div class="schedule-release-note">${escapeHtml(item.release)}</div>
                    </div>
                </div>
                <div class="schedule-right">
                    <span class="badge-status ${item.official ? 'official' : 'unofficial'}">
                        ${item.official ? '🟢 Confirmed Simulcast' : '🟡 Unofficial Release'}
                    </span>
                </div>
            `;
            el.scheduleList.appendChild(row);
        });
    }

    function highlightActiveDayButton(day) {
        if (!el.scheduleDaysBar) return;
        const btns = el.scheduleDaysBar.querySelectorAll('.day-tab');
        btns.forEach(btn => {
            if (btn.getAttribute('data-day') === day) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // ==========================================================================
    // WATCHLIST CONTROLLER
    // ==========================================================================
    function toggleBookmark(id) {
        const idx = state.watchlist.indexOf(id);
        if (idx > -1) {
            state.watchlist.splice(idx, 1);
            showToast('Item removed from Watchlist', 'yellow');
        } else {
            state.watchlist.push(id);
            showToast('⭐ Saved to Watchlist!', 'green');
        }
        localStorage.setItem('niji_watchlist', JSON.stringify(state.watchlist));
        updateWatchlistBadge();

        // Re-render active view
        if (state.activeTab === 'watchlist') {
            renderWatchlistView();
        } else {
            renderFilteredUpdates();
        }
    }

    function updateWatchlistBadge() {
        if (el.watchlistCount) {
            el.watchlistCount.textContent = state.watchlist.length;
        }
    }

    function renderWatchlistView() {
        if (!el.watchlistGrid) return;
        const savedItems = state.updates.filter(u => state.watchlist.includes(u.id));
        renderCardGrid(el.watchlistGrid, savedItems);
    }

    // ==========================================================================
    // MODAL DIALOGS (DETAILS, POST UPDATE, ANTI-AI SHIELD)
    // ==========================================================================
    function openDetailModal(id) {
        const item = state.updates.find(u => u.id === id);
        if (!item || !el.detailModalBody) return;

        const accent = RAINBOW_ACCENTS[item.franchise] || 'var(--gradient-rainbow-linear)';
        const cred = item.credibility || 90;

        el.detailModalBody.innerHTML = `
            <div style="margin-bottom: 14px;">
                <span class="badge-type ${item.type}">${item.type.toUpperCase()}</span>
                <span class="badge-status ${item.status}" style="margin-left: 6px;">
                    ${item.status === 'official' ? '🟢 Official Press Release' : '🟡 Insider Leak & Rumor'}
                </span>
                <span class="card-franchise-tag" style="margin-left: 10px; font-size: 0.9rem;">⚡ ${escapeHtml(item.franchise)}</span>
            </div>

            <h2 style="font-size: 1.5rem; font-weight: 800; line-height: 1.3; margin-bottom: 16px; color:#fff;">
                ${escapeHtml(item.title)}
            </h2>

            <div style="background: rgba(22, 17, 44, 0.6); padding: 14px 18px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.08); margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
                    <span style="color: var(--text-muted);">Source Verification Credibility:</span>
                    <strong style="color: ${cred >= 90 ? 'var(--rainbow-green)' : 'var(--rainbow-yellow)'}">${cred}% Confirmed</strong>
                </div>
                <div class="credibility-bar-bg">
                    <div class="credibility-bar-fill" style="width:${cred}%; background: ${cred >= 90 ? 'var(--rainbow-green)' : 'var(--rainbow-yellow)'}"></div>
                </div>
                <div style="margin-top: 10px; font-size: 0.8rem; color: var(--text-secondary);">
                    <strong>Primary Source:</strong> ${escapeHtml(item.source)} • <a href="${escapeHtml(item.source_url || '#')}" target="_blank" style="color: var(--rainbow-blue); text-decoration: underline;">Verify Original Source</a>
                </div>
            </div>

            <div style="font-size: 1rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 24px;">
                <p style="font-weight: 600; color: #fff; margin-bottom: 12px; font-size: 1.05rem;">Executive Summary:</p>
                <p style="margin-bottom: 16px;">${escapeHtml(item.summary)}</p>
                <p style="font-weight: 600; color: #fff; margin-bottom: 8px;">Full Analysis & Details:</p>
                <p>${escapeHtml(item.content || item.summary)}</p>
            </div>

            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                    Published: ${item.date} at ${item.time || '10:00 AM JST'}
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-read-more" id="btn-modal-bookmark">
                        ${state.watchlist.includes(item.id) ? '★ Bookmarked' : '☆ Save to Watchlist'}
                    </button>
                    <button class="rainbow-btn" id="btn-modal-share" style="padding: 6px 16px; font-size: 0.82rem;">
                        Copy Link
                    </button>
                </div>
            </div>
        `;

        // Modal Action listeners
        const modalBm = document.getElementById('btn-modal-bookmark');
        if (modalBm) {
            modalBm.addEventListener('click', () => {
                toggleBookmark(item.id);
                modalBm.textContent = state.watchlist.includes(item.id) ? '★ Bookmarked' : '☆ Save to Watchlist';
            });
        }

        const modalShare = document.getElementById('btn-modal-share');
        if (modalShare) {
            modalShare.addEventListener('click', () => {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.origin + '?id=' + item.id);
                    showToast('🔗 Update link copied to clipboard!', 'green');
                }
            });
        }

        if (el.detailModal) el.detailModal.classList.add('active');
    }

    async function openShieldModal() {
        if (!el.shieldModal) return;
        
        try {
            const res = await fetch('/api/blocked-bots');
            if (res.ok) {
                const data = await res.json();
                if (el.modalBlockedCount) el.modalBlockedCount.textContent = data.blocked_count || 412;
                
                if (el.blockedLogBody) {
                    el.blockedLogBody.innerHTML = '';
                    const logs = data.recent_blocked || [];
                    logs.forEach(log => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${log.timestamp || 'Recent'}</td>
                            <td><code>${escapeHtml(log.bot || 'Automated Crawler')}</code></td>
                            <td><span class="tag-red">${escapeHtml(log.reason || 'AI Scraper Blocked')}</span></td>
                        `;
                        el.blockedLogBody.appendChild(tr);
                    });
                }
            }
        } catch (e) {
            console.error('Failed to load shield stats:', e);
        }

        el.shieldModal.classList.add('active');
    }

    // ==========================================================================
    // EVENT LISTENERS & ROUTING
    // ==========================================================================
    function setupEventListeners() {
        // Navigation Menu Tab Buttons
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                switchTab(tab);
            });
        });

        // Source Filter Buttons (All, Official, Unofficial)
        const srcBtns = document.querySelectorAll('.source-btn');
        srcBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                srcBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.activeSource = btn.getAttribute('data-source');
                renderFilteredUpdates();
            });
        });

        // Category Quick Pills
        const catPills = document.querySelectorAll('.cat-pill');
        catPills.forEach(pill => {
            pill.addEventListener('click', () => {
                catPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                state.activeCategory = pill.getAttribute('data-category');
                renderFilteredUpdates();
            });
        });

        // Franchise Selector
        const franchiseSelect = document.getElementById('franchise-selector');
        if (franchiseSelect) {
            franchiseSelect.addEventListener('change', () => {
                state.activeFranchise = franchiseSelect.value;
                renderFilteredUpdates();
            });
        }

        // Search Input (Real-time debounced)
        let searchTimeout;
        if (el.searchInput) {
            el.searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                const query = el.searchInput.value.trim();
                if (el.clearSearchBtn) {
                    el.clearSearchBtn.style.display = query.length > 0 ? 'inline-block' : 'none';
                }
                searchTimeout = setTimeout(() => {
                    state.searchQuery = query;
                    renderFilteredUpdates();
                }, 150);
            });
        }

        if (el.clearSearchBtn) {
            el.clearSearchBtn.addEventListener('click', () => {
                el.searchInput.value = '';
                el.clearSearchBtn.style.display = 'none';
                state.searchQuery = '';
                renderFilteredUpdates();
            });
        }

        // Sorting Controls
        const sortPills = document.querySelectorAll('.sort-pill');
        sortPills.forEach(pill => {
            pill.addEventListener('click', () => {
                sortPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                state.sortBy = pill.getAttribute('data-sort');
                renderFilteredUpdates();
            });
        });

        // Schedule Day Tabs
        if (el.scheduleDaysBar) {
            el.scheduleDaysBar.addEventListener('click', (e) => {
                const btn = e.target.closest('.day-tab');
                if (btn) {
                    const day = btn.getAttribute('data-day');
                    state.activeDay = day;
                    highlightActiveDayButton(day);
                    renderSchedule(day);
                }
            });
        }

        // Post Update Modal Triggers
        const btnOpenPost = document.getElementById('btn-open-post-modal');
        if (btnOpenPost) {
            btnOpenPost.addEventListener('click', () => {
                if (el.postModal) el.postModal.classList.add('active');
            });
        }

        const btnClosePost = document.getElementById('btn-close-post-modal');
        const btnCancelPost = document.getElementById('btn-cancel-post');
        [btnClosePost, btnCancelPost].forEach(b => {
            if (b) b.addEventListener('click', () => {
                if (el.postModal) el.postModal.classList.remove('active');
            });
        });

        // Post Form Submit
        if (el.postForm) {
            el.postForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const payload = {
                    title: document.getElementById('post-title').value,
                    type: document.getElementById('post-type').value,
                    status: document.getElementById('post-status').value,
                    category: document.getElementById('post-category').value,
                    franchise: document.getElementById('post-franchise').value,
                    summary: document.getElementById('post-summary').value,
                    content: document.getElementById('post-content').value,
                    source: document.getElementById('post-source').value,
                    source_url: document.getElementById('post-source-url').value,
                    credibility: parseInt(document.getElementById('post-credibility').value || '90')
                };

                try {
                    const res = await fetch('/api/updates', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (res.ok) {
                        const json = await res.json();
                        if (json.update) {
                            state.updates.unshift(json.update);
                            renderFilteredUpdates();
                            fetchStats();
                            el.postForm.reset();
                            if (el.postModal) el.postModal.classList.remove('active');
                            showToast('🎉 Update successfully posted to wire!', 'green');
                            switchTab('all-feed');
                        }
                    } else {
                        showToast('❌ Failed to publish update', 'red');
                    }
                } catch (err) {
                    showToast('⚠️ Network error submitting update', 'red');
                }
            });
        }

        // Anti-AI Shield Modal Triggers
        const btnOpenShield = document.getElementById('btn-open-shield-modal');
        const footerShieldLink = document.getElementById('footer-shield-link');
        [btnOpenShield, footerShieldLink].forEach(btn => {
            if (btn) btn.addEventListener('click', (e) => {
                e.preventDefault();
                openShieldModal();
            });
        });

        const btnCloseShield = document.getElementById('btn-close-shield-modal');
        if (btnCloseShield) {
            btnCloseShield.addEventListener('click', () => {
                if (el.shieldModal) el.shieldModal.classList.remove('active');
            });
        }

        // Honeypot Simulation Test
        const btnRunHoneypotTest = document.getElementById('btn-run-honeypot-test');
        if (btnRunHoneypotTest) {
            btnRunHoneypotTest.addEventListener('click', async () => {
                showToast('🛡️ Simulating AI Bot hitting Honeypot...', 'yellow');
                try {
                    await fetch('/api/report-ai-bot', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            reason: 'Manual Anti-AI Defense Simulator Triggered',
                            fingerprint: 'Simulated LLM Scraper'
                        })
                    });
                    await fetchStats();
                    await openShieldModal();
                    showToast('🚫 Honeypot trap sprung! Crawler blacklisted.', 'green');
                } catch (err) {}
            });
        }

        // Close Detail Modal
        const btnCloseDetail = document.getElementById('btn-close-detail-modal');
        if (btnCloseDetail) {
            btnCloseDetail.addEventListener('click', () => {
                if (el.detailModal) el.detailModal.classList.remove('active');
            });
        }

        // Reset Filters Button
        const btnResetFilters = document.getElementById('btn-reset-filters');
        if (btnResetFilters) {
            btnResetFilters.addEventListener('click', () => {
                state.activeSource = 'all';
                state.activeCategory = 'all';
                state.activeFranchise = 'all';
                state.searchQuery = '';
                if (el.searchInput) el.searchInput.value = '';
                
                // Reset UI
                document.querySelectorAll('.source-btn').forEach(b => b.classList.remove('active'));
                const allSrc = document.getElementById('filter-src-all');
                if (allSrc) allSrc.classList.add('active');

                document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
                const allCat = document.querySelector('.cat-pill[data-category="all"]');
                if (allCat) allCat.classList.add('active');

                const franchiseSelect = document.getElementById('franchise-selector');
                if (franchiseSelect) franchiseSelect.value = 'all';

                renderFilteredUpdates();
            });
        }

        // Clear Watchlist
        const btnClearWatchlist = document.getElementById('btn-clear-watchlist');
        if (btnClearWatchlist) {
            btnClearWatchlist.addEventListener('click', () => {
                if (confirm('Clear all items from your saved Watchlist?')) {
                    state.watchlist = [];
                    localStorage.setItem('niji_watchlist', '[]');
                    updateWatchlistBadge();
                    renderWatchlistView();
                    showToast('Watchlist cleared', 'yellow');
                }
            });
        }

        // Close Modals on Overlay Click or Escape Key
        [el.detailModal, el.postModal, el.shieldModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) modal.classList.remove('active');
                });
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                [el.detailModal, el.postModal, el.shieldModal].forEach(m => {
                    if (m) m.classList.remove('active');
                });
            }
        });
    }

    function switchTab(tabId) {
        state.activeTab = tabId;

        // Update nav button active states
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Hide all views first
        if (el.feedSection) el.feedSection.style.display = 'none';
        if (el.scheduleSection) el.scheduleSection.style.display = 'none';
        if (el.watchlistSection) el.watchlistSection.style.display = 'none';

        // Manage Hero banner display
        if (el.heroBanner) {
            el.heroBanner.style.display = (tabId === 'all-feed') ? 'block' : 'none';
        }

        // Configure current view
        if (tabId === 'daily-schedule') {
            if (el.scheduleSection) el.scheduleSection.style.display = 'block';
            renderSchedule(state.activeDay);
        } else if (tabId === 'watchlist') {
            if (el.watchlistSection) el.watchlistSection.style.display = 'block';
            renderWatchlistView();
        } else {
            // Feed Views (All, Anime, Manga, Leaks)
            if (el.feedSection) el.feedSection.style.display = 'block';

            if (tabId === 'anime-wire') {
                el.viewTitle.textContent = '📺 Anime Wire: Simulcasts & Official Releases';
                el.viewSubtitle.textContent = 'Broadcast dates, MAPPA / Ufotable / Pierrot announcements, and promotional trailers';
            } else if (tabId === 'manga-radar') {
                el.viewTitle.textContent = '📖 Manga Radar: Weekly Chapters & Releases';
                el.viewSubtitle.textContent = 'Weekly Shonen Jump, Young Jump, Jump+, MANGA Plus updates, volume milestones';
            } else if (tabId === 'leaks-rumors') {
                el.viewTitle.textContent = '🔮 Leaks, Spoilers & Community Rumors';
                el.viewSubtitle.textContent = 'Unconfirmed early magazine leaks, insider tips, domain registrations, credibility scored';
            } else {
                el.viewTitle.textContent = 'Latest Anime & Manga Updates';
                el.viewSubtitle.textContent = 'Chronological real-time coverage from Tokyo & global distributors';
            }

            renderFilteredUpdates();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ==========================================================================
    // UTILITIES
    // ==========================================================================
    function showLoader(visible) {
        if (el.loader) el.loader.style.display = visible ? 'flex' : 'none';
    }

    function showToast(message, color = 'green') {
        if (!el.toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${color}`;
        toast.innerHTML = message;
        el.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = '0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }
    window.showToast = showToast;

    function startJstClock() {
        function updateClock() {
            if (!el.jstClock) return;
            const now = new Date();
            // JST is UTC + 9
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const jstTime = new Date(utc + (3600000 * 9));
            const hrs = String(jstTime.getHours()).padStart(2, '0');
            const mins = String(jstTime.getMinutes()).padStart(2, '0');
            const secs = String(jstTime.getSeconds()).padStart(2, '0');
            el.jstClock.textContent = `${hrs}:${mins}:${secs} JST`;
        }
        updateClock();
        setInterval(updateClock, 1000);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Start App when DOM is loaded
    document.addEventListener('DOMContentLoaded', initApp);
})();
