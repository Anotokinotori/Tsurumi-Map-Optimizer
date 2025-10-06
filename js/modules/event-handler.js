/**
 * Event Handler Module
 * アプリケーション全体のイベントハンドラーを管理
 */

export class EventHandler {
    constructor(app) {
        this.app = app;
    }

    /**
     * すべてのイベントをバインド
     */
    bindAll() {
        this.bindBannerEvents();
        this.bindNavigationEvents();
        this.bindActionEvents();
        this.bindInputHelperEvents();
        this.bindTabEvents();
        this.bindModalEvents();
        this.bindScreenshotEvents();
        this.bindFormEvents();
        this.bindStepEvents();
        this.bindResultEvents();
        this.bindLayoutEvents();
    }

    /**
     * バナーイベント
     */
    bindBannerEvents() {
        this.app.dom.get('closeBannerBtn').addEventListener('click', () => {
            this.app.dom.get('infoBanner').classList.add('hidden');
            this.app.storage.setBannerClosed(true);
        });
    }

    /**
     * ページナビゲーションイベント
     */
    bindNavigationEvents() {
        this.app.dom.get('goToCurrentBtn').addEventListener('click', () => 
            this.app.ui.showPage('current-config-page'));
        this.app.dom.get('backToStartBtn').addEventListener('click', () => 
            this.app.ui.showPage('start-page'));
        this.app.dom.get('backToCurrentBtn').addEventListener('click', () => 
            this.app.ui.showPage('current-config-page'));
        this.app.dom.get('backToIdealBtn').addEventListener('click', () => 
            this.app.ui.showPage('ideal-config-page'));

        this.app.dom.get('goToIdealBtn').addEventListener('click', (e) => {
            if (e.currentTarget.disabled) {
                this.app.ui.showValidationMessage('すべての配置を入力してください。', e.currentTarget);
            } else {
                this.app.ui.showPage('ideal-config-page');
            }
        });
    }

    /**
     * メインアクションイベント
     */
    bindActionEvents() {
        this.app.dom.get('calculatePlanBtn').addEventListener('click', () => 
            this.app.calculatePlan());
        this.app.dom.get('resetBtn').addEventListener('click', () => 
            this.app.resetApp());
        this.app.dom.get('savePlanBtn').addEventListener('click', () => 
            this.app.savePlan());
        this.app.dom.get('savePlanIconBtn').addEventListener('click', () => 
            this.app.savePlan());
        this.app.dom.get('loadPlanBtn').addEventListener('click', () => 
            this.app.ui.openLoadModal());
    }

    /**
     * 入力ヘルパーイベント
     */
    bindInputHelperEvents() {
        this.app.dom.get('setRecommendedBtn').addEventListener('click', () => 
            this.app.setRecommendedConfig());
        this.app.dom.get('copyCurrentBtn').addEventListener('click', () => 
            this.app.copyCurrentConfigToIdeal());
        this.app.dom.get('fillAllABtn').addEventListener('click', () => 
            this.app.fillAllConfigs('A'));
        this.app.dom.get('fillAllBBtn').addEventListener('click', () => 
            this.app.fillAllConfigs('B'));
        this.app.dom.get('fillAllCBtn').addEventListener('click', () => 
            this.app.fillAllConfigs('C'));
    }

    /**
     * タブ切り替えイベント
     */
    bindTabEvents() {
        this.app.dom.get('currentMapTab').addEventListener('click', () => 
            this.app.ui.switchInputView('current', 'map'));
        this.app.dom.get('currentListTab').addEventListener('click', () => 
            this.app.ui.switchInputView('current', 'list'));
        this.app.dom.get('idealMapTab').addEventListener('click', () => 
            this.app.ui.switchInputView('ideal', 'map'));
        this.app.dom.get('idealListTab').addEventListener('click', () => 
            this.app.ui.switchInputView('ideal', 'list'));
    }

    /**
     * モーダルイベント
     */
    bindModalEvents() {
        this.app.dom.get('guideBtn').addEventListener('click', () => 
            this.app.ui.showModal('guide-modal'));
        this.app.dom.get('tsurumiInfoBtn').addEventListener('click', () => 
            this.app.ui.showModal('tsurumi-info-modal'));
        this.app.dom.get('cycleHoldInfoBtn').addEventListener('click', () => 
            this.app.ui.showModal('cycle-hold-info-modal'));
        this.app.dom.get('disclaimerLink').addEventListener('click', () => 
            this.app.ui.showModal('disclaimer-modal'));
        this.app.dom.get('disclaimerLinkResultPC').addEventListener('click', () => 
            this.app.ui.showModal('disclaimer-modal'));
        this.app.dom.get('disclaimerLinkResultMobile').addEventListener('click', () => 
            this.app.ui.showModal('disclaimer-modal'));
        this.app.dom.get('creditTrigger').addEventListener('click', () => 
            this.app.ui.showModal('credit-modal'));
        this.app.dom.get('logicModalTrigger').addEventListener('click', () => 
            this.app.ui.showModal('logic-modal'));
        this.app.dom.get('openRequestFormBtn').addEventListener('click', () => 
            this.app.ui.showModal('request-modal'));
        this.app.dom.get('requestFormResultMobileBtn').addEventListener('click', () => 
            this.app.ui.showModal('request-modal'));
        this.app.dom.get('requestFormResultPcBtn').addEventListener('click', () => 
            this.app.ui.showModal('request-modal'));
        
        document.querySelectorAll('.modal-close').forEach(el => {
            el.addEventListener('click', () => this.app.ui.closeModal(el.dataset.target));
        });
    }

    /**
     * スクリーンショットナビゲーションイベント
     */
    bindScreenshotEvents() {
        this.app.dom.get('screenshotPrevBtn').addEventListener('click', () => 
            this.app.ui.navigateScreenshotPattern(-1));
        this.app.dom.get('screenshotNextBtn').addEventListener('click', () => 
            this.app.ui.navigateScreenshotPattern(1));
    }

    /**
     * フォームイベント
     */
    bindFormEvents() {
        const form = this.app.dom.get('gForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                this.app.ui.handleFormSubmit(e);
            });
        }
    }

    /**
     * ステップインジケーターイベント
     */
    bindStepEvents() {
        this.app.dom.get('steps').forEach(stepEl => {
            stepEl.addEventListener('click', () => {
                const step = stepEl.dataset.step;
                switch (step) {
                    case '1':
                        this.app.ui.showPage('current-config-page');
                        break;
                    case '2':
                        if (!this.app.dom.get('goToIdealBtn').disabled) {
                            this.app.ui.showPage('ideal-config-page');
                        }
                        break;
                    case '3':
                        if (this.app.state.getPlan()) {
                            this.app.ui.showPage('result-page');
                        }
                        break;
                }
            });
        });
    }

    /**
     * 結果ページイベント
     */
    bindResultEvents() {
        this.app.dom.get('resultTbody').addEventListener('click', (e) => {
            const target = e.target;
            const row = target.closest('tr');
            if (!row) return;

            // Handle details button click
            if (target.classList.contains('btn-details')) {
                const dayIndex = parseInt(target.dataset.dayIndex, 10);
                this.app.ui.showDayDetail(dayIndex);
                return;
            }

            // Handle progress tracking click
            if (row.dataset.dayIndex) {
                this.app.toggleProgress(parseInt(row.dataset.dayIndex, 10));
            }
        });
        
        this.app.dom.get('recalculateBtn').addEventListener('click', () => {
            this.app.state.setActivePlanId(null);
            const currentMode = this.app.dom.get('multiplayerCheckbox').checked;
            this.app.dom.get('multiplayerCheckbox').checked = !currentMode;
            this.app.calculatePlan();
        });
    }

    /**
     * レイアウト更新イベント
     */
    bindLayoutEvents() {
        window.addEventListener('resize', () => {
            this.app.ui.updateMapLayout('current-map-container');
            this.app.ui.updateMapLayout('ideal-map-container');
        });

        this.app.dom.get('allMapBgs').forEach(img => {
            const containerId = img.closest('.map-container').id;
            if (img.complete && img.naturalWidth > 0) {
                this.app.ui.updateMapLayout(containerId);
            } else {
                img.addEventListener('load', () => this.app.ui.updateMapLayout(containerId));
            }
        });
    }
}
