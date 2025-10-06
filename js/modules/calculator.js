/**
 * Plan Calculator Module
 * 最短調整プランを計算する純粋な計算ロジック
 */

import { groupKeys, actionsData } from '../data.js';

export class PlanCalculator {
    /**
     * 最短プランを探索
     * @param {Object} startConfig - 開始配置
     * @param {Object} idealConfig - 理想配置
     * @param {Object} options - オプション (isMultiplayer, allowBoat, onProgress)
     * @returns {Promise<Array>} - 最短プラン
     */
    static findShortestPlan(startConfig, idealConfig, options) {
        return new Promise(resolve => {
            const { isMultiplayer, allowBoat, onProgress } = options;
            const actionsToUse = this.getAvailableActions(allowBoat);
            
            const PATTERN_MAP = { 'A': 0, 'B': 1, 'C': 2 };
            const endConfigArr = groupKeys.map(k => idealConfig[k] ? PATTERN_MAP[idealConfig[k]] : -1);
    
            let startState = 0;
            for (let i = 0; i < groupKeys.length; i++) {
                startState = startState * 3 + PATTERN_MAP[startConfig[groupKeys[i]]];
            }
    
            if (this.isStateGoal(startState, endConfigArr)) {
                resolve([]);
                return;
            }
    
            const queue = [{ state: startState, path: [] }];
            const visited = new Set([startState]);
            let verifiedCount = 0;

            const processChunk = () => {
                const startTime = Date.now();
                while (queue.length > 0 && (Date.now() - startTime < 50)) {
                    const { state, path } = queue.shift();
                    verifiedCount++;

                    if (path.length >= 8) continue;
    
                    const currentStateArr = this.stateToArray(state);
                    let solutionPath = null;
    
                    // Solo mode actions
                    for (const soloAction of actionsToUse) {
                        const nextState = this.applyAction(currentStateArr, soloAction.affectedGroups);
                        if (!visited.has(nextState)) {
                            const newPath = [...path, { holdAction: { name: '---' }, advanceAction: soloAction, mode: 'ソロ' }];
                            if (this.isStateGoal(nextState, endConfigArr)) {
                                solutionPath = newPath;
                                break;
                            }
                            visited.add(nextState);
                            queue.push({ state: nextState, path: newPath });
                        }
                    }
                    if (solutionPath) {
                        resolve(solutionPath);
                        return;
                    }
                    
                    if (isMultiplayer) {
                        for (const holdAction of actionsToUse) {
                            for (const advanceAction of actionsToUse) {
                                const effectiveAdvance = new Set([...advanceAction.affectedGroups].filter(x => !holdAction.affectedGroups.has(x)));
                                if (effectiveAdvance.size === 0) continue;
        
                                const nextState = this.applyAction(currentStateArr, effectiveAdvance);
                                if (!visited.has(nextState)) {
                                     const newPath = [...path, { holdAction, advanceAction, mode: 'マルチ' }];
                                     if (this.isStateGoal(nextState, endConfigArr)) {
                                        solutionPath = newPath;
                                        break;
                                     }
                                     visited.add(nextState);
                                     queue.push({ state: nextState, path: newPath });
                                }
                            }
                            if (solutionPath) break;
                        }
                    }
                    if (solutionPath) {
                        resolve(solutionPath);
                        return;
                    }
                }
    
                if (queue.length > 0) {
                    if (onProgress) onProgress(verifiedCount);
                    setTimeout(processChunk, 0);
                } else {
                    if (onProgress) onProgress(verifiedCount);
                    resolve(null);
                }
            };
            
            processChunk();
        });
    }

    /**
     * アクションを適用して次の状態を生成
     */
    static applyAction(stateArr, affectedGroups) {
        const nextStateArr = [...stateArr];
        for (const group of affectedGroups) {
            const idx = groupKeys.indexOf(group);
            nextStateArr[idx] = (nextStateArr[idx] + 1) % 3;
        }
        return this.arrayToState(nextStateArr);
    }
    
    /**
     * 状態数値を配列に変換
     */
    static stateToArray(state) {
        const arr = [];
        for (let i = groupKeys.length - 1; i >= 0; i--) {
            arr[i] = state % 3;
            state = Math.floor(state / 3);
        }
        return arr;
    }

    /**
     * 配列を状態数値に変換
     */
    static arrayToState(arr) {
        let state = 0;
        for (let i = 0; i < arr.length; i++) {
            state = state * 3 + arr[i];
        }
        return state;
    }

    /**
     * 目標状態に到達したか判定
     */
    static isStateGoal(state, endConfigArr) {
        const currentStateArr = this.stateToArray(state);
        for (let i = 0; i < groupKeys.length; i++) {
            if (endConfigArr[i] !== -1 && endConfigArr[i] !== currentStateArr[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * 利用可能なアクションを生成
     */
    static getAvailableActions(allowBoat) {
        let actions = actionsData;
        if (!allowBoat) {
            actions = actions.filter(action => !action.name.includes('ボート'));
        }

        const achievablePatterns = new Map();
        achievablePatterns.set(JSON.stringify([]), { name: '何もしない', affectedGroups: new Set() });
        
        for (let i = 1; i < (1 << actions.length); i++) {
            const currentActions = [];
            const affectedGroupsSet = new Set();
            for (let j = 0; j < actions.length; j++) {
                if ((i >> j) & 1) {
                    const action = actions[j];
                    currentActions.push(action);
                    action.affectedGroups.forEach(group => affectedGroupsSet.add(group));
                }
            }
            const key = JSON.stringify([...affectedGroupsSet].sort());
            if (!achievablePatterns.has(key)) {
                achievablePatterns.set(key, {
                    name: currentActions.map(a => a.name).join(' + '),
                    affectedGroups: affectedGroupsSet
                });
            }
        }
        return Array.from(achievablePatterns.values());
    }
}
