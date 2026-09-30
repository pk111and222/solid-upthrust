/**
 * rc-motion 的最小子集：`visible` 翻真时先挂载（离场态）再在第二帧切到入场态，
 * 让过渡有已提交的起点；翻假时先切离场态，`leaveMs` 后卸载（removeOnLeave）。
 * 初始可见直接落在入场态（不播 appear）。清理函数由 effect 返回（Solid 2 rc）。
 */
export declare const createPresence: (visible: () => boolean, leaveMs: number) => {
    mounted: import('solid-js').SourceAccessor<boolean>;
    entered: import('solid-js').SourceAccessor<boolean>;
};
