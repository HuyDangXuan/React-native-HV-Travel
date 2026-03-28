const {
  getQueryDisplayState,
  getPullRefreshDisplayState,
  buildInboxFiltersKey,
} = require("../.test-dist/utils/loadingState");

describe("loading state utilities", () => {
  test("returns initial-loading when query is loading without data", () => {
    expect(
      getQueryDisplayState({
        isLoading: true,
        isFetching: true,
        data: undefined,
      })
    ).toEqual({
      showSkeleton: true,
      showRefreshing: false,
      hasData: false,
    });
  });

  test("keeps content visible during background fetch when data already exists", () => {
    expect(
      getQueryDisplayState({
        isLoading: false,
        isFetching: true,
        data: [{ id: "1" }],
      })
    ).toEqual({
      showSkeleton: false,
      showRefreshing: true,
      hasData: true,
    });
  });

  test("shows list skeleton during pull-to-refresh when data already exists", () => {
    expect(
      getPullRefreshDisplayState({
        isLoading: false,
        isRefreshing: true,
        data: [{ id: "1" }],
      })
    ).toEqual({
      showInitialSkeleton: false,
      showRefreshSkeleton: true,
      hasData: true,
    });
  });

  test("still shows refresh skeleton even when data is empty", () => {
    expect(
      getPullRefreshDisplayState({
        isLoading: false,
        isRefreshing: true,
        data: [],
      })
    ).toEqual({
      showInitialSkeleton: false,
      showRefreshSkeleton: true,
      hasData: false,
    });
  });

  test("shows initial skeleton on first load without data", () => {
    expect(
      getPullRefreshDisplayState({
        isLoading: true,
        isRefreshing: false,
        data: [],
      })
    ).toEqual({
      showInitialSkeleton: true,
      showRefreshSkeleton: false,
      hasData: false,
    });
  });

  test("creates a stable inbox filter key from trimmed filters", () => {
    expect(
      buildInboxFiltersKey({
        conversationCode: "  ABC123 ",
        customerId: "  user-9 ",
      })
    ).toBe("ABC123::user-9");
  });
});
