"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldTriggerOverlayRefresh = void 0;
const shouldTriggerOverlayRefresh = ({ minOffsetY, threshold = 72, isBusy, }) => {
    if (isBusy)
        return false;
    return Math.abs(Math.min(minOffsetY, 0)) >= threshold;
};
exports.shouldTriggerOverlayRefresh = shouldTriggerOverlayRefresh;
