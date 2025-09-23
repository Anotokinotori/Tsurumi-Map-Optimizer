const TsurumiApp = {
    // --- STATE ---
    // Manages the dynamic data of the application.
    state: {
        currentConfig: {},
        idealConfig: {},
        activeSelection: { configType: null, groupId: null },
        lastCalculatedPlan: null,
    },

    // --- ELEMENTS ---
    // Caches frequently accessed DOM elements.
    elements: {},

    // --- INITIALIZATION ---
    init: function() {
        this.cacheElements();
        this.ui.initInputPage('current');
        this.ui.initInputPage('ideal');
        this.bindEvents();
    },

    cacheElements: function() {
        this.elements.pages = document.querySelectorAll('.page');
        this.elements.steps = document.querySelectorAll('.step');
        this.elements.modals = document.querySelectorAll('.modal');
        this.elements.allMapBgs = document.querySelectorAll('.map-bg');
        
        // Buttons
        this.elements.goToCurrentBtn = document.getElementById('go-to-current-btn');
        this.elements.guideBtn = document.getElementById('guide-btn');
        this.elements.creditTrigger = document.getElementById('credit-modal-trigger');
        this.elements.loadPlanBtn = document.getElementById('load-plan-btn');
        this.elements.goToIdealBtn = document.getElementById('go-to-ideal-btn');
        this.elements.setRecommendedBtn = document.getElementById('set-recommended-btn');
        this.elements.copyCurrentBtn = document.getElementById('copy-current-btn');
        this.elements.calculatePlanBtn = document.getElementById('calculate-plan-btn');
        this.elements.resetBtn = document.getElementById('reset-btn');
        this.elements.savePlanBtn = document.getElementById('save-plan-btn');
        this.elements.savePlanIconBtn = document.getElementById('save-plan-icon-btn');
        this.elements.backToStartBtn = document.getElementById('back-to-start-btn');
        this.elements.backToCurrentBtn = document.getElementById('back-to-current-btn');
        this.elements.backToIdealBtn = document.getElementById('back-to-ideal-btn');
        this.elements.recalculateBtn = document.getElementById('recalculate-alternate-mode-btn');

        // Input Tabs
        this.elements.currentMapTab = document.getElementById('current-map-tab');
        this.elements.currentListTab = document.getElementById('current-list-tab');
        this.elements.idealMapTab = document.getElementById('ideal-map-tab');
        this.elements.idealListTab = document.getElementById('ideal-list-tab');

        // Quick Fill Buttons
        this.elements.fillAllABtn = document.getElementById('fill-all-a-btn');
        this.elements.fillAllBBtn = document.getElementById('fill-all-b-btn');
        this.elements.fillAllCBtn = document.getElementById('fill-all-c-btn');

        // Progress Text
        this.elements.progressText = document.getElementById('progress-text');
        this.elements.idealProgressText = document.getElementById('ideal-progress-text');
        this.elements.validationMessage = document.getElementById('validation-message');

        // Result Page
        this.elements.resultTbody = document.getElementById('result-tbody');
        this.elements.resultSummary = document.getElementById('result-summary');
        this.elements.soloNotice = document.getElementById('solo-mode-notice');
        this.elements.resultPage = document.getElementById('result-page');

        // Modals
        this.elements.dayDetailModalContent = document.getElementById('day-detail-content');

        // Checkboxes
        this.elements.multiplayerCheckbox = document.getElementById('multiplayer-mode-checkbox');
        this.elements.boatCheckbox = document.getElementById('boat-mode-checkbox');
    },

    bindEvents: function() {
        // Page Navigation
        this.elements.goToCurrentBtn.addEventListener('click', () => this.ui.showPage('current-config-page'));
        this.elements.backToStartBtn.addEventListener('click', () => this.ui.showPage('start-page'));
        this.elements.backToCurrentBtn.addEventListener('click', () => this.ui.showPage('current-config-page'));
        this.elements.backToIdealBtn.addEventListener('click', () => this.ui.showPage('ideal-config-page'));

        this.elements.goToIdealBtn.addEventListener('click', (e) => {
            if (e.currentTarget.disabled) {
                this.ui.showValidationMessage('すべての配置を入力してください。', e.currentTarget);
            } else {
                this.ui.showPage('ideal-config-page');
            }
        });
        
        // Main Actions
        this.elements.calculatePlanBtn.addEventListener('click', () => this.calculatePlan());
        this.elements.resetBtn.addEventListener('click', () => this.resetApp());
        this.elements.savePlanBtn.addEventListener('click', () => this.savePlan());
        this.elements.savePlanIconBtn.addEventListener('click', () => this.savePlan());
        this.elements.loadPlanBtn.addEventListener('click', () => this.ui.openLoadModal());

        // Input Helpers
        this.elements.setRecommendedBtn.addEventListener('click', () => this.setRecommendedConfig());
        this.elements.copyCurrentBtn.addEventListener('click', () => this.copyCurrentConfigToIdeal());
        this.elements.fillAllABtn.addEventListener('click', () => this.fillAllConfigs('A'));
        this.elements.fillAllBBtn.addEventListener('click', () => this.fillAllConfigs('B'));
        this.elements.fillAllCBtn.addEventListener('click', () => this.fillAllConfigs('C'));

        // Tab Switching
        this.elements.currentMapTab.addEventListener('click', () => this.ui.switchInputView('current', 'map'));
        this.elements.currentListTab.addEventListener('click', () => this.ui.switchInputView('current', 'list'));
        this.elements.idealMapTab.addEventListener('click', () => this.ui.switchInputView('ideal', 'map'));
        this.elements.idealListTab.addEventListener('click', () => this.ui.switchInputView('ideal', 'list'));

        // Modals
        this.elements.guideBtn.addEventListener('click', () => this.ui.showModal('guide-modal'));
        this.elements.creditTrigger.addEventListener('click', () => this.ui.showModal('credit-modal'));
        document.querySelectorAll('.modal-close').forEach(el => {
            el.addEventListener('click', () => this.ui.closeModal(el.dataset.target));
        });

        // Step Indicator Click Events
        this.elements.steps.forEach(stepEl => {
            stepEl.addEventListener('click', () => {
                const step = stepEl.dataset.step;
                switch (step) {
                    case '1':
                        this.ui.showPage('current-config-page');
                        break;
                    case '2':
                        if (!this.elements.goToIdealBtn.disabled) {
                            this.ui.showPage('ideal-config-page');
                        }
                        break;
                    case '3':
                        if (this.state.lastCalculatedPlan) {
                            this.ui.showPage('result-page');
                        }
                        break;
                }
            });
        });

        // Result Page Actions
        this.elements.resultTbody.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('btn-details')) {
                const dayIndex = parseInt(e.target.dataset.dayIndex, 10);
                this.ui.showDayDetail(dayIndex);
            }
        });
        this.elements.recalculateBtn.addEventListener('click', () => {
            const currentMode = this.elements.multiplayerCheckbox.checked;
            this.elements.multiplayerCheckbox.checked = !currentMode;
            this.calculatePlan();
        });

        // Robust layout updates
        window.addEventListener('resize', () => {
            this.ui.updateMapLayout('current-map-container');
            this.ui.updateMapLayout('ideal-map-container');
        });

        this.elements.allMapBgs.forEach(img => {
            const containerId = img.closest('.map-container').id;
            if (img.complete && img.naturalWidth > 0) {
                this.ui.updateMapLayout(containerId);
            } else {
                img.addEventListener('load', () => this.ui.updateMapLayout(containerId));
            }
        });
    },

    // --- CORE LOGIC ---
    updateConfig(configType, groupId, pattern) {
        const configToUpdate = (configType === 'current') ? this.state.currentConfig : this.state.idealConfig;
        configToUpdate[groupId] = pattern;
        
        this.ui.updateMarker(configType, groupId);
        this.ui.updatePatternButtons(configType, groupId, pattern);
        this.ui.updateProgress(configType);
        this.ui.updateGuideTextVisibility();
    },

    fillAllConfigs(pattern) {
        groupKeys.forEach(groupId => this.updateConfig('current', groupId, pattern));
    },

    setRecommendedConfig() {
        groupKeys.forEach(groupId => {
            if (recommendedConfig[groupId]) {
                this.updateConfig('ideal', groupId, recommendedConfig[groupId]);
            }
        });
    },

    copyCurrentConfigToIdeal() {
        groupKeys.forEach(groupId => {
            if (this.state.currentConfig[groupId]) {
                this.updateConfig('ideal', groupId, this.state.currentConfig[groupId]);
            }
        });
    },

    resetApp() {
        this.state.currentConfig = {};
        this.state.idealConfig = {};
        this.state.lastCalculatedPlan = null;
        this.ui.initInputPage('current');
        this.ui.initInputPage('ideal');
        this.ui.updateProgress('current');
        this.ui.updateProgress('ideal');
        this.ui.updateGuideTextVisibility();
        this.ui.showPage('start-page');
    },

    calculatePlan() {
        const isMultiplayer = this.elements.multiplayerCheckbox.checked;
        const allowBoat = this.elements.boatCheckbox.checked;

        if (Object.keys(this.state.currentConfig).length !== totalGroups || Object.keys(this.state.idealConfig).length === 0) {
            alert('全ての現在配置と、1つ以上の理想配置を入力してください。');
            return;
        }

        const loadingTextEl = document.getElementById('loading-text');
        if (loadingTextEl) {
            loadingTextEl.innerHTML = `<span style="display: block; font-size: 1.1em; font-weight: bold; margin-bottom: 15px;">このツールは、<a href="https://youtu.be/2xqllaCTP5c?si=m9yyxXo5GS0rwFG9" target="_blank" rel="noopener noreferrer" style="color: var(--accent-color); font-weight: bold;">ねこしたさんの解説</a>に基づき、プログラムされました！<br>ぜひ解説動画もご覧ください。</span><span style="font-size: 0.9em; color: var(--secondary-text-color);">計算には数分かかる場合がありますので、しばらくお待ちください。</span>`;
        }
        
        const progressEl = document.getElementById('calculation-progress');
        const onProgress = (verifiedCount) => {
            if(progressEl) {
                progressEl.textContent = `検証済みパターン: ${verifiedCount} / 59049`;
            }
        };

        this.ui.showModal('loading-modal');
        
        setTimeout(() => {
            PlanCalculator.findShortestPlan(
                this.state.currentConfig,
                this.state.idealConfig,
                { isMultiplayer, allowBoat, onProgress }
            ).then(plan => {
                this.state.lastCalculatedPlan = plan;
                this.ui.displayResults(plan, isMultiplayer, allowBoat);
                this.ui.closeModal('loading-modal');
                if(progressEl) progressEl.textContent = '';
            });
        }, 50);
    },

    savePlan() {
        const planName = prompt("この調整プランの名前を入力してください:", "マイプラン " + new Date().toLocaleDateString());
        if (!planName || planName.trim() === "") return;

        const serializablePlan = this.state.lastCalculatedPlan.map(day => ({
            ...day,
            holdAction: { ...day.holdAction, affectedGroups: Array.from(day.holdAction.affectedGroups || []) },
            advanceAction: { ...day.advanceAction, affectedGroups: Array.from(day.advanceAction.affectedGroups || []) }
        }));

        const planData = {
            id: Date.now().toString(),
            name: planName.trim(),
            currentConfig: this.state.currentConfig,
            idealConfig: this.state.idealConfig,
            plan: serializablePlan,
            isMultiplayer: this.elements.multiplayerCheckbox.checked,
            createdAt: new Date().toISOString()
        };

        try {
            const savedPlans = this.getSavedPlans();
            savedPlans.push(planData);
            localStorage.setItem('tsurumiSavedPlans', JSON.stringify(savedPlans));
            alert(`「${planName}」を保存しました。`);
        } catch (e) {
            console.error("Failed to save plan:", e);
            alert("プランの保存に失敗しました。");
        }
    },

    loadPlan(planId) {
        const plans = this.getSavedPlans();
        const planToLoad = plans.find(p => p.id === planId);
        if (!planToLoad) {
            alert("プランの読み込みに失敗しました。");
            return;
        }

        const deserializedPlan = planToLoad.plan.map(day => ({
            ...day,
            holdAction: { ...day.holdAction, affectedGroups: new Set(day.holdAction.affectedGroups || []) },
            advanceAction: { ...day.advanceAction, affectedGroups: new Set(day.advanceAction.affectedGroups || []) }
        }));

        this.state.currentConfig = planToLoad.currentConfig;
        this.state.idealConfig = planToLoad.idealConfig;
        this.state.lastCalculatedPlan = deserializedPlan;
        this.elements.multiplayerCheckbox.checked = planToLoad.isMultiplayer;

        groupKeys.forEach(groupId => {
            if (this.state.currentConfig[groupId]) this.updateConfig('current', groupId, this.state.currentConfig[groupId]);
            if (this.state.idealConfig[groupId]) this.updateConfig('ideal', groupId, this.state.idealConfig[groupId]);
        });

        this.ui.displayResults(this.state.lastCalculatedPlan, planToLoad.isMultiplayer, this.elements.boatCheckbox.checked);
        this.ui.closeModal('load-plan-modal');
    },

    deletePlan(planId) {
        if (!confirm("本当にこのプランを削除しますか？")) return;
        let plans = this.getSavedPlans();
        plans = plans.filter(p => p.id !== planId);
        try {
            localStorage.setItem('tsurumiSavedPlans', JSON.stringify(plans));
            this.ui.renderSavedPlans();
        } catch (e) {
            console.error("Failed to delete plan:", e);
            alert("プランの削除に失敗しました。");
        }
    },

    getSavedPlans() {
        try {
            const plansJSON = localStorage.getItem('tsurumiSavedPlans');
            return plansJSON ? JSON.parse(plansJSON) : [];
        } catch (e) {
            console.error("Failed to read saved plans:", e);
            return [];
        }
    },

    // --- UI LOGIC ---
    ui: {
        initInputPage: function(configType) {
            const mapContainer = document.getElementById(`${configType}-map-container`);
            const listContainer = document.getElementById(`${configType}-config-list`);
            mapContainer.querySelectorAll('.map-marker').forEach(marker => marker.remove());
            listContainer.innerHTML = '';
            
            groupKeys.forEach(groupId => {
                const group = eliteGroups[groupId];
                // Map Marker
                const marker = document.createElement('div');
                marker.className = 'map-marker glowing';
                marker.id = `${configType}-marker-${groupId}`;
                marker.style.backgroundImage = `url(${group.iconUrl})`;
                marker.addEventListener('click', () => TsurumiApp.ui.openGroupSelector(configType, groupId));
                mapContainer.appendChild(marker);

                // List Item
                const item = document.createElement('div');
                item.className = 'config-item';
                item.innerHTML = `<span class="config-item-label">${group.name}</span>`;
                const buttons = document.createElement('div');
                buttons.className = 'pattern-buttons';
                buttons.id = `${configType}-buttons-${groupId}`;
                ['A', 'B', 'C'].forEach(pattern => {
                    const btn = document.createElement('button');
                    btn.textContent = pattern;
                    btn.addEventListener('click', () => TsurumiApp.updateConfig(configType, groupId, pattern));
                    buttons.appendChild(btn);
                });
                item.appendChild(buttons);
                listContainer.appendChild(item);
            });
        },

        showPage: function(pageId) {
            TsurumiApp.elements.pages.forEach(page => page.classList.remove('active'));
            document.getElementById(pageId).classList.add('active');

            TsurumiApp.elements.steps.forEach(step => step.classList.remove('active-step'));
            let activeStepNumber = 1;
            if (pageId.includes('current')) activeStepNumber = 1;
            else if (pageId.includes('ideal')) activeStepNumber = 2;
            else if (pageId.includes('result')) activeStepNumber = 3;
            
            document.querySelectorAll(`.step[data-step="${activeStepNumber}"]`).forEach(stepEl => stepEl.classList.add('active-step'));
            
            if (pageId.includes('config')) {
                const containerId = `${pageId.split('-')[0]}-map-container`;
                this.updateMapLayout(containerId);
            }
        },

        updateMapLayout: function(containerId) {
            const mapContainer = document.getElementById(containerId);
            if (!mapContainer || !mapContainer.offsetParent) return;

            const mapImage = mapContainer.querySelector('.map-bg');
            if (!mapImage || !mapImage.complete || mapImage.naturalWidth === 0) return;

            const markers = mapContainer.querySelectorAll('.map-marker');
            const containerRect = mapContainer.getBoundingClientRect();
            const imageAspectRatio = mapImage.naturalWidth / mapImage.naturalHeight;
            const containerAspectRatio = containerRect.width / containerRect.height;

            let renderedWidth, renderedHeight, offsetX, offsetY;
            if (imageAspectRatio > containerAspectRatio) {
                renderedWidth = containerRect.width;
                renderedHeight = renderedWidth / imageAspectRatio;
                offsetX = 0;
                offsetY = (containerRect.height - renderedHeight) / 2;
            } else {
                renderedHeight = containerRect.height;
                renderedWidth = renderedHeight * imageAspectRatio;
                offsetX = (containerRect.width - renderedWidth) / 2;
                offsetY = 0;
            }

            markers.forEach(marker => {
                const groupId = marker.id.split('-')[2];
                const pos = markerPositions[groupId];
                if (pos) {
                    const newLeft = offsetX + (renderedWidth * (parseFloat(pos.left) / 100));
                    const newTop = offsetY + (renderedHeight * (parseFloat(pos.top) / 100));
                    marker.style.left = `${newLeft - marker.offsetWidth / 2}px`;
                    marker.style.top = `${newTop - marker.offsetHeight / 2}px`;
                }
            });
        },

        displayResults: function(plan, isMultiplayer, allowBoat) {
            const summaryEl = document.getElementById('result-summary-text');
            const summaryText = !plan ? '8日以内に完了する調整プランは見つかりませんでした。'
                              : plan.length === 0 ? '調整は不要です！'
                              : `最短 ${plan.length} 日で調整可能！`;
            
            summaryEl.textContent = summaryText;

            TsurumiApp.elements.soloNotice.style.display = isMultiplayer ? 'none' : '';
            
            TsurumiApp.elements.recalculateBtn.textContent = isMultiplayer ? '周期ホールドOFFで再計算' : '周期ホールドONで再計算';
            TsurumiApp.elements.recalculateBtn.className = isMultiplayer ? 'btn btn-primary' : 'btn btn-multi';
            
            const showSaveButtons = plan && plan.length > 0;
            document.getElementById('save-plan-btn').style.display = showSaveButtons ? '' : 'none';
            document.getElementById('save-plan-icon-btn').style.display = showSaveButtons ? '' : 'none';

            const tbody = TsurumiApp.elements.resultTbody;
            tbody.innerHTML = '';
            if (plan) {
                plan.forEach((day, index) => {
                    const tr = document.createElement('tr');
                    const modeClass = day.mode === 'ソロ' ? 'mode-solo' : 'mode-multi';
                    tr.innerHTML = `
                        <td>${index + 1}日目</td>
                        <td><span class="${modeClass}">${day.mode}</span></td>
                        <td>${day.holdAction.name}</td>
                        <td>${day.advanceAction.name}</td>
                        <td><button class="btn btn-details" data-day-index="${index}">手順を確認</button></td>
                    `;
                    tbody.appendChild(tr);
                });
            }
            this.showPage('result-page');

            TsurumiApp.elements.resultPage.scrollTop = 0;
            try { window.scrollTo(0, 0); } catch(e) {/* ignore */}
        },

        showModal: function(modalId) { document.getElementById(modalId).classList.add('active'); },
        closeModal: function(modalId) { document.getElementById(modalId).classList.remove('active'); },
        switchInputView: function(configType, view) {
            document.getElementById(`${configType}-map-tab`).classList.toggle('active', view === 'map');
            document.getElementById(`${configType}-list-tab`).classList.toggle('active', view === 'list');
            document.getElementById(`${configType}-map-view`).classList.toggle('active', view === 'map');
            document.getElementById(`${configType}-list-view`).classList.toggle('active', view === 'list');
            if (view === 'map') this.updateMapLayout(`${configType}-map-container`);
        },
        updateProgress: function(configType) {
            const config = (configType === 'current') ? TsurumiApp.state.currentConfig : TsurumiApp.state.idealConfig;
            const progressEl = (configType === 'current') ? TsurumiApp.elements.progressText : TsurumiApp.elements.idealProgressText;
            const count = Object.keys(config).length;
            progressEl.textContent = `入力完了: ${count} / ${totalGroups}`;
            if (configType === 'current') {
                TsurumiApp.elements.goToIdealBtn.disabled = count !== totalGroups;
            }
        },
        updateMarker: function(configType, groupId) {
            const marker = document.getElementById(`${configType}-marker-${groupId}`);
            marker.classList.remove('glowing');
            marker.classList.add('completed');
            marker.innerHTML = '✔';
        },
        updatePatternButtons: function(configType, groupId, pattern) {
             document.getElementById(`${configType}-buttons-${groupId}`).querySelectorAll('button').forEach(btn => {
                btn.classList.toggle('selected', btn.textContent === pattern);
            });
        },
        openGroupSelector: function(configType, groupId) {
            TsurumiApp.state.activeSelection = { configType, groupId };
            document.getElementById('zoom-title').textContent = `${eliteGroups[groupId].name} のパターンを選択`;
            const zoomContainer = document.getElementById('zoom-map-container');
            const zoomMapImage = zoomContainer.querySelector('img');
            this.setupImageLoader(zoomMapImage, eliteGroups[groupId].zoomMapUrl);

            zoomContainer.querySelectorAll('.pattern-marker').forEach(m => m.remove());
            const selectedPattern = (configType === 'current' ? TsurumiApp.state.currentConfig : TsurumiApp.state.idealConfig)[groupId];

            ['A', 'B', 'C'].forEach(pattern => {
                const pos = patternMarkerPositions[groupId]?.[pattern];
                if (!pos) return;

                const marker = document.createElement('div');
                marker.className = 'pattern-marker';
                marker.innerHTML = `<span class="pattern-label">${pattern}</span>`;
                if (pattern === selectedPattern) {
                    marker.classList.add('completed');
                    marker.innerHTML = '✔';
                }

                marker.style.top = `${100 - parseFloat(pos.bottom)}%`;
                marker.style.left = `${100 - parseFloat(pos.right)}%`;
                marker.addEventListener('click', () => this.selectPatternForConfirmation(pattern));
                zoomContainer.appendChild(marker);
            });
            this.showModal('zoom-view');
        },
        selectPatternForConfirmation: function(pattern) {
             TsurumiApp.state.activeSelection.pattern = pattern;
             const { groupId } = TsurumiApp.state.activeSelection;
             document.getElementById('screenshot-title').textContent = `${eliteGroups[groupId].name} - パターン ${pattern} で合っていますか？`;
             const screenshotImg = document.getElementById('screenshot-img');
             this.setupImageLoader(screenshotImg, screenshotImageUrls[groupId]?.[pattern]);
             document.getElementById('confirm-pattern-btn').onclick = () => {
                const { configType, groupId, pattern } = TsurumiApp.state.activeSelection;
                if (configType && groupId && pattern) TsurumiApp.updateConfig(configType, groupId, pattern);
                this.closeModal('screenshot-popup');
                this.closeModal('zoom-view');
             };
             this.showModal('screenshot-popup');
        },
        setupImageLoader: function(imgElement, src) {
            const container = imgElement.parentElement;
            if (!container || !container.classList.contains('image-container')) return;
            container.classList.remove('loaded');
            imgElement.onload = () => container.classList.add('loaded');
            imgElement.onerror = () => { container.querySelector('.image-loader').textContent = '読込失敗'; };
            imgElement.src = src || 'https://placehold.co/1x1/ffffff/ffffff?text=';
        },
        showValidationMessage: function(message, targetElement) {
            const validationMessage = TsurumiApp.elements.validationMessage;
            validationMessage.textContent = message;
            validationMessage.classList.add('show');
            targetElement.classList.add('shake');
            setTimeout(() => validationMessage.classList.remove('show'), 2000);
            setTimeout(() => targetElement.classList.remove('shake'), 600);
        },
        updateGuideTextVisibility: function() {
            const isCurrentStarted = Object.keys(TsurumiApp.state.currentConfig).length > 0;
            const isIdealStarted = Object.keys(TsurumiApp.state.idealConfig).length > 0;
            document.querySelector('#current-map-container .map-guide-text').classList.toggle('hidden', isCurrentStarted);
            document.querySelector('#ideal-map-container .map-guide-text').classList.toggle('hidden', isIdealStarted);
        },
        
        showDayDetail: function(dayIndex) {
            const plan = TsurumiApp.state.lastCalculatedPlan;
            if (!plan || isNaN(dayIndex) || !plan[dayIndex]) return;

            const dayData = plan[dayIndex];
            const dayNumber = dayIndex + 1;
            document.getElementById('day-detail-title').textContent = `${dayNumber}日目の手順詳細`;
            TsurumiApp.elements.dayDetailModalContent.innerHTML = this.generateDayDetailHTML(dayData);
            TsurumiApp.elements.dayDetailModalContent.querySelectorAll('.image-container img').forEach(img => {
                this.setupImageLoader(img, img.dataset.src);
                img.src = img.dataset.src;
            });
            this.showModal('day-detail-modal');
        },
        generateDayDetailHTML: function(dayData) {
            let html = '<p style="text-align:center; color: var(--secondary-text-color);"><strong>【重要】</strong>「歩き」や「ボート」での移動は、<strong>ルートを慎重に確認し、チャスカのような飛行系キャラは使用しないでください。</strong></p>';
            if (dayData.mode === 'ソロ') {
                html += `<h3>ソロモードでの行動</h3>` + this.generateActionDetailsHTML(dayData.advanceAction);
            } else {
                 html += `<h3>マルチモード（周期ホールド）での行動</h3>
                        <h4>Step 1: 準備</h4>
                        <p>ホスト(1P)は鶴観以外の安全な場所に移動し、ゲスト(2P)を世界に招き入れます。</p>
                        <h4>Step 2: 周期のホールド (ゲストの操作)</h4>
                        <p><strong>[重要]</strong> まずホスト(1P)が層岩巨淵・地下鉱区など、<strong>テイワット以外のマップに移動</strong>するのを待ちます。</p>
                        <p>ホストの移動後、ゲスト(2P)は以下の行動で指定されたグループの周期を<strong>ホールド(固定)</strong>します。</p>`
                        + this.generateActionDetailsHTML(dayData.holdAction) +
                        `<p><strong>[重要]</strong> ゲストは上記行動を終えたら、速やかにホストの世界から退出してください。</p>
                        <h4 style="margin-top: 25px;">Step 3: 周期の進行 (ホストの操作)</h4>
                        <p>ゲストが退出してソロ状態に戻った後、ホスト(1P)は以下の行動で、ゲストが<strong>ホールドしなかった</strong>グループの周期を1つ<strong>進めます</strong>。</p>`
                        + this.generateActionDetailsHTML(dayData.advanceAction, dayData.holdAction);
            }
            return html;
        },
        generateActionDetailsHTML: function(actionData, holdActionData = {affectedGroups: new Set()}) {
            if (!actionData || !actionData.name || actionData.name === '---' || actionData.name === '何もしない') return '<p>特別な行動は不要です。</p>';

            const effectiveGroups = new Set([...actionData.affectedGroups].filter(x => !holdActionData.affectedGroups.has(x)));
            if (effectiveGroups.size === 0) return '<p>特別な行動は不要です。</p>';
            
            const affectedGroupsList = Array.from(effectiveGroups).map(key => `「${eliteGroups[key].name}」`).join('、');
            let html = `<p><strong>影響を受けるグループ:</strong> ${affectedGroupsList}</p><ul>`;
            const actions = actionData.name.split(' + ');
            
            actions.forEach(actionName => {
                const action = actionsData.find(a => a.name === actionName);
                if (!action || ![...action.affectedGroups].some(g => effectiveGroups.has(g))) return;

                const details = actionDetails[action.id] || {};
                html += `<li><strong>${actionName}</strong><p>${(details.note || '').replace(/\n/g, '<br>')}</p>`;
                if (details.images) {
                    details.images.forEach(imgUrl => {
                        html += `<div class="image-container"><div class="image-loader">読込中...</div><img data-src="${imgUrl}" alt="${actionName}のルート図"></div>`;
                    });
                }
                if (details.videoUrl) html += `<div class="video-container"><iframe src="${details.videoUrl.replace('youtu.be/','youtube.com/embed/').split('?si=')[0]}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
                html += `</li>`;
            });
            return html + '</ul>';
        },
        openLoadModal: function() {
            this.renderSavedPlans();
            this.showModal('load-plan-modal');
        },
        renderSavedPlans: function() {
            const plans = TsurumiApp.getSavedPlans();
            const listEl = document.getElementById('saved-plans-list');
            const noPlansEl = document.getElementById('no-saved-plans');
            listEl.innerHTML = '';
            noPlansEl.style.display = plans.length === 0 ? 'block' : 'none';
            listEl.style.display = plans.length > 0 ? '' : 'none';

            plans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(plan => {
                const li = document.createElement('li');
                li.className = 'saved-plan-item';
                li.innerHTML = `<span class="saved-plan-item-name">${plan.name}</span>
                                <div class="saved-plan-item-actions">
                                    <button class="btn btn-primary btn-load" data-plan-id="${plan.id}">読込</button>
                                    <button class="btn btn-delete" data-plan-id="${plan.id}">削除</button>
                                </div>`;
                li.querySelector('.btn-load').addEventListener('click', () => TsurumiApp.loadPlan(plan.id));
                li.querySelector('.btn-delete').addEventListener('click', () => TsurumiApp.deletePlan(plan.id));
                listEl.appendChild(li);
            });
        }
    }
};

// --- CALCULATION SERVICE ---
// A pure object for handling complex calculations without side effects.
const PlanCalculator = {
    findShortestPlan: function(startConfig, idealConfig, options) {
        return new Promise(resolve => {
            const { isMultiplayer, allowBoat, onProgress } = options;
            const actionsToUse = this.getAvailableActions(allowBoat);
            
            const PATTERN_MAP = { 'A': 0, 'B': 1, 'C': 2 };
            const endConfigArr = groupKeys.map(k => idealConfig[k] ? PATTERN_MAP[idealConfig[k]] : -1);
    
            let startState = 0;
            for (let i = 0; i < groupKeys.length; i++) {
                startState = startState * 3 + PATTERN_MAP[startConfig[groupKeys[i]]];
            }
    
            if (this.isStateGoal(startState, endConfigArr)) {
                resolve([]);
                return;
            }
    
            const queue = [{ state: startState, path: [] }];
            const visited = new Set([startState]);
            let verifiedCount = 0;

            const processChunk = () => {
                const startTime = Date.now();
                while (queue.length > 0 && (Date.now() - startTime < 50)) {
                    const { state, path } = queue.shift();
                    verifiedCount++;

                    if (path.length >= 8) continue;
    
                    const currentStateArr = this.stateToArray(state);
                    let solutionPath = null;
    
                    // Solo mode actions
                    for (const soloAction of actionsToUse) {
                        const nextState = this.applyAction(currentStateArr, soloAction.affectedGroups);
                        if (!visited.has(nextState)) {
                            const newPath = [...path, { holdAction: { name: '---' }, advanceAction: soloAction, mode: 'ソロ' }];
                            if (this.isStateGoal(nextState, endConfigArr)) {
                                solutionPath = newPath;
                                break;
                            }
                            visited.add(nextState);
                            queue.push({ state: nextState, path: newPath });
                        }
                    }
                    if (solutionPath) {
                        resolve(solutionPath);
                        return;
                    }
                    
                    if (isMultiplayer) {
                        for (const holdAction of actionsToUse) {
                            for (const advanceAction of actionsToUse) {
                                const effectiveAdvance = new Set([...advanceAction.affectedGroups].filter(x => !holdAction.affectedGroups.has(x)));
                                if (effectiveAdvance.size === 0) continue;
        
                                const nextState = this.applyAction(currentStateArr, effectiveAdvance);
                                if (!visited.has(nextState)) {
                                     const newPath = [...path, { holdAction, advanceAction, mode: 'マルチ' }];
                                     if (this.isStateGoal(nextState, endConfigArr)) {
                                        solutionPath = newPath;
                                        break;
                                     }
                                     visited.add(nextState);
                                     queue.push({ state: nextState, path: newPath });
                                }
                            }
                            if (solutionPath) break;
                        }
                    }
                    if (solutionPath) {
                        resolve(solutionPath);
                        return;
                    }
                }
    
                if (queue.length > 0) {
                    if (onProgress) onProgress(verifiedCount);
                    setTimeout(processChunk, 0);
                } else {
                    if (onProgress) onProgress(verifiedCount);
                    resolve(null);
                }
            };
            
            processChunk();
        });
    },

    applyAction: function(stateArr, affectedGroups) {
        const nextStateArr = [...stateArr];
        for (const group of affectedGroups) {
            const idx = groupKeys.indexOf(group);
            nextStateArr[idx] = (nextStateArr[idx] + 1) % 3;
        }
        return this.arrayToState(nextStateArr);
    },
    
    stateToArray: function(state) {
        const arr = [];
        for (let i = groupKeys.length - 1; i >= 0; i--) {
            arr[i] = state % 3;
            state = Math.floor(state / 3);
        }
        return arr;
    },

    arrayToState: function(arr) {
        let state = 0;
        for (let i = 0; i < arr.length; i++) {
            state = state * 3 + arr[i];
        }
        return state;
    },

    isStateGoal: function(state, endConfigArr) {
        const currentStateArr = this.stateToArray(state);
        for (let i = 0; i < groupKeys.length; i++) {
            if (endConfigArr[i] !== -1 && endConfigArr[i] !== currentStateArr[i]) {
                return false;
            }
        }
        return true;
    },

    getAvailableActions: function(allowBoat) {
        let actions = actionsData;
        if (!allowBoat) {
            actions = actions.filter(action => !action.name.includes('ボート'));
        }

        const achievablePatterns = new Map();
        achievablePatterns.set(JSON.stringify([]), { name: '何もしない', affectedGroups: new Set() });
        
        for (let i = 1; i < (1 << actions.length); i++) {
            const currentActions = [];
            const affectedGroupsSet = new Set();
            for (let j = 0; j < actions.length; j++) {
                if ((i >> j) & 1) {
                    const action = actions[j];
                    currentActions.push(action);
                    action.affectedGroups.forEach(group => affectedGroupsSet.add(group));
                }
            }
            const key = JSON.stringify([...affectedGroupsSet].sort());
            if (!achievablePatterns.has(key)) {
                achievablePatterns.set(key, {
                    name: currentActions.map(a => a.name).join(' + '),
                    affectedGroups: affectedGroupsSet
                });
            }
        }
        return Array.from(achievablePatterns.values());
    }
};


// --- APP START ---
document.addEventListener('DOMContentLoaded', () => TsurumiApp.init());

