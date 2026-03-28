"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCreateBookingPayload = exports.toCalculatePricePayload = exports.normalizeChatMessages = exports.normalizeChatMessage = exports.normalizeChatConversations = exports.normalizeChatConversation = exports.getChatConversationSubtitle = exports.extractFavouriteTourIds = exports.normalizeFavourites = exports.normalizeFavourite = exports.normalizeBookingQuote = exports.normalizeBookings = exports.normalizeBooking = exports.normalizeCustomer = exports.normalizeTours = exports.normalizeTour = exports.normalizeReview = void 0;
const asNumber = (value) => {
    if (typeof value === "number")
        return value;
    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    if (value &&
        typeof value === "object" &&
        "$numberDecimal" in value &&
        typeof value.$numberDecimal === "string") {
        const parsed = Number(value.$numberDecimal);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
};
const asStringArray = (value) => {
    if (!Array.isArray(value))
        return [];
    return value.map((item) => String(item)).filter(Boolean);
};
const normalizeBookingStatus = (value) => {
    const status = String(value ?? "").trim();
    switch (status) {
        case "Chưa Đi":
        case "Chua Di":
            return "Pending";
        case "Đã Đi":
        case "Da Di":
            return "Completed";
        default:
            return status || "Pending";
    }
};
const getPayloadData = (payload) => {
    if (Array.isArray(payload))
        return payload;
    if (payload && Array.isArray(payload.data))
        return payload.data;
    if (payload && payload.data && payload.data.data !== undefined)
        return payload.data.data;
    if (payload && payload.data !== undefined)
        return payload.data;
    return payload;
};
const normalizeReview = (raw) => ({
    id: String(raw?.id ?? raw?._id ?? ""),
    tourId: String(raw?.tourId ?? raw?.tour_id ?? ""),
    customerId: String(raw?.customerId ?? raw?.customer_id ?? ""),
    rating: asNumber(raw?.rating),
    comment: raw?.comment ?? "",
    createdAt: raw?.createdAt ?? raw?.created_at,
    isApproved: raw?.isApproved ?? raw?.is_approved,
});
exports.normalizeReview = normalizeReview;
const normalizeTour = (raw) => {
    const firstStartDate = raw?.startDate ?? raw?.start_date;
    const startDates = [
        ...asStringArray(raw?.startDates),
        ...asStringArray(raw?.start_dates),
        ...(firstStartDate ? [String(firstStartDate)] : []),
    ].filter(Boolean);
    const reviews = Array.isArray(raw?.reviews) ? raw.reviews.map(exports.normalizeReview) : undefined;
    return {
        id: String(raw?.id ?? raw?._id ?? ""),
        code: raw?.code ?? "",
        name: raw?.name ?? "",
        description: raw?.description ?? "",
        shortDescription: raw?.shortDescription ?? raw?.short_description ?? "",
        category: raw?.category ?? "",
        destination: raw?.destination
            ? {
                city: raw.destination.city ?? "",
                country: raw.destination.country ?? "",
                region: raw.destination.region ?? undefined,
            }
            : undefined,
        images: asStringArray(raw?.images),
        price: {
            adult: asNumber(raw?.price?.adult),
            child: asNumber(raw?.price?.child),
            infant: asNumber(raw?.price?.infant),
            currency: raw?.price?.currency,
            discount: asNumber(raw?.price?.discount),
        },
        duration: {
            days: asNumber(raw?.duration?.days),
            nights: asNumber(raw?.duration?.nights),
            text: raw?.duration?.text ?? "",
        },
        startDates: Array.from(new Set(startDates)),
        schedule: Array.isArray(raw?.schedule)
            ? raw.schedule.map((item, index) => ({
                day: asNumber(item?.day) || index + 1,
                title: item?.title ?? `Lich trinh ngay ${index + 1}`,
                description: item?.description ?? "",
                activities: asStringArray(item?.activities),
            }))
            : [],
        generatedInclusions: asStringArray(raw?.generatedInclusions ?? raw?.generated_inclusions ?? raw?.inclusions),
        generatedExclusions: asStringArray(raw?.generatedExclusions ?? raw?.generated_exclusions ?? raw?.exclusions),
        maxParticipants: asNumber(raw?.maxParticipants ?? raw?.max_participants),
        currentParticipants: asNumber(raw?.currentParticipants ?? raw?.current_participants),
        rating: asNumber(raw?.rating),
        reviewCount: asNumber(raw?.reviewCount ?? raw?.review_count),
        status: raw?.status,
        createdAt: raw?.createdAt ?? raw?.created_at,
        updatedAt: raw?.updatedAt ?? raw?.updated_at,
        ...(reviews ? { reviews } : {}),
    };
};
exports.normalizeTour = normalizeTour;
const normalizeTours = (payload) => {
    const data = getPayloadData(payload);
    if (!Array.isArray(data))
        return [];
    return data.map(exports.normalizeTour);
};
exports.normalizeTours = normalizeTours;
const normalizeCustomer = (raw) => {
    if (!raw)
        return null;
    return {
        ...raw,
        id: String(raw?.id ?? raw?._id ?? ""),
        customerCode: raw?.customerCode ?? raw?.customer_code,
        phoneNumber: raw?.phoneNumber ?? raw?.phone_number ?? "",
        avatarUrl: raw?.avatarUrl ?? raw?.avatar_url ?? undefined,
        createdAt: raw?.createdAt ?? raw?.created_at,
        updatedAt: raw?.updatedAt ?? raw?.updated_at,
    };
};
exports.normalizeCustomer = normalizeCustomer;
const normalizeBooking = (raw) => ({
    id: String(raw?.id ?? raw?._id ?? ""),
    bookingCode: raw?.bookingCode ?? raw?.booking_code ?? "",
    tourId: String(raw?.tourId ?? raw?.tour_id ?? ""),
    tourSnapshot: raw?.tourSnapshot ?? raw?.tour_snapshot
        ? {
            code: raw?.tourSnapshot?.code ?? raw?.tour_snapshot?.code ?? "",
            name: raw?.tourSnapshot?.name ?? raw?.tour_snapshot?.name ?? "",
            startDate: raw?.tourSnapshot?.startDate ??
                raw?.tourSnapshot?.start_date ??
                raw?.tour_snapshot?.startDate ??
                raw?.tour_snapshot?.start_date ??
                "",
            duration: raw?.tourSnapshot?.duration ?? raw?.tour_snapshot?.duration ?? "",
        }
        : undefined,
    customerId: String(raw?.customerId ?? raw?.customer_id ?? ""),
    bookingDate: raw?.bookingDate ?? raw?.booking_date ?? "",
    totalAmount: asNumber(raw?.totalAmount ?? raw?.total_amount),
    status: normalizeBookingStatus(raw?.status),
    paymentStatus: raw?.paymentStatus ?? raw?.payment_status,
    participantsCount: asNumber(raw?.participantsCount ?? raw?.participants_count),
    passengers: Array.isArray(raw?.passengers)
        ? raw.passengers.map((item) => ({
            fullName: item?.fullName ?? item?.full_name ?? "",
            birthDate: item?.birthDate ?? item?.birth_date ?? undefined,
            type: item?.type ?? "Adult",
            gender: item?.gender ?? undefined,
            passportNumber: item?.passportNumber ?? item?.passport_number ?? undefined,
        }))
        : [],
    contactInfo: raw?.contactInfo ?? raw?.contact_info
        ? {
            name: raw?.contactInfo?.name ?? raw?.contact_info?.name ?? "",
            email: raw?.contactInfo?.email ?? raw?.contact_info?.email ?? "",
            phone: raw?.contactInfo?.phone ?? raw?.contact_info?.phone ?? "",
        }
        : undefined,
    notes: raw?.notes ?? "",
    historyLog: Array.isArray(raw?.historyLog ?? raw?.history_log)
        ? (raw?.historyLog ?? raw?.history_log).map((item) => ({
            action: item?.action ?? "",
            timestamp: item?.timestamp ?? "",
            user: item?.user ?? "",
            note: item?.note ?? "",
        }))
        : [],
    createdAt: raw?.createdAt ?? raw?.created_at,
    updatedAt: raw?.updatedAt ?? raw?.updated_at,
    isDeleted: raw?.isDeleted ?? raw?.is_deleted,
});
exports.normalizeBooking = normalizeBooking;
const normalizeBookings = (payload) => {
    const raw = payload?.data ?? payload;
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    return {
        bookings: list.map(exports.normalizeBooking),
        total: Number(payload?.total ?? list.length),
        page: Number(payload?.page ?? 1),
        totalPages: Number(payload?.totalPages ?? 1),
    };
};
exports.normalizeBookings = normalizeBookings;
const normalizeBookingQuote = (payload) => {
    const data = getPayloadData(payload);
    return {
        subtotal: asNumber(data?.subtotal),
        serviceFee: asNumber(data?.serviceFee ?? data?.service_fee),
        promoDiscount: asNumber(data?.promoDiscount ?? data?.promo_discount),
        total: asNumber(data?.total),
        pricePerAdult: asNumber(data?.pricePerAdult ?? data?.price_per_adult),
        pricePerChild: asNumber(data?.pricePerChild ?? data?.price_per_child),
        pricePerInfant: asNumber(data?.pricePerInfant ?? data?.price_per_infant),
        discountPercent: asNumber(data?.discountPercent ?? data?.discount_percent),
    };
};
exports.normalizeBookingQuote = normalizeBookingQuote;
const normalizeFavourite = (raw) => {
    const rawTour = raw?.tourId ?? raw?.tour ?? raw?.tour_id ?? raw?.tourID;
    const tourValue = rawTour && typeof rawTour === "object"
        ? (0, exports.normalizeTour)(rawTour)
        : String(rawTour ?? "");
    return {
        id: String(raw?.id ?? raw?._id ?? ""),
        customerId: raw?.customerId ?? raw?.customer_id,
        tourId: tourValue,
        createdAt: raw?.createdAt ?? raw?.created_at,
        updatedAt: raw?.updatedAt ?? raw?.updated_at,
    };
};
exports.normalizeFavourite = normalizeFavourite;
const normalizeFavourites = (payload) => {
    const data = getPayloadData(payload);
    if (!Array.isArray(data))
        return [];
    return data.map(exports.normalizeFavourite);
};
exports.normalizeFavourites = normalizeFavourites;
const extractFavouriteTourIds = (payload) => (0, exports.normalizeFavourites)(payload)
    .map((item) => (typeof item.tourId === "string" ? item.tourId : item.tourId.id))
    .filter(Boolean);
exports.extractFavouriteTourIds = extractFavouriteTourIds;
const getChatConversationSubtitle = (status) => {
    switch (status) {
        case "waitingCustomer":
            return "Đang chờ bạn";
        case "resolved":
        case "closed":
            return "Đã kết thúc";
        case "waitingStaff":
        default:
            return "Đang chờ tư vấn viên";
    }
};
exports.getChatConversationSubtitle = getChatConversationSubtitle;
const normalizeChatConversation = (raw) => {
    const supportDisplayName = String(raw?.supportDisplayName ?? raw?.title ?? "").trim();
    const status = String(raw?.status ?? "waitingStaff");
    return {
        id: String(raw?.id ?? raw?._id ?? ""),
        customerId: String(raw?.customerId ?? ""),
        code: String(raw?.conversationCode ?? raw?.code ?? ""),
        preview: String(raw?.lastMessagePreview ?? raw?.preview ?? ""),
        lastMessageAt: raw?.lastMessageAt ?? raw?.updatedAt ?? raw?.createdAt,
        unreadCount: asNumber(raw?.unreadForCustomerCount ?? raw?.unreadCount),
        status,
        channel: String(raw?.channel ?? "web"),
        title: supportDisplayName || "HV Travel Support",
        subtitle: String(raw?.subtitle ?? (0, exports.getChatConversationSubtitle)(status)),
    };
};
exports.normalizeChatConversation = normalizeChatConversation;
const normalizeChatConversations = (payload) => {
    const data = getPayloadData(payload);
    if (!Array.isArray(data))
        return [];
    return data.map(exports.normalizeChatConversation);
};
exports.normalizeChatConversations = normalizeChatConversations;
const normalizeChatMessage = (raw) => {
    const senderType = String(raw?.senderType ?? raw?.senderRole ?? "system").toLowerCase();
    const senderRole = senderType === "customer"
        ? "me"
        : senderType === "staff" || senderType === "admin" || senderType === "support"
            ? "support"
            : "system";
    return {
        id: String(raw?.id ?? raw?._id ?? ""),
        conversationId: String(raw?.conversationId ?? ""),
        senderRole,
        senderDisplayName: String(raw?.senderDisplayName ?? ""),
        messageType: String(raw?.messageType ?? "text"),
        text: String(raw?.content ?? raw?.text ?? ""),
        sentAt: raw?.sentAt ?? raw?.createdAt,
        isRead: Boolean(raw?.isRead),
    };
};
exports.normalizeChatMessage = normalizeChatMessage;
const normalizeChatMessages = (payload) => {
    const data = getPayloadData(payload);
    if (!Array.isArray(data))
        return [];
    return data.map(exports.normalizeChatMessage);
};
exports.normalizeChatMessages = normalizeChatMessages;
const toCalculatePricePayload = (input) => ({
    tour_id: input.tourId,
    adult_count: input.adultCount ?? 0,
    child_count: input.childCount ?? 0,
    infant_count: input.infantCount ?? 0,
});
exports.toCalculatePricePayload = toCalculatePricePayload;
const toCreateBookingPayload = (input) => ({
    tour_id: input.tourId,
    passengers: input.passengers.map((item) => ({
        type: item.type,
        full_name: item.fullName,
        birth_date: item.birthDate ?? null,
        gender: item.gender ?? null,
        passport_number: item.passportNumber ?? null,
    })),
    contact_info: {
        name: input.contactInfo.name,
        email: input.contactInfo.email,
        phone: input.contactInfo.phone,
        selected_date: input.contactInfo.selectedDate ?? "",
    },
    adult_count: input.adultCount ?? 0,
    child_count: input.childCount ?? 0,
    infant_count: input.infantCount ?? 0,
    notes: input.notes ?? "",
});
exports.toCreateBookingPayload = toCreateBookingPayload;
