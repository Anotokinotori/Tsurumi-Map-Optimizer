/**
 * Storage Module
 * LocalStorageとFirebaseの操作を管理
 */

export class StorageManager {
    constructor() {
        this.db = null;
        this.initFirebase();
    }

    initFirebase() {
        try {
            this.db = firebase.firestore();
        } catch (e) {
            console.error("Firebase initialization failed:", e);
        }
    }

    // ========== LocalStorage Operations ==========

    /**
     * 保存されたプランを取得
     */
    getSavedPlans() {
        try {
            const plansJSON = localStorage.getItem('tsurumiSavedPlans');
            return plansJSON ? JSON.parse(plansJSON) : [];
        } catch (e) {
            console.error("Failed to read saved plans:", e);
            return [];
        }
    }

    /**
     * プランを保存
     */
    savePlan(planData) {
        try {
            const savedPlans = this.getSavedPlans();
            savedPlans.push(planData);
            localStorage.setItem('tsurumiSavedPlans', JSON.stringify(savedPlans));
            return true;
        } catch (e) {
            console.error("Failed to save plan:", e);
            return false;
        }
    }

    /**
     * プランを削除
     */
    deletePlan(planId) {
        try {
            const plans = this.getSavedPlans();
            const updatedPlans = plans.filter(p => p.id !== planId);
            localStorage.setItem('tsurumiSavedPlans', JSON.stringify(updatedPlans));
            
            // Also delete progress for this plan
            const allProgress = this.getProgressData();
            delete allProgress[planId];
            localStorage.setItem('tsurumiPlanProgress', JSON.stringify(allProgress));
            
            return true;
        } catch (e) {
            console.error("Failed to delete plan:", e);
            return false;
        }
    }

    /**
     * 特定のプランを取得
     */
    getPlanById(planId) {
        const plans = this.getSavedPlans();
        return plans.find(p => p.id === planId);
    }

    /**
     * プランの進捗データを取得
     */
    getProgressData() {
        try {
            const progressJSON = localStorage.getItem('tsurumiPlanProgress');
            return progressJSON ? JSON.parse(progressJSON) : {};
        } catch (e) {
            console.error("Failed to read progress data", e);
            return {};
        }
    }

    /**
     * プランの進捗を保存
     */
    saveProgress(planId, dayIndex, isCompleted) {
        try {
            const allProgress = this.getProgressData();
            if (!allProgress[planId]) {
                allProgress[planId] = {};
            }
            allProgress[planId][dayIndex] = isCompleted;
            localStorage.setItem('tsurumiPlanProgress', JSON.stringify(allProgress));
            return true;
        } catch (e) {
            console.error("Failed to save progress", e);
            return false;
        }
    }

    /**
     * バナー閉じた状態を保存
     */
    setBannerClosed(isClosed) {
        localStorage.setItem('tsurumiBannerClosed', isClosed ? 'true' : 'false');
    }

    /**
     * バナー閉じた状態を取得
     */
    isBannerClosed() {
        return localStorage.getItem('tsurumiBannerClosed') === 'true';
    }

    // ========== Firebase Operations ==========

    /**
     * 計算回数をインクリメント
     */
    incrementCalculationCount() {
        if (!this.db) {
            console.warn("Firestore is not initialized. Skipping count increment.");
            return;
        }

        const counterRef = this.db.collection('statistics').doc('planCalculations');
        const increment = firebase.firestore.FieldValue.increment(1);

        // Atomically increment the counter.
        counterRef.update({ count: increment }).catch((error) => {
            // If the document doesn't exist yet, create it.
            if (error.code === 'not-found') {
                counterRef.set({ count: 1 }).catch(err => {
                    console.error("Error setting initial calculation count:", err);
                });
            } else {
                console.error("Error incrementing calculation count:", error);
            }
        });
    }
}
