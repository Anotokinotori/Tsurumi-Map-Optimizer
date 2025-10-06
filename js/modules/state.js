/**
 * State Management Module
 * アプリケーションの状態を管理
 */

export class AppState {
    constructor() {
        this.currentConfig = {};
        this.idealConfig = {};
        this.activeSelection = { configType: null, groupId: null, pattern: null };
        this.lastCalculatedPlan = null;
        this.activePlanId = null; // To track the currently displayed plan
    }

    reset() {
        this.currentConfig = {};
        this.idealConfig = {};
        this.lastCalculatedPlan = null;
        this.activePlanId = null;
    }

    setConfig(configType, groupId, pattern) {
        this.activePlanId = null; // Any config change invalidates the current plan ID
        const configToUpdate = (configType === 'current') ? this.currentConfig : this.idealConfig;
        configToUpdate[groupId] = pattern;
    }

    getConfig(configType) {
        return (configType === 'current') ? this.currentConfig : this.idealConfig;
    }

    setActiveSelection(configType, groupId, pattern = null) {
        this.activeSelection = { configType, groupId, pattern };
    }

    getActiveSelection() {
        return this.activeSelection;
    }

    setPlan(plan) {
        this.lastCalculatedPlan = plan;
    }

    getPlan() {
        return this.lastCalculatedPlan;
    }

    setActivePlanId(planId) {
        this.activePlanId = planId;
    }

    getActivePlanId() {
        return this.activePlanId;
    }
}
