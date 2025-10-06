/**
 * Input Page Manager
 * 入力ページ（現在/理想配置）の管理
 */

import { groupKeys, eliteGroups } from '../../data.js';

export class InputPageManager {
    constructor(domCache, state, uiManager) {
        this.dom = domCache;
        this.state = state;
        this.ui = uiManager;
    }

    /**
     * 入力ページを初期化
     */
    init(configType) {
        const mapContainer = document.getElementById(`${configType}-map-container`);
        const listContainer = document.getElementById(`${configType}-config-list`);
        mapContainer.querySelectorAll('.map-marker, .map-marker-overlay').forEach(el => el.remove());
        listContainer.innerHTML = '';
        
        groupKeys.forEach(groupId => {
            const group = eliteGroups[groupId];
            
            // Map Marker
            this.createMapMarker(configType, groupId, group, mapContainer);
            
            // Map Overlay (理想ページのみ)
            if (configType === 'ideal') {
                this.createMapOverlay(configType, groupId, mapContainer);
            }

            // List Item
            this.createListItem(configType, groupId, group, listContainer);
        });
    }

    /**
     * マップマーカーを作成
     */
    createMapMarker(configType, groupId, group, container) {
        const marker = document.createElement('div');
        marker.className = 'map-marker glowing';
        marker.id = `${configType}-marker-${groupId}`;
        marker.style.backgroundImage = `url(${group.iconUrl})`;
        marker.addEventListener('click', () => this.ui.openGroupSelector(configType, groupId));
        container.appendChild(marker);
    }

    /**
     * マップオーバーレイを作成（理想ページ用）
     */
    createMapOverlay(configType, groupId, container) {
        const overlay = document.createElement('div');
        overlay.className = 'map-marker-overlay';
        overlay.id = `ideal-overlay-${groupId}`;
        container.appendChild(overlay);
    }

    /**
     * リストアイテムを作成
     */
    createListItem(configType, groupId, group, container) {
        const item = document.createElement('div');
        item.className = 'config-item';
        
        let labelHTML = `<div class="group-name">${group.name}</div>`;
        if (configType === 'ideal') {
            const currentPattern = this.state.currentConfig[groupId] || '?';
            labelHTML += `<div class="current-config-display" id="ideal-list-diff-${groupId}">現在配置: ${currentPattern}</div>`;
        }
        item.innerHTML = `<div class="config-item-label">${labelHTML}</div>`;

        const buttons = this.createPatternButtons(configType, groupId);
        item.appendChild(buttons);
        container.appendChild(item);
    }

    /**
     * パターン選択ボタンを作成
     */
    createPatternButtons(configType, groupId) {
        const buttons = document.createElement('div');
        buttons.className = 'pattern-buttons';
        buttons.id = `${configType}-buttons-${groupId}`;
        
        ['A', 'B', 'C'].forEach(pattern => {
            const btn = document.createElement('button');
            btn.textContent = pattern;
            btn.addEventListener('click', () => {
                // updateConfigはAppクラスで定義される
                window.TsurumiApp.updateConfig(configType, groupId, pattern);
            });
            buttons.appendChild(btn);
        });
        
        return buttons;
    }
}
