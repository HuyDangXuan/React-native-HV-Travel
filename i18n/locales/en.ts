const en = {
  common: {
    continue: "Continue",
    cancel: "Cancel",
    close: "Close",
    current: "Current",
  },
  settings: {
    title: "Settings",
    accountSection: "Account",
    appSection: "App",
    supportSection: "Support",
    profile: "Account",
    bookings: "Booked trips",
    security: "Security",
    transactions: "Transaction history",
    language: "Language",
    appearance: "Appearance",
    help: "Help",
    terms: "Terms",
    softLogout: "Log out",
    profileFallbackName: "HV Traveler",
    profileFallbackEmail: "No email updated",
    viewProfile: "View profile",
    softLogoutTitle: "Log out",
    softLogoutMessage:
      "You'll go back to the login screen, but quick access on this device will still be available.",
  },
  language: {
    title: "Language",
    subtitle: "Change the display language for the whole app.",
    vietnamese: "Tiếng Việt",
    english: "English",
    changedTitle: "Updated",
    changedMessage: "The app language is now {{language}}.",
  },
  appearance: {
    title: "Appearance",
    subtitle: "Choose light, dark, or follow your device settings.",
    light: "Light",
    dark: "Dark",
    system: "System",
    currentMode: "Current mode",
  },
  help: {
    title: "Help",
    subtitle: "Fast ways to get support when you need it.",
    faqTitle: "Frequently asked questions",
    faqDescription: "Quick answers for login, payment, and booking issues.",
    hotlineTitle: "Support hotline",
    hotlineDescription: "1900 6868 · 08:00 - 22:00 daily.",
    emailTitle: "Support email",
    emailDescription: "support@hvtravel.vn",
    inboxTitle: "In-app messages",
    inboxDescription: "Open Inbox to chat directly with the support team.",
  },
  terms: {
    title: "Terms",
    subtitle: "The main rules for using the HV Travel app.",
    bookingTitle: "1. Booking tours",
    bookingBody:
      "Tour information, seat availability, and prices may change until payment is confirmed.",
    paymentTitle: "2. Payments",
    paymentBody:
      "Users should verify amount, payment method, and status before leaving the payment flow.",
    accountTitle: "3. Account",
    accountBody:
      "You are responsible for protecting your password and your active sessions on personal devices.",
    privacyTitle: "4. Privacy",
    privacyBody:
      "The app only uses necessary information to process bookings, provide support, and improve the experience.",
  },
} as const;

export default en;
