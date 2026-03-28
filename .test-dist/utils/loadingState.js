"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInboxFiltersKey = exports.getPullRefreshDisplayState = exports.getQueryDisplayState = void 0;
const hasRenderableData = (value) => {
    if (Array.isArray(value))
        return value.length > 0;
    return value !== undefined && value !== null;
};
const getQueryDisplayState = ({ isLoading, isFetching, data, }) => {
    const hasData = hasRenderableData(data);
    return {
        showSkeleton: isLoading && !hasData,
        showRefreshing: isFetching && hasData,
        hasData,
    };
};
exports.getQueryDisplayState = getQueryDisplayState;
const getPullRefreshDisplayState = ({ isLoading, isRefreshing, data, }) => {
    const hasData = hasRenderableData(data);
    return {
        showInitialSkeleton: isLoading && !hasData,
        showRefreshSkeleton: isRefreshing,
        hasData,
    };
};
exports.getPullRefreshDisplayState = getPullRefreshDisplayState;
const buildInboxFiltersKey = (filters) => {
    const conversationCode = filters?.conversationCode?.trim() ?? "";
    const customerId = filters?.customerId?.trim() ?? "";
    return `${conversationCode}::${customerId}`;
};
exports.buildInboxFiltersKey = buildInboxFiltersKey;
