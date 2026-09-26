/**
 * Niji Anime & Manga Pulse - Client-Side Anti-AI & Bot Blocker Engine
 * Detects automated scrapers, headless AI crawlers, and protects content.
 */

(function() {
    'use strict';

    const AntiAI = {
        isBot: false,
        reasons: [],

        init() {
            this.runHeuristics();
            this.injectHoneypots();
            this.setupChallengeListener();
            this.updateBadge();
        },

        runHeuristics() {
            // 1. WebDriver automation flag check
            if (navigator.webdriver === true) {
                this.flagBot('Navigator WebDriver Flag True (Automation Engine)');
            }

            // 2. Headless Chrome / PhantomJS / Selenium artifacts
            const automationGlobals = [
                '__nightmare', '_phantom', 'callPhantom',
                '__selenium_unwrapped', '__webdriver_script_fn',
                'domAutomation', 'domAutomationController'
            ];
            for (const g of automationGlobals) {
                if (window[g] !== undefined) {
                    this.flagBot(`Automation Global Detected: ${g}`);
                }
            }

            // 3. Document element attributes (used by selenium/playwright)
            if (document.documentElement.getAttribute('webdriver') !== null) {
                this.flagBot('HTML webdriver attribute present');
            }

            // 4. Missing plugins in traditional non-mobile desktop browsers
            if (navigator.plugins && navigator.plugins.length === 0 && !/Mobi|Android/i.test(navigator.userAgent)) {
                // Suspicious for headless browsers
                if (window.outerWidth === 0 && window.outerHeight === 0) {
                    this.flagBot('Zero dimensions headless display');
                }
            }

            // 5. Check if user-agent explicitly claims AI crawler
            const ua = (navigator.userAgent || '').toLowerCase();
            const aiKeywords = ['gptbot', 'claudebot', 'perplexitybot', 'bytespider', 'ccbot', 'headlesschrome', 'diffbot'];
            for (const kw of aiKeywords) {
                if (ua.includes(kw)) {
                    this.flagBot(`AI Scraper User-Agent Token: ${kw}`);
                }
            }

            if (this.isBot) {
                this.triggerDefense();
            }
        },

        flagBot(reason) {
            this.isBot = true;
            this.reasons.push(reason);
            console.warn(`[Anti-AI Shield] Bot behavior detected: ${reason}`);
            
            // Report to backend
            try {
                fetch('/api/report-ai-bot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        reason: reason,
                        fingerprint: navigator.userAgent
                    })
                }).catch(() => {});
            } catch (e) {}
        },

        injectHoneypots() {
            // Invisible bait links specifically designed to trap automated scrapers crawling links
            const honeypot = document.createElement('div');
            honeypot.className = 'ai-crawler-trap';
            honeypot.setAttribute('aria-hidden', 'true');
            honeypot.style.cssText = 'position: absolute; left: -9999px; top: -9999px; width: 0; height: 0; opacity: 0; pointer-events: none; overflow: hidden;';
            honeypot.innerHTML = `
                <a href="/api/trap-ai-honeypot" rel="nofollow">Archive Anime Feed Data API</a>
                <a href="/trap-ai-crawler" rel="nofollow">Full Manga Text Corpus Download</a>
            `;
            document.body.appendChild(honeypot);
        },

        triggerDefense() {
            // Check if already human verified
            if (sessionStorage.getItem('otaku_human_verified') === 'true' || document.cookie.includes('human_verified_token')) {
                return;
            }

            const modal = document.getElementById('ai-challenge-modal');
            if (modal) {
                modal.classList.add('active');
            }
        },

        setupChallengeListener() {
            const verifyBtn = document.getElementById('btn-verify-human');
            const answerInput = document.getElementById('human-answer-input');
            const errorMsg = document.getElementById('human-verify-error');

            if (verifyBtn && answerInput) {
                verifyBtn.addEventListener('click', () => {
                    const ans = answerInput.value.trim().toLowerCase();
                    // Valid answers for: "Who is the captain of the Straw Hat Pirates in One Piece? (or name any anime)"
                    const validAnswers = ['luffy', 'monkey d luffy', 'monkey d. luffy', 'straw hat', 'strawhat', 'anime', 'manga', 'naruto', 'goku', 'zoro'];
                    
                    if (validAnswers.some(v => ans.includes(v))) {
                        sessionStorage.setItem('otaku_human_verified', 'true');
                        fetch('/api/verify-human', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ answer: ans, slider_verified: true })
                        }).then(() => {
                            const modal = document.getElementById('ai-challenge-modal');
                            if (modal) modal.classList.remove('active');
                            if (window.showToast) window.showToast('✅ Human Otaku Verified! AI restrictions lifted.', 'green');
                            this.updateBadge(true);
                        });
                    } else {
                        if (errorMsg) {
                            errorMsg.textContent = '❌ Incorrect answer. Only authentic anime fans can verify!';
                            errorMsg.style.display = 'block';
                        }
                    }
                });
            }
        },

        updateBadge(verified = false) {
            const badge = document.getElementById('shield-status-text');
            if (badge) {
                if (verified || sessionStorage.getItem('otaku_human_verified') === 'true') {
                    badge.innerHTML = '<span style="color:#00e676;">● HUMAN VERIFIED</span>';
                } else {
                    badge.innerHTML = '<span style="color:#00b0ff;">● AI DEFENSE ARMED</span>';
                }
            }
        }
    };

    window.AntiAI = AntiAI;
    document.addEventListener('DOMContentLoaded', () => AntiAI.init());
})();
