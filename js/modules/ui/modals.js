/**
 * Modal Manager
 * モーダルウィンドウの管理
 */

import { eliteGroups, patternMarkerPositions, screenshotImageUrls } from '../../data.js';

export class ModalManager {
    constructor(domCache, state, uiManager) {
        this.dom = domCache;
        this.state = state;
        this.ui = uiManager;
    }

    /**
     * グループセレクターモーダルを開く
     */
    openGroupSelector(configType, groupId) {
        this.state.setActiveSelection(configType, groupId);
        document.getElementById('zoom-title').textContent = `${eliteGroups[groupId].name} のパターンを選択`;
        
        const zoomContainer = document.getElementById('zoom-map-container');
        const zoomMapImage = zoomContainer.querySelector('img');
        this.ui.setupImageLoader(zoomMapImage, eliteGroups[groupId].zoomMapUrl);

        zoomContainer.querySelectorAll('.pattern-marker').forEach(m => m.remove());
        const config = this.state.getConfig(configType);
        const selectedPattern = config[groupId];

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
        
        this.ui.showModal('zoom-view');
    }

    /**
     * パターン確認用のスクリーンショットを表示
     */
    selectPatternForConfirmation(pattern) {
        this.state.activeSelection.pattern = pattern;
        this.updateScreenshotView(pattern);
        
        document.getElementById('confirm-pattern-btn').onclick = () => {
            const { configType, groupId, pattern } = this.state.getActiveSelection();
            if (configType && groupId && pattern) {
                window.TsurumiApp.updateConfig(configType, groupId, pattern);
            }
            this.ui.closeModal('screenshot-popup');
            this.ui.closeModal('zoom-view');
        };
        
        this.ui.showModal('screenshot-popup');
    }

    /**
     * スクリーンショットビューを更新
     */
    updateScreenshotView(pattern) {
        const { groupId } = this.state.getActiveSelection();
        if (!groupId) return;

        this.state.activeSelection.pattern = pattern;

        document.getElementById('screenshot-title').textContent = 
            `${eliteGroups[groupId].name} - ${pattern} ですか？`;
        
        const screenshotImg = document.getElementById('screenshot-img');
        this.ui.setupImageLoader(screenshotImg, screenshotImageUrls[groupId]?.[pattern]);
    }

    /**
     * スクリーンショットパターンをナビゲート
     */
    navigateScreenshotPattern(direction) {
        const patterns = ['A', 'B', 'C'];
        const { pattern } = this.state.getActiveSelection();
        const currentIndex = patterns.indexOf(pattern);
        const nextIndex = (currentIndex + direction + patterns.length) % patterns.length;
        const nextPattern = patterns[nextIndex];
        
        this.updateScreenshotView(nextPattern);
    }

    /**
     * プラン読み込みモーダルを開く
     */
    openLoadModal() {
        this.renderSavedPlans();
        this.ui.showModal('load-plan-modal');
    }

    /**
     * 保存されたプランをレンダリング
     */
    renderSavedPlans() {
        const plans = window.TsurumiApp.storage.getSavedPlans();
        const listEl = document.getElementById('saved-plans-list');
        const noPlansEl = document.getElementById('no-saved-plans');
        listEl.innerHTML = '';
        noPlansEl.style.display = plans.length === 0 ? 'block' : 'none';
        listEl.style.display = plans.length > 0 ? 'flex' : 'none';

        plans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(plan => {
            const li = document.createElement('li');
            li.className = 'saved-plan-item';
            li.innerHTML = `<span class="saved-plan-item-name">${plan.name}</span>
                            <div class="saved-plan-item-actions">
                                <button class="btn btn-primary btn-load" data-plan-id="${plan.id}">読込</button>
                                <button class="btn btn-delete" data-plan-id="${plan.id}">削除</button>
                            </div>`;
            li.querySelector('.btn-load').addEventListener('click', () => window.TsurumiApp.loadPlan(plan.id));
            li.querySelector('.btn-delete').addEventListener('click', () => window.TsurumiApp.deletePlan(plan.id));
            listEl.appendChild(li);
        });
    }

    /**
     * フォーム送信を処理
     */
    handleFormSubmit(event) {
        event.preventDefault();
        const form = this.dom.get('gForm');
        const statusMessage = this.dom.get('formStatusMessage');
        const submitBtn = form.querySelector('button[type="submit"]');

        if (!form.checkValidity()) {
            statusMessage.textContent = '入力されていない項目があります。';
            statusMessage.style.color = 'red';
            return;
        }

        statusMessage.textContent = '送信中...';
        statusMessage.style.color = 'inherit';
        submitBtn.disabled = true;
        
        const iframe = document.getElementById('hidden_iframe');
        if (iframe) {
            iframe.submitted = true; 
        }
        
        form.submit();
    }

    /**
     * フォーム送信成功を処理
     */
    handleFormSuccess() {
        const form = this.dom.get('gForm');
        const statusMessage = this.dom.get('formStatusMessage');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        statusMessage.textContent = '送信しました！ご協力ありがとうございます。';
        statusMessage.style.color = 'green';
        submitBtn.disabled = false;
        form.reset();

        const iframe = document.getElementById('hidden_iframe');
        if (iframe) {
            iframe.submitted = false;
        }
    }
}
