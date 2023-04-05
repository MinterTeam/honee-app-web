import { AxiosInstance } from 'axios';
declare module 'axios' {
    interface AxiosRequestConfig {
        ecdsaAuth?: EcdsaAuthOptions;
    }
}
export declare type EcdsaAuthOptions = {
    privateKey?: string;
    includePublicKey?: boolean;
    timestampThrottle?: number,
};
export default function addEcdsaAuthInterceptor(instance: AxiosInstance): void;
