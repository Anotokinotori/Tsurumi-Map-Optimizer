/**
 * Result Page Manager
 * 結果ページの表示と管理
 */

import { eliteGroups, actionsData, actionDetails } from '../../data.js';

export class ResultPageManager {
    constructor(domCache, state, storage, uiManager) {
        this.dom = domCache;
        this.state = state;
        this.storage = storage;
        this.ui = uiManager;
    }

    /**
     * 結果を表示
     */
    display(plan, isMultiplayer, allowBoat) {
        const summaryEl = document.getElementById('result-summary-text');
        const summaryText = !plan ? '8日以内に完了する調整プランは見つかりませんでした。'
                          : plan.length === 0 ? '調整は不要です！'
                          : `最短 ${plan.length} 日で調整可能！`;
        
        summaryEl.textContent = summaryText;

        this.dom.get('soloNotice').style.display = isMultiplayer ? 'none' : 'block';
        
        const recalcBtnText = document.getElementById('recalculate-btn-text');
        if (recalcBtnText) {
            recalcBtnText.textContent = isMultiplayer ? '周期ホールドOFFで再計算' : '周期ホールドONで再計算';
        }
        this.dom.get('recalculateBtn').className = isMultiplayer ? 'btn btn-primary' : 'btn btn-multi';
        
        const showSaveButtons = plan && plan.length > 0;
        document.getElementById('save-plan-btn').style.display = showSaveButtons ? '' : 'none';
        document.getElementById('save-plan-icon-btn').style.display = showSaveButtons ? '' : 'none';

        const tbody = this.dom.get('resultTbody');
        tbody.innerHTML = '';
        
        if (plan) {
            const allProgress = this.storage.getProgressData();
            const currentPlanProgress = allProgress[this.state.getActivePlanId()] || {};

            plan.forEach((day, index) => {
                const tr = this.createResultRow(day, index, currentPlanProgress);
                tbody.appendChild(tr);

                // Apply initial completed view state
                if (currentPlanProgress[index]) {
                    this.updateProgressView(this.state.getActivePlanId(), index, true);
                }
            });
        }
        
        this.ui.showPage('result-page');

        this.dom.get('resultPage').scrollTop = 0;
        try { window.scrollTo(0, 0); } catch(e) {/* ignore */}
    }

    /**
     * 結果行を作成
     */
    createResultRow(day, index, currentPlanProgress) {
        const tr = document.createElement('tr');
        tr.dataset.dayIndex = index;
        tr.dataset.dayText = `${index + 1}日目`;
        
        if (this.state.getActivePlanId()) {
            tr.dataset.planId = this.state.getActivePlanId();
        }
        
        if (window.innerWidth <= 991) {
            tr.classList.add('mobile-tappable');
        }

        const modeClass = day.mode === 'ソロ' ? 'mode-solo' : 'mode-multi';
        tr.innerHTML = `
            <td class="progress-col"><input type="checkbox" ${currentPlanProgress[index] ? 'checked' : ''}></td>
            <td class="date-col">${index + 1}日目</td>
            <td><span class="${modeClass}">${day.mode}</span></td>
            <td>${day.holdAction.name}</td>
            <td>${day.advanceAction.name}</td>
            <td><button class="btn btn-details" data-day-index="${index}">手順を確認</button></td>
        `;
        
        return tr;
    }

    /**
     * 進捗表示を更新
     */
    updateProgressView(planId, dayIndex, isInitial = false) {
        if (!planId) return;
        
        const row = this.dom.get('resultTbody').querySelector(
            `tr[data-day-index='${dayIndex}'][data-plan-id='${planId}']`
        );
        if (!row) return;

        const allProgress = this.storage.getProgressData();
        const isCompleted = allProgress[planId] && allProgress[planId][dayIndex];
        
        if (!isInitial) {
            row.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        }

        row.classList.toggle('is-completed', isCompleted);
        
        const checkbox = row.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.checked = isCompleted;

        const dateCell = row.querySelector('.date-col');
        if (dateCell && window.innerWidth <= 991) {
            dateCell.innerHTML = isCompleted ? '✔ 完了' : row.dataset.dayText;
        }
        
        if (!isInitial) {
            setTimeout(() => row.style.transition = '', 300);
        }
    }

    /**
     * 日ごとの詳細を表示
     */
    showDayDetail(dayIndex) {
        const plan = this.state.getPlan();
        if (!plan || isNaN(dayIndex) || !plan[dayIndex]) return;

        const dayData = plan[dayIndex];
        const dayNumber = dayIndex + 1;
        document.getElementById('day-detail-title').textContent = `${dayNumber}日目の手順詳細`;
        
        this.dom.get('dayDetailModalContent').innerHTML = this.generateDayDetailHTML(dayData);
        this.dom.get('dayDetailModalContent').querySelectorAll('.image-container img').forEach(img => {
            this.ui.setupImageLoader(img, img.dataset.src);
            img.src = img.dataset.src;
        });
        
        this.ui.showModal('day-detail-modal');
    }

    /**
     * 日ごとの詳細HTMLを生成
     */
    generateDayDetailHTML(dayData) {
        let html = '<p style="text-align:center; color: var(--secondary-text-color);"><strong>【重要】</strong>「歩き」や「ボート」での移動は、<strong>ルートを慎重に確認し、放浪者のような飛行系キャラは使用しないでください。</strong></p>';
        
        if (dayData.mode === 'ソロ') {
            html += `<h3>ソロモードでの行動</h3>` + this.generateActionDetailsHTML(dayData.advanceAction);
        } else {
            html += `<h3>マルチモード（周期ホールド）での行動</h3>
                    <h4>Step 1: 準備</h4>
                    <p>ホスト(1P)は鶴観以外の安全な場所に移動し、ゲスト(2P)を世界に招き入れます。</p>
                    <h4>Step 2: 周期のホールド (ゲストの操作)</h4>
                    <p><strong>[重要]</strong> まずホスト(1P)が層岩巨淵・地下鉱区など、<strong>テイワット以外のマップに移動</strong>するのを待ちます。</p>
                    <p>ホストの移動後、ゲスト(2P)は以下の行動で指定されたグループの周期を読み込みます。</p>`
                    + this.generateActionDetailsHTML(dayData.holdAction) +
                    `<p><strong>[重要]</strong> ゲストは上記行動を終えたら、速やかにホストの世界から退出してください。</p>
                    <h4 style="margin-top: 25px;">Step 3: 周期の進行 (ホストの操作)</h4>
                    <p>ゲストが退出してソロ状態に戻った後、ホスト(1P)は以下の行動で、ゲストが<strong>読み込まなかった</strong>グループの周期を1つ<strong>進めます</strong>。</p>`
                    + this.generateActionDetailsHTML(dayData.advanceAction, dayData.holdAction);
        }
        return html;
    }

    /**
     * アクション詳細HTMLを生成
     */
    generateActionDetailsHTML(actionData, holdActionData = {affectedGroups: new Set()}) {
        if (!actionData || !actionData.name || actionData.name === '---' || actionData.name === '何もしない') {
            return '<p>特別な行動は不要です。</p>';
        }

        const effectiveGroups = new Set([...actionData.affectedGroups].filter(x => !holdActionData.affectedGroups.has(x)));
        if (effectiveGroups.size === 0) return '<p>特別な行動は不要です。</p>';
        
        let html = '<ul>';
        const actions = actionData.name.split(' + ');
        
        actions.forEach(actionName => {
            const action = actionsData.find(a => a.name === actionName);
            if (!action || ![...action.affectedGroups].some(g => effectiveGroups.has(g))) return;

            const details = actionDetails[action.id] || {};
            const affectedGroupsInThisAction = Array.from(action.affectedGroups).filter(g => effectiveGroups.has(g));

            html += `<li><strong>${actionName}</strong>`;
            
            if (affectedGroupsInThisAction.length > 0) {
                const affectedGroupsList = affectedGroupsInThisAction.map(key => `「${eliteGroups[key].name}」`).join('、');
                html += `<div class="affected-groups-container"><strong>影響を受けるグループ:</strong><ul><li>${affectedGroupsList}</li></ul></div>`;
            }

            html += `<p>${(details.note || '').replace(/\n/g, '<br>')}</p>`;

            if (details.images) {
                details.images.forEach(imgUrl => {
                    html += `<div class="image-container"><div class="image-loader">読込中...</div><img data-src="${imgUrl}" alt="${actionName}のルート図"></div>`;
                });
            }
            if (details.videoUrl) {
                html += `<div class="video-container"><iframe src="${details.videoUrl.replace('youtu.be/','youtube.com/embed/').split('?si=')[0]}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
            }
            html += `</li>`;
        });
        
        return html + '</ul>';
    }
}
