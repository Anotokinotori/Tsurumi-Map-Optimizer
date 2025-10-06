/**
 * Tsurumi Map Optimizer - Main Application
 * メインアプリケーションクラス
 */

import { groupKeys, recommendedConfig, totalGroups } from './data.js';
import { AppState } from './modules/state.js';
import { DOMCache } from './modules/dom-cache.js';
import { StorageManager } from './modules/storage.js';
import { UIManager } from './modules/ui-manager.js';
import { PlanCalculator } from './modules/calculator.js';
import { EventHandler } from './modules/event-handler.js';

class TsurumiApp {
    constructor() {
        // 各モジュールを初期化
        this.state = new AppState();
        this.dom = new DOMCache();
        this.storage = new StorageManager();
        this.ui = new UIManager(this.dom, this.state, this.storage);
        this.events = new EventHandler(this);
    }

    /**
     * アプリケーションを初期化
     */
    init() {
        this.ui.initInputPage('current');
        this.ui.initInputPage('ideal');
        this.events.bindAll();

        // Check if the info banner was previously closed
        if (this.storage.isBannerClosed()) {
            this.dom.get('infoBanner').style.display = 'none';
        }
    }

    /**
     * 配置を更新
     */
    updateConfig(configType, groupId, pattern) {
        this.state.setConfig(configType, groupId, pattern);
        
        this.ui.updateMarker(configType, groupId, pattern);
        this.ui.updatePatternButtons(configType, groupId, pattern);
        this.ui.updateProgress(configType);

        // If CURRENT config changes, it must be reflected in the IDEAL page's display
        if (configType === 'current') {
            this.ui.updateIdealDiffDisplay(groupId, pattern);
            this.ui.updateIdealMapOverlay(groupId); 
        } 
        // If IDEAL config changes, we need to update its overlay (to hide it)
        else if (configType === 'ideal') {
            this.ui.updateIdealMapOverlay(groupId);
        }

        this.ui.updateGuideTextVisibility();
    }

    /**
     * すべての配置を一括入力
     */
    fillAllConfigs(pattern) {
        groupKeys.forEach(groupId => this.updateConfig('current', groupId, pattern));
    }

    /**
     * 推奨配置を設定
     */
    setRecommendedConfig() {
        groupKeys.forEach(groupId => {
            if (recommendedConfig[groupId]) {
                this.updateConfig('ideal', groupId, recommendedConfig[groupId]);
            }
        });
    }

    /**
     * 現在の配置を理想にコピー
     */
    copyCurrentConfigToIdeal() {
        groupKeys.forEach(groupId => {
            if (this.state.currentConfig[groupId]) {
                this.updateConfig('ideal', groupId, this.state.currentConfig[groupId]);
            }
        });
    }

    /**
     * アプリをリセット
     */
    resetApp() {
        this.state.reset();
        this.ui.initInputPage('current');
        this.ui.initInputPage('ideal');
        this.ui.updateProgress('current');
        this.ui.updateProgress('ideal');
        this.ui.updateGuideTextVisibility();
        this.ui.showPage('start-page');
    }

    /**
     * プランを計算
     */
    calculatePlan() {
        this.state.setActivePlanId(null);
        const isMultiplayer = this.dom.get('multiplayerCheckbox').checked;
        const allowBoat = this.dom.get('boatCheckbox').checked;

        if (Object.keys(this.state.currentConfig).length !== totalGroups || 
            Object.keys(this.state.idealConfig).length !== totalGroups) {
            this.ui.showValidationMessage(
                '全ての現在配置と理想配置を入力してください。', 
                this.dom.get('calculatePlanBtn')
            );
            return;
        }

        // Increment the anonymous calculation counter on Firestore
        this.storage.incrementCalculationCount();

        const loadingTextEl = document.getElementById('loading-text');
        if (loadingTextEl) {
            loadingTextEl.innerHTML = `<span style="display: block; font-size: 1.1em; font-weight: bold; margin-bottom: 15px;">このツールは、<a href="https://youtu.be/2xqllaCTP5c?si=m9yyxXo5GS0rwFG9" target="_blank" rel="noopener noreferrer" style="color: var(--accent-color); font-weight: bold;">ねこしたさんの解説</a>に基づき、プログラムされました！<br>ぜひ解説動画もご覧ください。</span><span style="font-size: 0.9em; color: var(--secondary-text-color);">計算には数分かかる場合がありますので、しばらくお待ちください。</span>`;
        }
        
        const progressEl = document.getElementById('calculation-progress');
        const onProgress = (verifiedCount) => {
            if (progressEl) {
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
                this.state.setPlan(plan);
                this.ui.displayResults(plan, isMultiplayer, allowBoat);
                this.ui.closeModal('loading-modal');
                if (progressEl) progressEl.textContent = '';
            });
        }, 50);
    }

    /**
     * プランを保存
     */
    savePlan() {
        const planName = window.prompt(
            "結果を保存します。名前を入力してください:", 
            "マイプラン " + new Date().toLocaleDateString()
        );
        if (!planName || planName.trim() === "") return;

        const plan = this.state.getPlan();
        const serializablePlan = plan.map(day => ({
            ...day,
            holdAction: { 
                ...day.holdAction, 
                affectedGroups: Array.from(day.holdAction.affectedGroups || []) 
            },
            advanceAction: { 
                ...day.advanceAction, 
                affectedGroups: Array.from(day.advanceAction.affectedGroups || []) 
            }
        }));
        
        const newPlanId = Date.now().toString();
        this.state.setActivePlanId(newPlanId);

        const planData = {
            id: newPlanId,
            name: planName.trim(),
            currentConfig: this.state.currentConfig,
            idealConfig: this.state.idealConfig,
            plan: serializablePlan,
            isMultiplayer: this.dom.get('multiplayerCheckbox').checked,
            createdAt: new Date().toISOString()
        };

        if (this.storage.savePlan(planData)) {
            // Re-render the results to attach the new planId to the rows
            this.ui.displayResults(
                this.state.getPlan(), 
                planData.isMultiplayer, 
                this.dom.get('boatCheckbox').checked
            );
        }
    }

    /**
     * プランを読み込み
     */
    loadPlan(planId) {
        const planToLoad = this.storage.getPlanById(planId);
        if (!planToLoad) return;

        const deserializedPlan = planToLoad.plan.map(day => ({
            ...day,
            holdAction: { 
                ...day.holdAction, 
                affectedGroups: new Set(day.holdAction.affectedGroups || []) 
            },
            advanceAction: { 
                ...day.advanceAction, 
                affectedGroups: new Set(day.advanceAction.affectedGroups || []) 
            }
        }));

        this.state.currentConfig = planToLoad.currentConfig;
        this.state.idealConfig = planToLoad.idealConfig;
        this.state.setPlan(deserializedPlan);
        this.state.setActivePlanId(planToLoad.id);
        this.dom.get('multiplayerCheckbox').checked = planToLoad.isMultiplayer;

        groupKeys.forEach(groupId => {
            if (this.state.currentConfig[groupId]) {
                this.updateConfig('current', groupId, this.state.currentConfig[groupId]);
            }
            if (this.state.idealConfig[groupId]) {
                this.updateConfig('ideal', groupId, this.state.idealConfig[groupId]);
            }
        });

        this.ui.displayResults(
            this.state.getPlan(), 
            planToLoad.isMultiplayer, 
            this.dom.get('boatCheckbox').checked
        );
        this.ui.closeModal('load-plan-modal');
    }

    /**
     * プランを削除
     */
    deletePlan(planId) {
        if (!window.confirm("このプランを削除しますか？進捗もリセットされます。")) return;
        
        if (this.storage.deletePlan(planId)) {
            this.ui.renderSavedPlans();
        }
    }

    /**
     * 進捗を切り替え
     */
    toggleProgress(dayIndex) {
        const activePlanId = this.state.getActivePlanId();
        
        if (!activePlanId) {
            if (window.confirm("結果を保存すると、進捗を記録できます。\n今すぐ保存しますか？")) {
                this.savePlan();
            }
            return;
        }

        const allProgress = this.storage.getProgressData();
        const currentProgress = allProgress[activePlanId]?.[dayIndex] || false;
        
        this.storage.saveProgress(activePlanId, dayIndex, !currentProgress);
        this.ui.updateProgressView(activePlanId, dayIndex);
    }
}

// グローバルに公開（後方互換性のため）
window.TsurumiApp = new TsurumiApp();

// アプリを起動
document.addEventListener('DOMContentLoaded', () => {
    window.TsurumiApp.init();
});
