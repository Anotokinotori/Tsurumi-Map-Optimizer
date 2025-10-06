/**
 * DOM Element Cache Module
 * 頻繁にアクセスするDOM要素をキャッシュ
 */

export class DOMCache {
    constructor() {
        this.elements = {};
        this.cacheElements();
    }

    cacheElements() {
        // Pages & Steps
        this.elements.pages = document.querySelectorAll('.page');
        this.elements.steps = document.querySelectorAll('.step');
        this.elements.modals = document.querySelectorAll('.modal');
        this.elements.allMapBgs = document.querySelectorAll('.map-bg');
        
        // Banner
        this.elements.infoBanner = document.getElementById('info-banner');
        this.elements.closeBannerBtn = document.getElementById('close-banner-btn');
        
        // Navigation Buttons
        this.elements.goToCurrentBtn = document.getElementById('go-to-current-btn');
        this.elements.backToStartBtn = document.getElementById('back-to-start-btn');
        this.elements.backToCurrentBtn = document.getElementById('back-to-current-btn');
        this.elements.backToIdealBtn = document.getElementById('back-to-ideal-btn');
        this.elements.goToIdealBtn = document.getElementById('go-to-ideal-btn');
        
        // Modal Trigger Buttons
        this.elements.guideBtn = document.getElementById('guide-btn');
        this.elements.tsurumiInfoBtn = document.getElementById('tsurumi-info-btn');
        this.elements.cycleHoldInfoBtn = document.getElementById('cycle-hold-info-btn');
        this.elements.disclaimerLink = document.getElementById('disclaimer-link');
        this.elements.disclaimerLinkResultPC = document.getElementById('disclaimer-link-result-pc');
        this.elements.disclaimerLinkResultMobile = document.getElementById('disclaimer-link-result-mobile');
        this.elements.creditTrigger = document.getElementById('credit-modal-trigger');
        this.elements.logicModalTrigger = document.getElementById('logic-modal-trigger');
        this.elements.openRequestFormBtn = document.getElementById('open-request-form-from-logic-btn');
        this.elements.requestFormResultMobileBtn = document.getElementById('request-form-result-mobile-btn');
        this.elements.requestFormResultPcBtn = document.getElementById('request-form-result-pc-btn');
        
        // Action Buttons
        this.elements.loadPlanBtn = document.getElementById('load-plan-btn');
        this.elements.setRecommendedBtn = document.getElementById('set-recommended-btn');
        this.elements.copyCurrentBtn = document.getElementById('copy-current-btn');
        this.elements.calculatePlanBtn = document.getElementById('calculate-plan-btn');
        this.elements.resetBtn = document.getElementById('reset-btn');
        this.elements.savePlanBtn = document.getElementById('save-plan-btn');
        this.elements.savePlanIconBtn = document.getElementById('save-plan-icon-btn');
        this.elements.recalculateBtn = document.getElementById('recalculate-alternate-mode-btn');
        this.elements.screenshotPrevBtn = document.getElementById('screenshot-prev-btn');
        this.elements.screenshotNextBtn = document.getElementById('screenshot-next-btn');

        // Input Tabs
        this.elements.currentMapTab = document.getElementById('current-map-tab');
        this.elements.currentListTab = document.getElementById('current-list-tab');
        this.elements.idealMapTab = document.getElementById('ideal-map-tab');
        this.elements.idealListTab = document.getElementById('ideal-list-tab');

        // Quick Fill Buttons
        this.elements.fillAllABtn = document.getElementById('fill-all-a-btn');
        this.elements.fillAllBBtn = document.getElementById('fill-all-b-btn');
        this.elements.fillAllCBtn = document.getElementById('fill-all-c-btn');

        // Progress & Validation
        this.elements.progressText = document.getElementById('progress-text');
        this.elements.idealProgressText = document.getElementById('ideal-progress-text');
        this.elements.validationMessage = document.getElementById('validation-message');
        
        // Form
        this.elements.gForm = document.getElementById('g-form');
        this.elements.formStatusMessage = document.getElementById('form-status-message');

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
    }

    get(elementName) {
        return this.elements[elementName];
    }
}
