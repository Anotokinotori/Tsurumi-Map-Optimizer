/**
 * @file Tsurumi Island Adjustment Tool - Main Logic
 * @description This file contains the primary application logic, including state management,
 * UI interactions, event handling, and the core calculation process for finding the optimal adjustment plan.
 * All application logic is encapsulated within the `TsurumiApp` object to avoid polluting the global scope.
 */

// --- Pure Calculation Module ---
const PlanCalculator = {
    /**
     * Finds the shortest adjustment plan using a Breadth-First Search (BFS) algorithm.
     * This function is "pure" and does not depend on the TsurumiApp's state or UI.
     * @param {object} params - The parameters for the calculation.
     * @param {string} params.startConfigStr - The initial configuration as a string.
     * @param {string} params.endConfigStr - The target configuration as a string.
     * @param {Array<object>} params.actionsToUse - The list of possible daily actions.
     * @param {boolean} params.isMultiplayer - Whether to consider multiplayer (period hold) strategies.
     * @param {function} onProgress - Callback function to report progress (receives verified count).
     * @param {function} onComplete - Callback function to return the final plan (receives plan or null).
     * @returns {{cancel: function}} - An object with a method to cancel the ongoing calculation.
     */
    findShortestPlan({ startConfigStr, endConfigStr, actionsToUse, isMultiplayer }, onProgress, onComplete) {
        if (startConfigStr === endConfigStr) {
            setTimeout(() => onComplete([]), 0);
            return { cancel: () => {} };
        }

        const queue = [{ config: startConfigStr, path: [] }];
        const visited = new Set([startConfigStr]);
        let verifiedCount = 0;
        let calculationTimeoutId = null;

        const processChunk = () => {
            const startTime = Date.now();
            while (queue.length > 0 && (Date.now() - startTime < 50)) {
                const { config, path } = queue.shift();
                verifiedCount++;

                if (path.length >= 8) continue;

                let solutionPath = null;

                // Solo Mode
                for (const soloAction of actionsToUse) {
                    let nextConfigArr = config.split('').map(Number);
                    for (const group of soloAction.affectedGroups) {
                        nextConfigArr[groupKeys.indexOf(group)] = (nextConfigArr[groupKeys.indexOf(group)] + 1) % 3;
                    }
                    const nextConfigStr = nextConfigArr.join('');
                    if (nextConfigStr === endConfigStr) {
                        solutionPath = [...path, { holdAction: { name: '---' }, advanceAction: soloAction, mode: 'ソロ' }];
                        break;
                    }
                    if (!visited.has(nextConfigStr)) {
                        visited.add(nextConfigStr);
                        queue.push({ config: nextConfigStr, path: [...path, { holdAction: { name: '---' }, advanceAction: soloAction, mode: 'ソロ' }] });
                    }
                }
                if (solutionPath) {
                    onComplete(solutionPath);
                    return;
                }

                // Multiplayer Mode
                if (isMultiplayer) {
                    for (const holdAction of actionsToUse) {
                        for (const advanceAction of actionsToUse) {
                            const effectiveAdvance = new Set([...advanceAction.affectedGroups].filter(x => !holdAction.affectedGroups.has(x)));
                            if (effectiveAdvance.size === 0) continue;
                            
                            let nextConfigArr = config.split('').map(Number);
                            for (const group of effectiveAdvance) {
                                 nextConfigArr[groupKeys.indexOf(group)] = (nextConfigArr[groupKeys.indexOf(group)] + 1) % 3;
                            }
                            const nextConfigStr = nextConfigArr.join('');
                            if (nextConfigStr === endConfigStr) {
                                solutionPath = [...path, { holdAction, advanceAction, mode: 'マルチ' }];
                                break;
                            }
                            if (!visited.has(nextConfigStr)) {
                                visited.add(nextConfigStr);
                                queue.push({ config: nextConfigStr, path: [...path, { holdAction, advanceAction, mode: 'マルチ' }] });
                            }
                        }
                        if (solutionPath) break;
                    }
                }
                if (solutionPath) {
                    onComplete(solutionPath);
                    return;
                }
            }

            if (queue.length > 0) {
                onProgress(verifiedCount);
                calculationTimeoutId = setTimeout(processChunk, 0);
            } else {
                onComplete(null);
            }
        };
        
        calculationTimeoutId = setTimeout(processChunk, 0);

        return {
            cancel: () => {
                if (calculationTimeoutId) {
                    clearTimeout(calculationTimeoutId);
                }
            }
        };
    }
};


// --- Main Application Object ---
const TsurumiApp = {
    // --- STATE, CONSTANTS, AND CACHED ELEMENTS ---
    state: {
        currentConfig: {},
        idealConfig: {},
        activeSelection: { configType: null, groupId: null, pattern: null },
        lastCalculatedPlan: null,
        calculationTask: null,
    },
    possibleDailyActions: [],
    constants: {
        PATTERN_MAP: { 'A': 0, 'B': 1, 'C': 2 },
    },
    elements: {},

    // --- INITIALIZATION ---
    /**
     * Caches frequently used DOM elements to avoid repeated queries.
     */
    cacheElements() {
        this.elements = {
            infoBanner: document.getElementById('info-banner'),
            closeBannerBtn: document.getElementById('close-banner-btn'),
            goToCurrentBtn: document.getElementById('go-to-current-btn'),
            guideBtn: document.getElementById('guide-btn'),
            creditModalTrigger: document.getElementById('credit-modal-trigger'),
            loadPlanBtn: document.getElementById('load-plan-btn'),
            goToIdealBtn: document.getElementById('go-to-ideal-btn'),
            validationMessage: document.getElementById('validation-message'),
            setRecommendedBtn: document.getElementById('set-recommended-btn'),
            copyCurrentBtn: document.getElementById('copy-current-btn'),
            calculatePlanBtn: document.getElementById('calculate-plan-btn'),
            resetBtn: document.getElementById('reset-btn'),
            savePlanBtn: document.getElementById('save-plan-btn'),
            backToStartBtn: document.getElementById('back-to-start-btn'),
            backToCurrentBtn: document.getElementById('back-to-current-btn'),
            backToIdealBtn: document.getElementById('back-to-ideal-btn'),
            currentMapTab: document.getElementById('current-map-tab'),
            currentListTab: document.getElementById('current-list-tab'),
            idealMapTab: document.getElementById('ideal-map-tab'),
            idealListTab: document.getElementById('ideal-list-tab'),
            fillAllABtn: document.getElementById('fill-all-a-btn'),
            fillAllBBtn: document.getElementById('fill-all-b-btn'),
            fillAllCBtn: document.getElementById('fill-all-c-btn'),
            scrollIndicator: document.getElementById('scroll-indicator'),
            resultPage: document.getElementById('result-page'),
            resultTbody: document.getElementById('result-tbody'),
            resultSummary: document.getElementById('result-summary'),
            recalculateBtn: document.getElementById('recalculate-alternate-mode-btn'),
            soloModeNotice: document.getElementById('solo-mode-notice'),
            progressText: document.getElementById('progress-text'),
            idealProgressText: document.getElementById('ideal-progress-text'),
            loadingText: document.getElementById('loading-text'),
            calculationProgress: document.getElementById('calculation-progress'),
            zoomTitle: document.getElementById('zoom-title'),
            zoomMapContainer: document.getElementById('zoom-map-container'),
            screenshotTitle: document.getElementById('screenshot-title'),
            screenshotImg: document.getElementById('screenshot-img'),
            confirmPatternBtn: document.getElementById('confirm-pattern-btn'),
            dayDetailTitle: document.getElementById('day-detail-title'),
            dayDetailContent: document.getElementById('day-detail-content'),
            savedPlansList: document.getElementById('saved-plans-list'),
            noSavedPlans: document.getElementById('no-saved-plans'),
        };
    },

    /**
     * Initializes the application. This function is the entry point.
     * It binds all necessary event listeners and sets up the initial state of the UI.
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.ui.ensureScrollIndicatorIsInBody();

        if (localStorage.getItem('tsurumiBannerClosed') === 'true') {
            this.elements.infoBanner.style.display = 'none';
        }

        this.initInputPage('current');
        this.initInputPage('ideal');
        this.generatePossibleDailyActions();

        window.addEventListener('resize', () => {
            this.ui.updateMapLayout('current-map-container');
            this.ui.updateMapLayout('ideal-map-container');
        });
        document.querySelectorAll('.map-bg').forEach(img => {
            if (img.complete) {
                this.ui.updateMapLayout(img.closest('.map-container').id);
            } else {
                img.addEventListener('load', (e) => this.ui.updateMapLayout(e.target.closest('.map-container').id));
            }
        });
    },

    /**
     * Binds all event listeners for the application's interactive elements.
     */
    bindEvents() {
        this.elements.closeBannerBtn.addEventListener('click', () => {
            this.elements.infoBanner.classList.add('hidden');
            localStorage.setItem('tsurumiBannerClosed', 'true');
        });

        this.elements.goToCurrentBtn.addEventListener('click', () => this.ui.showPage('current-config-page'));
        this.elements.guideBtn.addEventListener('click', () => this.ui.showModal('guide-modal'));
        this.elements.creditModalTrigger.addEventListener('click', () => this.ui.showModal('credit-modal'));
        this.elements.loadPlanBtn.addEventListener('click', () => this.ui.openLoadModal());
        
        document.querySelectorAll('.modal-close').forEach(el => el.addEventListener('click', () => this.ui.closeModal(el.dataset.target)));
        
        this.elements.goToIdealBtn.addEventListener('click', (e) => {
            if (e.currentTarget.disabled) {
                this.ui.showValidationError('すべての配置を入力してください。');
            } else {
                this.ui.showPage('ideal-config-page');
            }
        });

        this.elements.setRecommendedBtn.addEventListener('click', () => this.setRecommendedConfig());
        this.elements.copyCurrentBtn.addEventListener('click', () => this.copyCurrentConfigToIdeal());
        this.elements.calculatePlanBtn.addEventListener('click', () => {
            const isMultiplayer = document.getElementById('multiplayer-mode-checkbox').checked;
            const allowBoat = document.getElementById('boat-mode-checkbox').checked;
            this.calculatePlan(isMultiplayer, allowBoat);
        });
        this.elements.resetBtn.addEventListener('click', () => this.resetApp());
        this.elements.savePlanBtn.addEventListener('click', () => this.savePlan());
        
        this.elements.backToStartBtn.addEventListener('click', () => this.ui.showPage('start-page'));
        this.elements.backToCurrentBtn.addEventListener('click', () => this.ui.showPage('current-config-page'));
        this.elements.backToIdealBtn.addEventListener('click', () => this.ui.showPage('ideal-config-page'));
        
        this.elements.currentMapTab.addEventListener('click', () => this.ui.switchInputView('current', 'map'));
        this.elements.currentListTab.addEventListener('click', () => this.ui.switchInputView('current', 'list'));
        this.elements.idealMapTab.addEventListener('click', () => this.ui.switchInputView('ideal', 'map'));
        this.elements.idealListTab.addEventListener('click', () => this.ui.switchInputView('ideal', 'list'));

        this.elements.fillAllABtn.addEventListener('click', () => this.fillAllConfigs('A'));
        this.elements.fillAllBBtn.addEventListener('click', () => this.fillAllConfigs('B'));
        this.elements.fillAllCBtn.addEventListener('click', () => this.fillAllConfigs('C'));

        this.elements.scrollIndicator.addEventListener('click', (e) => {
            e.preventDefault();
            const targetElement = document.getElementById('result-details') || document.getElementById('result-page');
            targetElement.scrollIntoView({ behavior: 'smooth' });
        });

        this.elements.resultPage.addEventListener('scroll', () => this.ui.updateScrollIndicator());
        window.addEventListener('scroll', () => this.ui.updateScrollIndicator(), { passive: true });
        window.addEventListener('resize', () => this.ui.updateScrollIndicator());

        this.elements.resultTbody.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('btn-details')) {
                const dayIndex = parseInt(e.target.dataset.dayIndex, 10);
                if (this.state.lastCalculatedPlan && !isNaN(dayIndex) && this.state.lastCalculatedPlan[dayIndex]) {
                    this.ui.showDayDetail(this.state.lastCalculatedPlan[dayIndex], dayIndex + 1);
                }
            }
        });
    },
    
    // --- CORE LOGIC ---
    initInputPage(configType) {
        const mapContainer = document.getElementById(`${configType}-map-container`);
        const listContainer = document.getElementById(`${configType}-config-list`);
        mapContainer.querySelectorAll('.map-marker').forEach(marker => marker.remove());
        listContainer.innerHTML = '';
        
        for (const groupId in eliteGroups) {
            const group = eliteGroups[groupId];
            const marker = document.createElement('div');
            marker.className = 'map-marker glowing';
            marker.id = `${configType}-marker-${groupId}`;
            if (group.iconUrl) marker.style.backgroundImage = `url(${group.iconUrl})`;
            else marker.textContent = groupId;
            marker.addEventListener('click', () => this.openGroupSelector(configType, groupId));
            mapContainer.appendChild(marker);

            const item = document.createElement('div');
            item.className = 'config-item';
            item.innerHTML = `<span class="config-item-label">${group.name}</span>`;
            const buttons = document.createElement('div');
            buttons.className = 'pattern-buttons';
            buttons.id = `${configType}-buttons-${groupId}`;
            ['A', 'B', 'C'].forEach(pattern => {
                const btn = document.createElement('button');
                btn.textContent = pattern;
                btn.addEventListener('click', () => this.updateConfig(configType, groupId, pattern));
                buttons.appendChild(btn);
            });
            item.appendChild(buttons);
            listContainer.appendChild(item);
        }
        setTimeout(() => this.ui.updateMapLayout(`${configType}-map-container`), 100);
    },

    openGroupSelector(configType, groupId) {
        this.state.activeSelection = { configType, groupId };
        this.ui.renderGroupSelector(groupId, this.state[configType === 'current' ? 'currentConfig' : 'idealConfig'][groupId]);
        this.ui.showModal('zoom-view');
    },
            
    selectPatternForConfirmation(pattern) {
        this.state.activeSelection.pattern = pattern;
        this.ui.renderScreenshotPopup(this.state.activeSelection.groupId, pattern);
        this.elements.confirmPatternBtn.onclick = () => this.confirmPatternSelection();
        this.ui.showModal('screenshot-popup');
    },

    confirmPatternSelection() {
        const { configType, groupId, pattern } = this.state.activeSelection;
        if (configType && groupId && pattern) this.updateConfig(configType, groupId, pattern);
        this.ui.closeModal('screenshot-popup');
        this.ui.closeModal('zoom-view');
    },

    updateConfig(configType, groupId, pattern) {
        const config = (configType === 'current') ? this.state.currentConfig : this.state.idealConfig;
        config[groupId] = pattern;
        
        this.ui.updateConfigDisplay(configType, groupId, pattern);
        
        if (configType === 'current') {
            this.ui.updateProgress(Object.keys(this.state.currentConfig).length);
        } else {
            this.ui.updateIdealProgress(Object.keys(this.state.idealConfig).length);
        }
        this.ui.updateGuideTextVisibility(Object.keys(this.state.currentConfig).length > 0, Object.keys(this.state.idealConfig).length > 0);
    },

    setRecommendedConfig() {
        for (const groupId in recommendedConfig) this.updateConfig('ideal', groupId, recommendedConfig[groupId]);
    },

    copyCurrentConfigToIdeal() {
        for (const groupId in this.state.currentConfig) {
            this.updateConfig('ideal', groupId, this.state.currentConfig[groupId]);
        }
    },

    resetApp() {
        this.state.currentConfig = {};
        this.state.idealConfig = {};
        this.initInputPage('current');
        this.initInputPage('ideal');
        this.ui.updateProgress(0);
        this.ui.updateIdealProgress(0);
        this.ui.updateGuideTextVisibility(false, false);
        this.ui.showPage('start-page');
    },

    fillAllConfigs(pattern) {
        for (const groupId of groupKeys) {
            this.updateConfig('current', groupId, pattern);
        }
    },

    configToString(config) {
        return groupKeys.map(key => config[key]).join('');
    },

    generatePossibleDailyActions() {
        const achievablePatterns = new Map();
        achievablePatterns.set(JSON.stringify([]), { name: '何もしない', affectedGroups: new Set() });
        const numActions = actionsData.length;
        for (let i = 1; i < (1 << numActions); i++) {
            const currentActions = [];
            const affectedGroupsSet = new Set();
            for (let j = 0; j < numActions; j++) {
                if ((i >> j) & 1) {
                    const action = actionsData[j];
                    currentActions.push(action);
                    action.affectedGroups.forEach(group => affectedGroupsSet.add(group));
                }
            }
            const key = JSON.stringify([...affectedGroupsSet].sort());
            if (!achievablePatterns.has(key)) {
                achievablePatterns.set(key, { name: currentActions.map(a => a.name).join(' + '), affectedGroups: affectedGroupsSet });
            }
        }
        this.possibleDailyActions = Array.from(achievablePatterns.values());
        console.log(`Generated ${this.possibleDailyActions.length} unique daily actions.`);
    },

    /**
     * Acts as a controller to initiate the plan calculation.
     * It gathers data, shows the loading UI, and delegates the actual calculation
     * to the PlanCalculator module.
     * @param {boolean} isMultiplayer - User setting for multiplayer mode.
     * @param {boolean} allowBoat - User setting for allowing boat actions.
     */
    calculatePlan(isMultiplayer, allowBoat) {
        if (Object.keys(this.state.currentConfig).length !== totalGroups || Object.keys(this.state.idealConfig).length === 0) {
            alert('全ての現在配置と、1つ以上の理想配置を入力してください。');
            return;
        }
        
        this.ui.showLoadingModal();
        if (this.state.calculationTask) {
            this.state.calculationTask.cancel();
        }

        const actionsToUse = this.possibleDailyActions.filter(action => allowBoat || !action.name.includes('ボート'));

        const calculationParams = {
            startConfigStr: this.configToString(Object.fromEntries(groupKeys.map(k => [k, this.constants.PATTERN_MAP[this.state.currentConfig[k]]]))),
            endConfigStr: this.configToString(Object.fromEntries(groupKeys.map(k => [k, this.constants.PATTERN_MAP[this.state.idealConfig[k] || this.state.currentConfig[k]]]))),
            actionsToUse,
            isMultiplayer,
        };
        
        this.state.calculationTask = PlanCalculator.findShortestPlan(
            calculationParams,
            (progressCount) => {
                // onProgress callback
                this.ui.updateCalculationProgress(progressCount);
            },
            (finalPlan) => {
                // onComplete callback
                this.ui.displayResults(finalPlan, isMultiplayer, allowBoat);
                this.ui.closeModal('loading-modal');
                this.state.calculationTask = null;
            }
        );
    },

    // --- SAVE/LOAD LOGIC ---
    getSavedPlans: () => {
        try { const d = localStorage.getItem('tsurumiSavedPlans'); return d ? JSON.parse(d) : []; } 
        catch (e) { console.error("Failed to read saved plans:", e); return []; }
    },

    savePlan() {
        const planName = prompt("この調整プランの名前を入力してください:", "マイプラン " + new Date().toLocaleDateString());
        if (!planName || planName.trim() === "") return;
        const planData = {
            id: Date.now().toString(), name: planName.trim(),
            currentConfig: this.state.currentConfig, idealConfig: this.state.idealConfig,
            plan: this.state.lastCalculatedPlan.map(d => ({...d, holdAction: {...d.holdAction, affectedGroups: [...d.holdAction.affectedGroups||[]]}, advanceAction: {...d.advanceAction, affectedGroups: [...d.advanceAction.affectedGroups||[]]}})),
            isMultiplayer: document.getElementById('multiplayer-mode-checkbox').checked,
            createdAt: new Date().toISOString()
        };
        try { const p = this.getSavedPlans(); p.push(planData); localStorage.setItem('tsurumiSavedPlans', JSON.stringify(p)); alert(`「${planName}」を保存しました。`); } 
        catch (e) { console.error("Failed to save plan:", e); alert("プランの保存に失敗しました。"); }
    },

    loadPlan(planId) {
        const planToLoad = this.getSavedPlans().find(p => p.id === planId);
        if (!planToLoad) { alert("プランの読み込みに失敗しました。"); return; }
        this.state.currentConfig = planToLoad.currentConfig;
        this.state.idealConfig = planToLoad.idealConfig;
        this.state.lastCalculatedPlan = planToLoad.plan.map(d => ({...d, holdAction: {...d.holdAction, affectedGroups: new Set(d.holdAction.affectedGroups||[])}, advanceAction: {...d.advanceAction, affectedGroups: new Set(d.advanceAction.affectedGroups||[])}}));
        document.getElementById('multiplayer-mode-checkbox').checked = planToLoad.isMultiplayer;
        for (const g in this.state.currentConfig) this.updateConfig('current', g, this.state.currentConfig[g]);
        for (const g in this.state.idealConfig) this.updateConfig('ideal', g, this.state.idealConfig[g]);
        this.ui.displayResults(this.state.lastCalculatedPlan, planToLoad.isMultiplayer, document.getElementById('boat-mode-checkbox').checked);
        this.ui.closeModal('load-plan-modal');
    },

    deletePlan(planId) {
        if (!confirm("本当にこのプランを削除しますか？")) return;
        let plans = this.getSavedPlans().filter(p => p.id !== planId);
        try { localStorage.setItem('tsurumiSavedPlans', JSON.stringify(plans)); this.ui.renderSavedPlans(); } 
        catch (e) { console.error("Failed to delete plan:", e); alert("プランの削除に失敗しました。"); }
    },
    
    // --- UI MODULE ---
    ui: {
        showPage(pageId) {
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById(pageId).classList.add('active');
            document.querySelectorAll('.step').forEach(step => step.classList.remove('active-step'));
            let stepNum = 1;
            if (pageId.includes('ideal')) stepNum = 2;
            else if (pageId.includes('result')) stepNum = 3;
            document.querySelectorAll(`.step[data-step="${stepNum}"]`).forEach(el => el.classList.add('active-step'));
            if (pageId.includes('config')) setTimeout(() => TsurumiApp.ui.updateMapLayout(`${pageId.split('-')[0]}-map-container`), 50);
            TsurumiApp.ui.updateScrollIndicator();
        },

        showModal: (modalId) => document.getElementById(modalId).classList.add('active'),
        closeModal(modalId) {
            if (modalId === 'loading-modal' && TsurumiApp.state.calculationTask) {
                TsurumiApp.state.calculationTask.cancel();
                TsurumiApp.state.calculationTask = null;
            }
            document.getElementById(modalId).classList.remove('active');
        },

        switchInputView(configType, viewType) {
            document.getElementById(`${configType}-map-tab`).classList.toggle('active', viewType === 'map');
            document.getElementById(`${configType}-list-tab`).classList.toggle('active', viewType === 'list');
            document.getElementById(`${configType}-map-view`).classList.toggle('active', viewType === 'map');
            document.getElementById(`${configType}-list-view`).classList.toggle('active', viewType === 'list');
            if (viewType === 'map') setTimeout(() => this.updateMapLayout(`${configType}-map-container`), 50);
        },
        
        showValidationError(message) {
            TsurumiApp.elements.validationMessage.textContent = message;
            TsurumiApp.elements.validationMessage.classList.add('show');
            TsurumiApp.elements.goToIdealBtn.classList.add('shake');
            setTimeout(() => TsurumiApp.elements.validationMessage.classList.remove('show'), 2000);
            setTimeout(() => TsurumiApp.elements.goToIdealBtn.classList.remove('shake'), 600);
        },

        renderGroupSelector(groupId, selectedPattern) {
            TsurumiApp.elements.zoomTitle.textContent = `${eliteGroups[groupId].name} のパターンを選択`;
            const { zoomMapContainer } = TsurumiApp.elements;
            const zoomMapImage = zoomMapContainer.querySelector('img');
            if (zoomMapImage && eliteGroups[groupId].zoomMapUrl) {
                this.setupImageLoader(zoomMapImage);
                zoomMapImage.src = eliteGroups[groupId].zoomMapUrl;
            }
            zoomMapContainer.querySelectorAll('.pattern-marker').forEach(m => m.remove());
            ['A', 'B', 'C'].forEach(pattern => {
                const pos = patternMarkerPositions[groupId]?.[pattern];
                if (!pos) return;
                const marker = document.createElement('div');
                marker.className = 'pattern-marker';
                marker.innerHTML = `<span class="pattern-label">${pattern}</span>`;
                if (pattern === selectedPattern) { marker.classList.add('completed'); marker.innerHTML = '✔'; }
                const top = 100 - parseFloat(pos.bottom);
                const left = 100 - parseFloat(pos.right);
                marker.style.top = `${top}%`;
                marker.style.left = `${left}%`;
                marker.addEventListener('click', () => TsurumiApp.selectPatternForConfirmation(pattern));
                zoomMapContainer.appendChild(marker);
            });
        },

        renderScreenshotPopup(groupId, pattern) {
            TsurumiApp.elements.screenshotTitle.textContent = `${eliteGroups[groupId].name} - パターン ${pattern} で合っていますか？`;
            const imageUrl = screenshotImageUrls[groupId]?.[pattern];
            this.setupImageLoader(TsurumiApp.elements.screenshotImg);
            TsurumiApp.elements.screenshotImg.src = imageUrl || `https://placehold.co/500x300/ff0000/ffffff?text=Image+Not+Found`;
        },
        
        updateConfigDisplay(configType, groupId, pattern) {
            const marker = document.getElementById(`${configType}-marker-${groupId}`);
            marker.classList.remove('glowing');
            marker.classList.add('completed');
            marker.innerHTML = '✔';
            document.getElementById(`${configType}-buttons-${groupId}`).querySelectorAll('button').forEach(btn => {
                btn.classList.toggle('selected', btn.textContent === pattern);
            });
        },

        updateProgress(count) {
            TsurumiApp.elements.progressText.textContent = `入力完了: ${count} / ${totalGroups}`;
            TsurumiApp.elements.goToIdealBtn.disabled = count !== totalGroups;
        },

        updateIdealProgress(count) {
            TsurumiApp.elements.idealProgressText.textContent = `入力完了: ${count} / ${totalGroups}`;
        },

        updateGuideTextVisibility(isCurrentStarted, isIdealStarted) {
            document.querySelector('#current-map-container .map-guide-text').classList.toggle('hidden', isCurrentStarted);
            document.querySelector('#ideal-map-container .map-guide-text').classList.toggle('hidden', isIdealStarted);
        },

        updateMapLayout(containerId) {
            const mapContainer = document.getElementById(containerId);
            if (!mapContainer || !mapContainer.offsetParent) return;
            const mapImage = mapContainer.querySelector('.map-bg');
            if (!mapImage.complete || mapImage.naturalWidth === 0) return;
            const cRect = mapContainer.getBoundingClientRect();
            const iRatio = mapImage.naturalWidth / mapImage.naturalHeight;
            const cRatio = cRect.width / cRect.height;
            let width, height, x, y;
            if (iRatio > cRatio) { [width, height, x, y] = [cRect.width, cRect.width / iRatio, 0, (cRect.height - height) / 2]; }
            else { [height, width, y, x] = [cRect.height, cRect.height * iRatio, 0, (cRect.width - width) / 2]; }
            mapContainer.querySelectorAll('.map-marker').forEach(m => {
                const gId = m.id.split('-')[2];
                const pos = markerPositions[gId];
                if (pos) {
                    m.style.left = `${x + (width * (parseFloat(pos.left) / 100)) - m.offsetWidth / 2}px`;
                    m.style.top = `${y + (height * (parseFloat(pos.top) / 100)) - m.offsetHeight / 2}px`;
                }
            });
        },
        
        showLoadingModal() {
            TsurumiApp.elements.loadingText.innerHTML = `<span style="display: block; font-size: 1.1em; font-weight: bold; margin-bottom: 15px;">このツールは、<a href="https://youtu.be/2xqllaCTP5c?si=m9yyxXo5GS0rwFG9" target="_blank" rel="noopener noreferrer" style="color: var(--accent-color); font-weight: bold;">ねこしたさんの解説</a>に基づき、プログラムされました！<br>ぜひ解説動画もご覧ください。</span><span style="font-size: 0.9em; color: var(--secondary-text-color);">計算には数分かかる場合がありますので、しばらくお待ちください。</span>`;
            this.updateCalculationProgress(0);
            this.showModal('loading-modal');
        },

        updateCalculationProgress(count) {
            TsurumiApp.elements.calculationProgress.textContent = `検証済みパターン: ${count} / 59049`;
        },

        displayResults(plan, isMultiplayer, allowBoat) {
            TsurumiApp.state.lastCalculatedPlan = plan;
            const { resultTbody, resultSummary, soloModeNotice, recalculateBtn, savePlanBtn } = TsurumiApp.elements;
            resultTbody.innerHTML = '';

            if (isMultiplayer) {
                recalculateBtn.textContent = '周期ホールドOFFで再計算';
                recalculateBtn.onclick = () => TsurumiApp.calculatePlan(false, allowBoat);
                recalculateBtn.className = 'btn btn-primary';
                soloModeNotice.style.display = 'none';
            } else {
                recalculateBtn.textContent = '周期ホールドONで再計算';
                recalculateBtn.onclick = () => TsurumiApp.calculatePlan(true, allowBoat);
                recalculateBtn.className = 'btn btn-multi';
                soloModeNotice.style.display = '';
            }

            resultSummary.textContent = plan === null ? '8日以内に完了する調整プランは見つかりませんでした。' 
                                      : plan.length === 0 ? '調整は不要です！' 
                                      : `最短 ${plan.length} 日で調整が完了します！`;
            recalculateBtn.style.display = 'block';

            if (plan && plan.length > 0) {
                savePlanBtn.style.display = '';
                plan.forEach((day, index) => {
                    const tr = resultTbody.insertRow();
                    const modeClass = day.mode === 'ソロ' ? 'mode-solo' : 'mode-multi';
                    tr.innerHTML = `
                        <td>${index + 1}日目</td>
                        <td><span class="${modeClass}">${day.mode}</span></td>
                        <td>${day.holdAction.name}</td>
                        <td>${day.advanceAction.name}</td>
                        <td><button class="btn btn-details" data-day-index="${index}">手順を確認</button></td>`;
                });
            } else {
                savePlanBtn.style.display = 'none';
                if(plan !== null) recalculateBtn.style.display = 'none';
            }
            this.showPage('result-page');
            TsurumiApp.elements.resultPage.scrollTop = 0;
            setTimeout(() => this.updateScrollIndicator(), 150);
        },

        showDayDetail(dayData, dayNumber) {
            TsurumiApp.elements.dayDetailTitle.textContent = `${dayNumber}日目の手順詳細`;
            let contentHTML = '<p style="text-align:center; color: var(--secondary-text-color);"><strong>【重要】</strong>「歩き」や「ボート」での移動は、<strong>ルートを慎重に確認し、閑雲や放浪者のような高速移動キャラは使用しないでください。</strong></p>';
            if (dayData.mode === 'ソロ') {
                contentHTML += `<h3>ソロモードでの行動</h3>${this.generateActionDetailsHTML(dayData.advanceAction, "1P (ホスト)")}`;
            } else {
                const eff = new Set([...dayData.advanceAction.affectedGroups].filter(x => !dayData.holdAction.affectedGroups.has(x)));
                contentHTML += `<h3>マルチモードでの行動</h3><h4>Step 1: 準備</h4><p>ホスト(1P)は鶴観以外の安全な場所に移動し、ゲスト(2P)を世界に招き入れます。</p><h4>Step 2: 周期のホールド (ゲストの操作)</h4>`;
                contentHTML += (dayData.holdAction.name === '何もしない' || dayData.holdAction.name === '---') 
                    ? `<p><strong>行動:</strong> なし</p><p>この日はゲスト(2P)の操作は不要です。</p>`
                    : `<p><strong>[重要]</strong> まずホスト(1P)が層岩巨淵・地下鉱区など、<strong>テイワット以外のマップに移動</strong>するのを待ちます。</p><p>ホストの移動後、ゲスト(2P)は以下の行動で指定されたグループの周期を<strong>ホールド(固定)</strong>します。</p>${this.generateActionDetailsHTML(dayData.holdAction, "2P (ゲスト)")}<p><strong>[重要]</strong> ゲストは上記行動を終えたら、速やかにホストの世界から退出してください。</p>`;
                contentHTML += `<h4 style="margin-top: 25px;">Step 3: 周期の進行 (ホストの操作)</h4>`;
                contentHTML += (dayData.advanceAction.name === '何もしない' || dayData.advanceAction.name === '---' || eff.size === 0)
                    ? `<p><strong>行動:</strong> なし</p><p>ホストの特別な行動は不要です。日付が変わるのを待ってください。</p>`
                    : `<p>ゲストが退出してソロ状態に戻った後、ホスト(1P)は以下の行動で、ゲストが<strong>ホールドしなかった</strong>グループの周期を1つ<strong>進めます</strong>。</p>${this.generateActionDetailsHTML({name: dayData.advanceAction.name, affectedGroups: eff}, "1P (ホスト)")}`;
            }
            TsurumiApp.elements.dayDetailContent.innerHTML = contentHTML;
            TsurumiApp.elements.dayDetailContent.querySelectorAll('.image-container img').forEach(img => this.setupImageLoader(img));
            this.showModal('day-detail-modal');
        },

        generateActionDetailsHTML(actionData, playerRole) {
            if (!actionData || !actionData.name || actionData.name === '---' || actionData.name === '何もしない') return '<p>特別な行動は不要です。</p>';
            const actions = actionData.name.split(' + ');
            const affected = [...actionData.affectedGroups].map(k => `「${eliteGroups[k].name}」`).join('、');
            let html = `<p><strong>実行する行動:</strong> ${actions.join(', ')}</p><p><strong>影響を受けるグループ:</strong> ${affected}</p><ul>`;
            actions.forEach(name => {
                const action = actionsData.find(a => a.name === name);
                if (!action) return;
                const details = actionDetails[action.id] || {};
                html += `<li><strong>${name}</strong><p>${(details.note || '').replace(/\n/g, '<br>')}</p>`;
                if (details.images) details.images.forEach(url => { html += `<div class="image-container"><div class="image-loader">読み込み中...</div><img src="${url}" alt="${name} のルート図"></div>`; });
                if (details.videoUrl) try {
                    const url = new URL(details.videoUrl); let vId=url.searchParams.get('v')||url.pathname.split('/').pop(); let start=url.searchParams.get('t')||(url.search.match(/[?&]t=(\d+)/)||[])[1];
                    html += `<p style="margin-top:15px;"><strong>参考動画:</strong></p><div class="video-container"><iframe src="https://www.youtube.com/embed/${vId}${start?`?start=${start.replace('s','')}`:''}" title="YouTube" frameborder="0" allowfullscreen></iframe></div>`;
                } catch(e) { console.error("Invalid video URL:", details.videoUrl); }
                html += `</li>`;
            });
            return html + '</ul>';
        },

        ensureScrollIndicatorIsInBody: () => {
          const i = TsurumiApp.elements.scrollIndicator;
          if (i && i.parentElement !== document.body) document.body.appendChild(i);
        },

        updateScrollIndicator() {
            const { resultPage, scrollIndicator } = TsurumiApp.elements;
            if (!resultPage || !scrollIndicator) return;
            if (!resultPage.classList.contains('active')) { scrollIndicator.classList.add('hidden'); return; }
            const container = resultPage.scrollHeight > resultPage.clientHeight ? resultPage : (document.scrollingElement || document.documentElement);
            const isScrollable = container.scrollHeight > container.clientHeight;
            const atTop = container.scrollTop < 50;
            scrollIndicator.classList.toggle('hidden', !(isScrollable && atTop));
        },
        
        openLoadModal() {
            this.renderSavedPlans();
            this.showModal('load-plan-modal');
        },

        renderSavedPlans() {
            const plans = TsurumiApp.getSavedPlans();
            const { savedPlansList, noSavedPlans } = TsurumiApp.elements;
            savedPlansList.innerHTML = '';
            noSavedPlans.style.display = plans.length === 0 ? 'block' : 'none';
            savedPlansList.style.display = plans.length > 0 ? '' : 'none';
            if (plans.length === 0) return;

            plans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(plan => {
                const li = document.createElement('li');
                li.className = 'saved-plan-item';
                li.innerHTML = `<span class="saved-plan-item-name">${plan.name}</span><div class="saved-plan-item-actions"><button class="btn btn-primary btn-load" data-plan-id="${plan.id}">読込</button><button class="btn btn-delete" data-plan-id="${plan.id}">削除</button></div>`;
                savedPlansList.appendChild(li);
            });
            savedPlansList.querySelectorAll('.btn-load').forEach(b => b.addEventListener('click', () => TsurumiApp.loadPlan(b.dataset.planId)));
            savedPlansList.querySelectorAll('.btn-delete').forEach(b => b.addEventListener('click', () => TsurumiApp.deletePlan(b.dataset.planId)));
        },

        setupImageLoader(imgElement) {
            const container = imgElement.parentElement;
            if (!container.classList.contains('image-container')) return;
            container.classList.remove('loaded');
            imgElement.onload = () => container.classList.add('loaded');
            imgElement.onerror = () => { container.querySelector('.image-loader').textContent = '画像の読込失敗'; };
            if (imgElement.complete && imgElement.src) imgElement.onload();
        }
    }
};

// --- SCRIPT START ---
document.addEventListener('DOMContentLoaded', () => TsurumiApp.init());

