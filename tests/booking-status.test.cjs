const { normalizeBooking } = require("../.test-dist/services/dataAdapters");

describe("booking status normalization", () => {
  test('maps legacy "Chưa Đi" status into an upcoming booking status', () => {
    const booking = normalizeBooking({ status: "Chưa Đi" });

    expect(["Pending", "Paid", "Confirmed"]).toContain(booking.status);
  });

  test('maps legacy "Đã Đi" status into a past booking status', () => {
    const booking = normalizeBooking({ status: "Đã Đi" });

    expect(["Completed", "Cancelled", "Refunded"]).toContain(booking.status);
  });
});
