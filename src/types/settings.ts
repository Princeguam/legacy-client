export type DevicePreferences = { activity: boolean; reminders: boolean };
export type UpdatePasswordRequest = { oldPassword: string; newPassword: string };
export type PasswordForm = UpdatePasswordRequest & { confirmPassword: string };
export type PasswordErrors = Partial<Record<keyof PasswordForm, string>>;
export type CooperativePlanningDraft = {
    name: string;
    year: string;
    target: string;
};
