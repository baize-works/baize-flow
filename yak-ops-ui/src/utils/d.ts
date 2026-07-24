// types/apiResponse.ts
export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}
