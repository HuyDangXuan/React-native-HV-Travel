"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ItineraryTab;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const ThemeModeContext_1 = require("../../../../../context/ThemeModeContext");
const I18nContext_1 = require("../../../../../context/I18nContext");
const RichHtmlText_1 = __importDefault(require("../../../../../components/ui/RichHtmlText"));
function ItineraryTab({ tour }) {
    const { t } = (0, I18nContext_1.useI18n)();
    const appTheme = (0, ThemeModeContext_1.useAppTheme)();
    const ui = (0, react_1.useMemo)(() => ({
        surface: appTheme.semantic.screenSurface,
        textPrimary: appTheme.semantic.textPrimary,
        textSecondary: appTheme.semantic.textSecondary,
        border: appTheme.semantic.divider,
        primary: appTheme.colors.primary,
        onPrimary: appTheme.colors.white,
    }), [appTheme]);
    const styles = (0, react_1.useMemo)(() => createStyles(ui), [ui]);
    const itinerary = (0, react_1.useMemo)(() => {
        if (!tour)
            return [];
        if (Array.isArray(tour.schedule) && tour.schedule.length > 0) {
            return tour.schedule.map((s, idx) => {
                const activitiesArr = Array.isArray(s.activities) && s.activities.length > 0
                    ? s.activities.map((a) => ({ desc: a }))
                    : [{ desc: s.description || t("tourDetail.itineraryNoActivityDescription") }];
                return {
                    day: s.day ?? idx + 1,
                    title: s.title || t("tourDetail.itineraryDefaultDayTitle", { day: idx + 1 }),
                    activities: activitiesArr,
                };
            });
        }
        const fallbackDesc = tour.description || t("tourDetail.itineraryFallbackDescription");
        return [
            {
                day: 1,
                title: tour.duration?.text
                    ? t("tourDetail.itineraryFallbackTitleWithDuration", { duration: tour.duration.text })
                    : t("tourDetail.itineraryFallbackTitle"),
                activities: [{ desc: fallbackDesc }],
            },
        ];
    }, [t, tour]);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.wrap, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.title, children: t("tourDetail.itineraryTitle") }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.desc, children: t("tourDetail.itineraryDescription") }), itinerary.length === 0 ? ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.emptyBox, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.emptyTitle, children: t("tourDetail.itineraryEmptyTitle") }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.emptyDesc, children: t("tourDetail.itineraryEmptyDescription") })] })) : ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.itineraryList, children: itinerary.map((item, idx) => ((0, jsx_runtime_1.jsx)(DayCard, { data: item, isLast: idx === itinerary.length - 1, styles: styles, t: t, ui: ui }, `${item.day}-${idx}`))) }))] }));
}
function DayCard({ data, isLast, styles, t, ui, }) {
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.dayCard, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.dayHeader, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.dayBadge, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.dayBadgeText, children: t("tourDetail.itineraryDayLabel", { day: data.day }) }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.dayTitle, children: data.title })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.activitiesWrap, children: data.activities.map((activity, idx) => ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.activityRow, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.timelineCol, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.timelineDot }), idx < data.activities.length - 1 && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.timelineLine })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.activityContent, children: (0, jsx_runtime_1.jsx)(RichHtmlText_1.default, { html: activity.desc, compact: true, palette: {
                                    textPrimary: ui.textPrimary,
                                    textSecondary: ui.textPrimary,
                                    link: ui.primary,
                                    border: ui.border,
                                    surface: ui.surface,
                                }, textColor: ui.textPrimary }) })] }, idx))) }), !isLast && (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.dayConnector })] }));
}
function createStyles(ui) {
    return react_native_1.StyleSheet.create({
        wrap: { marginTop: 32 },
        title: {
            fontSize: 18,
            fontWeight: "700",
            color: ui.textPrimary,
            marginBottom: 8,
        },
        desc: {
            color: ui.textSecondary,
            fontSize: 14,
            lineHeight: 22,
            marginBottom: 24,
        },
        emptyBox: {
            backgroundColor: ui.surface,
            borderRadius: 16,
            padding: 24,
            borderWidth: 1,
            borderColor: ui.border,
        },
        emptyTitle: {
            fontSize: 16,
            fontWeight: "700",
            color: ui.textPrimary,
        },
        emptyDesc: {
            marginTop: 4,
            fontSize: 14,
            color: ui.textSecondary,
            lineHeight: 20,
        },
        itineraryList: { gap: 16 },
        dayCard: {
            backgroundColor: ui.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: ui.border,
        },
        dayHeader: { marginBottom: 16 },
        dayBadge: {
            backgroundColor: ui.primary,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            alignSelf: "flex-start",
            marginBottom: 4,
        },
        dayBadgeText: {
            color: ui.onPrimary,
            fontSize: 12,
            fontWeight: "600",
        },
        dayTitle: {
            fontSize: 16,
            fontWeight: "600",
            color: ui.textPrimary,
        },
        activitiesWrap: { gap: 8 },
        activityRow: { flexDirection: "row", gap: 8 },
        timelineCol: { alignItems: "center", width: 20 },
        timelineDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: ui.primary,
            borderWidth: 2,
            borderColor: ui.onPrimary,
            shadowColor: ui.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 2,
        },
        timelineLine: {
            width: 2,
            flex: 1,
            backgroundColor: ui.border,
            marginTop: 4,
        },
        activityContent: { flex: 1, paddingBottom: 8 },
        activityDesc: {
            fontSize: 14,
            color: ui.textPrimary,
            lineHeight: 20,
        },
        dayConnector: {
            height: 20,
            width: 2,
            backgroundColor: ui.border,
            alignSelf: "center",
            marginTop: 8,
        },
    });
}
