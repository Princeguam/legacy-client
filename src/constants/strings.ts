// Shared application vocabulary. Keep one-off screen copy beside its screen.
export const APP_NAME = "Legacy Wealth Cooperatives";
export const APP_TAGLINE = 'Rooted in trust. Growing together.';
export const APP_INITIALS = "LW";
export const APP_CURRENCY = "NGN";
export const APP_LOCALE = "en-NG";
export const LEDGER_TIME_ZONE = "UTC";

export const USER_ROLES = { user: "user", admin: "Admin" } as const;
export const SERVER_MEMBER_ROLE = "User";
export const MEMBER_SORTS = {
    newest: { by: 'created', order: 'desc', label: 'Newest first' },
    oldest: { by: 'created', order: 'asc', label: 'Oldest first' },
    nameAsc: { by: 'fullName', order: 'asc', label: 'Name (A–Z)' },
    nameDesc: { by: 'fullName', order: 'desc', label: 'Name (Z–A)' },
    emailAsc: { by: 'email', order: 'asc', label: 'Email (A–Z)' },
} as const;
export const MEMBER_MESSAGES = {
    loadFailed: 'Unable to load users. Please try again.',
    wrongRecord: 'The server returned a different user. Please try again.',
    add: 'Add user',
    pending: 'User creation is being prepared',
    notSubmitted: 'These details have not been submitted. Saving will be available once user creation is connected.',
    review: 'Review user details',
    active: 'Active',
    inactive: 'Inactive',
    choose: 'Select a member',
    required: 'Select a member from the list.',
    loading: 'Loading members…',
    empty: 'No members are available.',
} as const;
export const MEMBER_CONTACT_LABELS = {
    occupation: 'Occupation',
    nextOfKinName: 'Next of kin',
    nextOfKinRelationship: 'Next of kin relationship',
    nextOfKinPhone: 'Next of kin phone',
    emergencyContact: 'Emergency contact',
    emergencyContactPhone: 'Emergency contact phone',
    emergencyContactRelationship: 'Emergency contact relationship',
} as const;
export const ROLE_LABELS = { user: "Member", admin: "Administrator" } as const;
export const THEMES = { light: "light", dark: "dark" } as const;
export const PAYMENT_STATUS = {
    pending: "PENDING",
    confirmed: "CONFIRMED",
    rejected: "REJECTED",
} as const;
export const PAYMENT_STATUS_LABELS = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    REJECTED: "Rejected",
} as const;
export const PAYMENT_TYPE = {
    deposit: "DEPOSIT",
    withdrawal: "WITHDRAWAL",
    adjustment: "ADJUSTMENT",
    finePayment: "FINE_PAYMENT",
} as const;
export const PAYMENT_TYPE_LABELS = {
    DEPOSIT: "Deposit",
    WITHDRAWAL: "Withdrawal",
    ADJUSTMENT: "Adjustment",
    FINE_PAYMENT: "Fine payment",
} as const;
export const PAYMENT_SORTS = {
    newest: { by: "created", order: "desc", label: "Newest first" },
    oldest: { by: "created", order: "asc", label: "Oldest first" },
    statusAsc: { by: "status", order: "asc", label: "Status (A–Z)" },
    statusDesc: { by: "status", order: "desc", label: "Status (Z–A)" },
} as const;
export const PAYMENT_MESSAGES = {
    loadFailed: "Unable to load transactions. Please try again.",
    wrongAccount:
        "The returned transaction does not match your signed-in account.",
    wrongRecord:
        "The server returned a different transaction. Please try again.",
    invalidAmount: "Enter a positive amount with up to two decimal places.",
    saved: "The transaction has been created.",
    approved: "The payment has been confirmed.",
    rejected: "The payment has been rejected.",
    saveFailed: "Unable to save the transaction. Please try again.",
    reviewFailed: "Unable to review the payment. Please try again.",
    placeholder: "Awaiting summary data",
} as const;
export const PAYMENT_REVIEW_LABELS = {
    title: 'Update transaction status',
    confirm: 'Confirm payment',
    reject: 'Reject payment',
    apply: 'Confirm status change',
} as const;

export const FEEDBACK_CATEGORIES = {
    suggestion: "Suggestion",
    interfaceIssue: "Bug",
    general: "General",
} as const;
export const FEEDBACK_SORTS = {
    newest: { by: "created", order: "desc", label: "Newest first" },
    oldest: { by: "created", order: "asc", label: "Oldest first" },
    categoryAsc: { by: "category", order: "asc", label: "Category (A–Z)" },
    categoryDesc: { by: "category", order: "desc", label: "Category (Z–A)" },
} as const;
export const FEEDBACK_MESSAGES = {
    create: "Create feedback",
    submit: "Send feedback",
    subjectRequired: "Enter a subject for your feedback.",
    subjectLength: "Use 120 characters or fewer for the subject.",
    messageRequired: "Add your feedback message.",
    categoryRequired: "Choose a feedback category.",
    saved: "Your feedback has been sent to the cooperative.",
    saveFailed: "Unable to send feedback. Please try again.",
    loadFailed: "Unable to load feedback. Please try again.",
    loadTitle: "Unable to load feedback",
    listTitle: "Submitted feedback",
    wrongAccount:
        "The returned feedback does not match your signed-in account.",
    wrongFeedback:
        "The server returned a different feedback record. Please try again.",
    empty: "No feedback has been submitted yet.",
    view: "View feedback",
    created: "Created",
    sender: "Submitted by",
    message: "Message",
    retry: "Try again",
    refresh: "Refresh",
} as const;

export const PAGE_PATHS = {
    home: "home",
    transactions: "transactions",
    addTransaction: "transactions/new",
    contributions: "contributions", // Legacy URL; redirects to contribution-filtered transactions.
    portfolio: "portfolio",
    members: "members",
    memberDetails: "members/:memberId",
    profile: "profile",
    settings: "settings",
    feedback: "feedback",
    newFeedback: "feedback/new",
    bankAccounts: "bank-accounts",
    legacyDashboard: "dashboard",
} as const;
export const ROUTES = {
    root: "/",
    login: "/login",
    designSystem: "/design-system",
    preview: "/preview",
    underConstruction: "/under-construction",
    user: "/user",
    admin: "/admin",
    previewUser: "/preview/user",
    previewAdmin: "/preview/admin",
    userHome: `/user/${PAGE_PATHS.home}`,
    adminHome: `/admin/${PAGE_PATHS.home}`,
    previewUserHome: `/preview/user/${PAGE_PATHS.home}`,
    previewAdminHome: `/preview/admin/${PAGE_PATHS.home}`,
} as const;
export const PAGE_LABELS = {
    underConstruction: "Page under construction",
    home: "Home",
    transactions: "Transactions",
    addTransaction: "Add transaction",
    portfolio: "Portfolio",
    members: "Members",
    memberDetails: "Member details",
    profile: "Profile",
    settings: "Settings",
    feedback: "Feedback",
    newFeedback: FEEDBACK_MESSAGES.create,
    bankAccounts: "Bank accounts",
} as const;

export const PAGE_AVAILABILITY_MESSAGES = {
    preparing: "We're preparing this page for you.",
    patience: "Thank you for your patience while we get everything ready.",
} as const;

export const STORAGE_KEYS = {
    session: "legacy-wealth-session",
    theme: "legacy-wealth-theme",
    devicePreferences: "legacy-wealth-device-preferences",
} as const;
export const EVENTS = { themeChange: "legacy-wealth-theme-change" } as const;
export const API_PATHS = {
    base: "/api",
    login: "/auth/login",
    profile: "/profile",
    notifications: "/notification",
    feedback: "/feedback",
    adminFeedback: "/admin/feedback",
    transactions: "/transaction",
    adminTransactions: "/admin/transaction",
    adminUsers: "/admin/user",
    adminBankAccounts: "/admin/bank",
    bankAccountOptions: "/bank/no",
    memberOptions: "/admin/user/no",
    password: "/setting/password",
    upload: "/util/upload",
} as const;
export const BANK_ACCOUNT_SORTS = {
    newest: { by: 'createdAt', order: 'desc', label: 'Newest first' },
    name: { by: 'bankName', order: 'asc', label: 'Bank name (A–Z)' },
} as const;
export const BANK_ACCOUNT_MESSAGES = {
    label: 'Cooperative bank account',
    choose: 'Select a bank account',
    required: 'Select an active cooperative bank account.',
    loading: 'Loading bank accounts…',
    empty: 'No active bank accounts are available.',
    unavailable: 'Unable to load bank accounts. Please try again.',
    saved: 'The bank account has been created.',
    saveFailed: 'Unable to create the bank account. Please try again.',
    bankRequired: 'Enter the bank name.',
    nameRequired: 'Enter the account name.',
    numberRequired: 'Enter the account number using digits.',
    unconfirmed: 'The server did not confirm these bank account details. Your entries are preserved.',
} as const;
export const PASSWORD_MESSAGES = {
    currentRequired: 'Enter your current password.',
    newRequired: 'Enter a new password.',
    different: 'Choose a password different from your current password.',
    confirmRequired: 'Confirm your new password.',
    mismatch: 'The passwords do not match.',
    saved: 'Your password has been updated.',
    failed: 'Unable to update your password. Please try again.',
    update: 'Update password',
} as const;
export const MIME_TYPES = {
    json: "application/json",
    pdf: "application/pdf",
    jpeg: "image/jpeg",
    png: "image/png",
} as const;
export const RECEIPT_ACCEPT = `${MIME_TYPES.pdf},${MIME_TYPES.jpeg},${MIME_TYPES.png},.pdf,.jpg,.jpeg,.png`;
export const MIN_TRANSACTION_DATE = "1000-01-01";

export const COMMON_LABELS = {
    cancel: "Cancel",
    previous: "Previous",
    next: "Next",
    view: "View",
    viewAll: "View all",
    clearFilters: "Clear filters",
    allStatuses: "All statuses",
    allTypes: "All types",
    notProvided: "Not provided",
    notAvailable: "Not available",
    notEnrolled: "Not enrolled",
    yourAccount: "Your account",
    illustrative: "Illustrative",
    pagePreview: "Page preview",
    signOut: "Sign out",
    backToSignIn: "Back to sign in",
    discardDraft: "Discard draft",
    pendingContributions: "Pending contributions",
    confirmedContributions: "Confirmed contributions",
    remainingForYear: "Remaining for the year",
    cooperative: "Cooperative",
    transactionHistory: "Transaction history",
    transactionDetails: "Transaction details",
    transactionType: "Transaction type",
    transactionStatus: "Transaction status",
    description: "Description",
    reference: "Payment reference",
    date: "Date",
    amount: "Amount",
    firstName: "First name",
    lastName: "Last name",
    middleName: "Middle name",
    dob: "Date of birth",
    address: "Address",
    state: "State",
    lga: "Local government area",
    gender: "Gender",
    emailAddress: "Email address",
    phoneNumber: "Phone number",
    status: "Status",
    type: "Type",
    category: "Category",
    subject: "Subject",
    contributed: "Contributed",
    annualProgress: "Annual progress",
    details: "Details",
    investmentAllocation: "Investment allocation",
    availableCash: "Available cash",
    editProfile: "Edit profile",
    contributionReminders: "Contribution reminders",
    searchDescription: "Description or reference",
    noRecords: "0 records",
    tableScrollHint: 'Scroll the table horizontally to view all columns.',
} as const;

export const AUTH_MESSAGES = {
    failed: "Unable to sign in. Please try again.",
    unverified:
        "Your account could not be verified. Please contact your cooperative administrator.",
    unavailable:
        "The sign-in service is unavailable. Please try again shortly.",
    rateLimited:
        "Too many sign-in attempts. Please wait a moment and try again.",
    credentials:
        "Unable to sign in. Check your email and password, then try again.",
    timeout: "The sign-in request timed out. Please try again.",
    connection:
        "Unable to connect to the sign-in service. Please try again shortly.",
    duplicate: "A sign-in request is already in progress.",
    emailRequired: "Enter your email address.",
    emailInvalid: "Enter a valid email address, such as name@example.com.",
    passwordRequired: "Enter your password.",
} as const;
export const API_MESSAGES = {
    unavailable:
        "The server returned an unexpected response. Please try again.",
    timeout: "The request timed out. Please try again.",
    connection: "Unable to connect to the server. Please try again.",
    accountMismatch:
        "The returned profile does not match your signed-in account. Please sign out and sign in again.",
    signInRequired: "Please sign in to continue.",
} as const;
export const PROFILE_MESSAGES = {
    firstNameRequired: "Enter your first name.",
    lastNameRequired: "Enter your last name.",
    emailInvalid: "Enter a valid email address.",
    phoneRequired: "Enter your phone number.",
    dobInvalid: "Choose a valid date of birth.",
    dobFuture: "Your date of birth must be today or earlier.",
    saved: "Your profile has been updated.",
} as const;
export const PROFILE_OPTIONAL_FIELDS = [
    "middleName",
    "dob",
    "address",
    "state",
    "lga",
    "gender",
    ...Object.keys(MEMBER_CONTACT_LABELS) as (keyof typeof MEMBER_CONTACT_LABELS)[],
    "passport",
] as const;
export const UPLOAD_FILE_FIELD = 'files';
export const AVATAR_ACCEPT = `${MIME_TYPES.jpeg},${MIME_TYPES.png},.jpg,.jpeg,.png`;
export const UPLOAD_MESSAGES = {
    failed: 'Unable to upload the file. Please try again.',
    empty: 'This file is empty. Choose another file.',
    size: 'Choose a file that is 10 MB or smaller.',
    avatarType: 'Choose a JPEG or PNG avatar.',
    avatarUploading: 'Uploading avatar…',
    receiptUploading: 'Uploading receipt…',
    uploaded: 'File uploaded. Ready to save.',
    retry: 'Retry upload',
    profileNotSaved: 'The server did not confirm all your changes. Your entries are preserved. Check your profile before retrying.',
} as const;
export const NOTIFICATION_TYPES = {
    depositApproved: "Deposit_Approved",
    depositRejected: "Deposit_Rejected",
    dues: "Dues",
    fine: "Fine",
    general: "General",
} as const;
export const NOTIFICATION_TYPE_LABELS = {
    Deposit_Approved: "Deposit approved",
    Deposit_Rejected: "Deposit rejected",
    Dues: "Dues",
    Fine: "Fine",
    General: "General",
} as const;
export const NOTIFICATION_MESSAGES = {
    title: "Notifications",
    description: "Unread updates for your account.",
    markRead: "Mark as read",
    markAllRead: "Mark all as read",
    empty: "No unread notifications.",
    unavailable: "Unable to load notifications. Please try again.",
    updateFailed: "Unable to update notifications. Please try again.",
    wrongAccount:
        "The returned notifications do not match your signed-in account. Please sign out and sign in again.",
    readSaved: "Notification marked as read.",
    allReadSaved: "All notifications marked as read.",
} as const;
export const TRANSACTION_MESSAGES = {
    receiptType: "Choose a PDF, JPEG, or PNG receipt.",
    receiptEmpty: "This file is empty. Choose another receipt.",
    receiptSize: "The receipt must be 10 MB or smaller.",
    dateInvalid: "Choose a valid transaction date.",
    dateFuture:
        "Use today or an earlier date for a transaction that has happened.",
    amountInvalid: "Enter a positive amount, with up to two decimal places.",
    notesLength: "Use 1,000 characters or fewer.",
} as const;
