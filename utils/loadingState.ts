type QueryDisplayStateInput<TData> = {
  isLoading: boolean;
  isFetching: boolean;
  data?: TData | null;
};

const hasRenderableData = (value: unknown) => {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null;
};

export const getQueryDisplayState = <TData>({
  isLoading,
  isFetching,
  data,
}: QueryDisplayStateInput<TData>) => {
  const hasData = hasRenderableData(data);

  return {
    showSkeleton: isLoading && !hasData,
    showRefreshing: isFetching && hasData,
    hasData,
  };
};

export const getPullRefreshDisplayState = <TData>({
  isLoading,
  isRefreshing,
  data,
}: {
  isLoading: boolean;
  isRefreshing: boolean;
  data?: TData | null;
}) => {
  const hasData = hasRenderableData(data);

  return {
    showInitialSkeleton: isLoading && !hasData,
    showRefreshSkeleton: isRefreshing,
    hasData,
  };
};

export const buildInboxFiltersKey = (filters?: {
  conversationCode?: string;
  customerId?: string;
}) => {
  const conversationCode = filters?.conversationCode?.trim() ?? "";
  const customerId = filters?.customerId?.trim() ?? "";
  return `${conversationCode}::${customerId}`;
};
