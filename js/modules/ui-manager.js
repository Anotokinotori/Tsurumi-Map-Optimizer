/**
 * UI Manager Module
 * UI全体の操作を管理するメインクラス
 */

import { groupKeys, eliteGroups, markerPositions, totalGroups } from '../data.js';
import { InputPageManager } from './ui/input-page.js';
import { ModalManager } from './ui/modals.js';
import { ResultPageManager } from './ui/result-page.js';

export class UIManager {
    constructor(domCache, state, storage) {
        this.dom = domCache;
        this.state = state;
        this.storage = storage;
        
        // サブマネージャーを初期化
        this.inputPage = new InputPageManager(domCache, state, this);
        this.modals = new ModalManager(domCache, state, this);
        this.resultPage = new ResultPageManager(domCache, state, storage, this);
    }

    /**
     * 入力ページを初期化
     */
    initInputPage(configType) {
        this.inputPage.init(configType);
    }

    /**
     * ページを表示
     */
    showPage(pageId) {
        this.dom.get('pages').forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');

        this.dom.get('steps').forEach(step => step.classList.remove('active-step'));
        let activeStepNumber = 1;
        if (pageId.includes('current')) activeStepNumber = 1;
        else if (pageId.includes('ideal')) activeStepNumber = 2;
        else if (pageId.includes('result')) activeStepNumber = 3;
        
        document.querySelectorAll(`.step[data-step="${activeStepNumber}"]`).forEach(stepEl => stepEl.classList.add('active-step'));
        
        if (pageId.includes('config')) {
            const containerId = `${pageId.split('-')[0]}-map-container`;
            this.updateMapLayout(containerId);
        }
    }

    /**
     * マップレイアウトを更新
     */
    updateMapLayout(containerId) {
        const mapContainer = document.getElementById(containerId);
        if (!mapContainer || !mapContainer.offsetParent) return;

        const mapImage = mapContainer.querySelector('.map-bg');
        if (!mapImage || !mapImage.complete || mapImage.naturalWidth === 0) return;
        
        const elementsToPosition = mapContainer.querySelectorAll('.map-marker, .map-marker-overlay');
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

        elementsToPosition.forEach(el => {
            const idParts = el.id.split('-');
            const groupId = idParts[idParts.length - 1];

            const pos = markerPositions[groupId];
            if (pos) {
                const newLeft = offsetX + (renderedWidth * (parseFloat(pos.left) / 100));
                const newTop = offsetY + (renderedHeight * (parseFloat(pos.top) / 100));
                el.style.left = `${newLeft - el.offsetWidth / 2}px`;
                el.style.top = `${newTop - el.offsetHeight / 2}px`;
            }
        });
    }

    /**
     * 進捗状況を更新
     */
    updateProgress(configType) {
        const config = this.state.getConfig(configType);
        const progressEl = (configType === 'current') 
            ? this.dom.get('progressText') 
            : this.dom.get('idealProgressText');
        const count = Object.keys(config).length;
        progressEl.textContent = `入力完了: ${count} / ${totalGroups}`;
        
        if (configType === 'current') {
            this.dom.get('goToIdealBtn').disabled = count !== totalGroups;
        }
        if (configType === 'ideal') {
            this.dom.get('calculatePlanBtn').disabled = count !== totalGroups;
        }
    }

    /**
     * マーカーを更新
     */
    updateMarker(configType, groupId, pattern) {
        const marker = document.getElementById(`${configType}-marker-${groupId}`);
        marker.classList.remove('glowing', 'completed-a', 'completed-b', 'completed-c');
        
        marker.innerHTML = pattern;
        marker.style.backgroundImage = 'none';

        marker.classList.add(`completed-${pattern.toLowerCase()}`);
    }

    /**
     * パターンボタンを更新
     */
    updatePatternButtons(configType, groupId, pattern) {
        document.getElementById(`${configType}-buttons-${groupId}`).querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('selected', btn.textContent === pattern);
        });
    }

    /**
     * 理想ページの差分表示を更新
     */
    updateIdealDiffDisplay(groupId, newCurrentPattern) {
        const diffEl = document.getElementById(`ideal-list-diff-${groupId}`);
        if (diffEl) {
            diffEl.textContent = `現在配置: ${newCurrentPattern || '?'}`;
        }
    }

    /**
     * 理想ページのマップオーバーレイを更新
     */
    updateIdealMapOverlay(groupId) {
        const overlay = document.getElementById(`ideal-overlay-${groupId}`);
        if (!overlay) return;

        const isIdealSet = this.state.idealConfig.hasOwnProperty(groupId);
        overlay.style.display = isIdealSet ? 'none' : 'flex';

        if (!isIdealSet) {
            const currentPattern = this.state.currentConfig[groupId];
            overlay.textContent = currentPattern || '';
        }
    }

    /**
     * ガイドテキストの表示/非表示を更新
     */
    updateGuideTextVisibility() {
        const isCurrentStarted = Object.keys(this.state.currentConfig).length > 0;
        const isIdealStarted = Object.keys(this.state.idealConfig).length > 0;
        document.querySelector('#current-map-container .map-guide-text').classList.toggle('hidden', isCurrentStarted);
        document.querySelector('#ideal-map-container .map-guide-text').classList.toggle('hidden', isIdealStarted);
    }

    /**
     * バリデーションメッセージを表示
     */
    showValidationMessage(message, targetElement) {
        const validationMessage = this.dom.get('validationMessage');
        validationMessage.textContent = message;
        validationMessage.classList.add('show');
        targetElement.classList.add('shake');
        setTimeout(() => validationMessage.classList.remove('show'), 2000);
        setTimeout(() => targetElement.classList.remove('shake'), 600);
    }

    /**
     * 画像ローダーをセットアップ
     */
    setupImageLoader(imgElement, src) {
        const container = imgElement.parentElement;
        if (!container || !container.classList.contains('image-container')) return;
        container.classList.remove('loaded');
        imgElement.onload = () => container.classList.add('loaded');
        imgElement.onerror = () => { container.querySelector('.image-loader').textContent = '読込失敗'; };
        imgElement.src = src || 'https://placehold.co/1x1/ffffff/ffffff?text=';
    }

    /**
     * 入力ビューを切り替え（マップ/リスト）
     */
    switchInputView(configType, view) {
        document.getElementById(`${configType}-map-tab`).classList.toggle('active', view === 'map');
        document.getElementById(`${configType}-list-tab`).classList.toggle('active', view === 'list');
        document.getElementById(`${configType}-map-view`).classList.toggle('active', view === 'map');
        document.getElementById(`${configType}-list-view`).classList.toggle('active', view === 'list');
        if (view === 'map') this.updateMapLayout(`${configType}-map-container`);
    }

    /**
     * モーダルを表示
     */
    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    /**
     * モーダルを閉じる
     */
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    /**
     * 結果を表示
     */
    displayResults(plan, isMultiplayer, allowBoat) {
        this.resultPage.display(plan, isMultiplayer, allowBoat);
    }

    /**
     * 進捗表示を更新
     */
    updateProgressView(planId, dayIndex, isInitial = false) {
        this.resultPage.updateProgressView(planId, dayIndex, isInitial);
    }

    /**
     * プラン読み込みモーダルを開く
     */
    openLoadModal() {
        this.modals.openLoadModal();
    }

    /**
     * グループセレクターを開く
     */
    openGroupSelector(configType, groupId) {
        this.modals.openGroupSelector(configType, groupId);
    }

    /**
     * パターン確認用のスクリーンショットを表示
     */
    selectPatternForConfirmation(pattern) {
        this.modals.selectPatternForConfirmation(pattern);
    }

    /**
     * スクリーンショットビューを更新
     */
    updateScreenshotView(pattern) {
        this.modals.updateScreenshotView(pattern);
    }

    /**
     * スクリーンショットパターンをナビゲート
     */
    navigateScreenshotPattern(direction) {
        this.modals.navigateScreenshotPattern(direction);
    }

    /**
     * 保存されたプランをレンダリング
     */
    renderSavedPlans() {
        this.modals.renderSavedPlans();
    }

    /**
     * フォーム送信を処理
     */
    handleFormSubmit(event) {
        this.modals.handleFormSubmit(event);
    }

    /**
     * フォーム送信成功を処理
     */
    handleFormSuccess() {
        this.modals.handleFormSuccess();
    }

    /**
     * 日ごとの詳細を表示
     */
    showDayDetail(dayIndex) {
        this.resultPage.showDayDetail(dayIndex);
    }
}
