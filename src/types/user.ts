import type {
    PROFILE_OPTIONAL_FIELDS,
    MEMBER_SORTS,
    SERVER_MEMBER_ROLE,
    USER_ROLES,
} from "@/constants/strings";
import type { ApiResponse, PaginatedApiData } from "./api";

export type ServerUserRole =
    | typeof SERVER_MEMBER_ROLE
    | typeof USER_ROLES.admin;

/** Fields selected by the backend's users serializer, with JSON date strings. */
export type ApiUser = {
    id: number;
    firstName: string;
    middleName: string | null;
    lastName: string;
    email: string;
    phoneNo: string;
    dob: string | null;
    address: string | null;
    state: string | null;
    lga: string | null;
    gender: string | null;
    passport: string | null;
    role: ServerUserRole;
    isAdmin: boolean;
    isDeleted: boolean;
    created: string;
    updated: string;
    occupation?: string | null;
    nextOfKinName?: string | null;
    nextOfKinRelationship?: string | null;
    nextOfKinPhone?: string | null;
    emergencyContact?: string | null;
    emergencyContactPhone?: string | null;
    emergencyContactRelationship?: string | null;
};

export type ProfileResponseData = ApiUser;
/** Minimal unpaginated administrator payment recipient lookup. */
export type MemberOption = { id: number; fullName: string | null; email: string; phoneNo: string };
export type MemberListData = PaginatedApiData<ApiUser>;
export type MemberListQuery = {
    page: number;
    sort: keyof typeof MEMBER_SORTS;
    search: string;
    isActive: boolean;
};
export type NewMemberFormValues = ProfileFormValues;
export type CreateMemberRequest = UpdateProfileRequest;
export type ProfileResponse = ApiResponse<ProfileResponseData>;
/** Personal fields accepted by the shared own-profile endpoint. */
export type UpdateProfileRequest = Pick<
    ApiUser,
    "firstName" | "lastName" | "email" | "phoneNo"
> &
    Partial<Pick<ApiUser, (typeof PROFILE_OPTIONAL_FIELDS)[number]>>;
export type ProfileFormValues = {
    [Field in Exclude<keyof Required<UpdateProfileRequest>, 'passport'>]: string;
};
export type ProfileFormErrors = Partial<
    Record<keyof UpdateProfileRequest, string>
>;
