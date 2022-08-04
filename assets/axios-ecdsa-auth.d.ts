/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2017-10-12
 */
import { AxiosInstance } from 'axios';
declare module 'axios' {
    interface AxiosRequestConfig {
        ecdsaAuth?: EcdsaAuthOptions;
    }
}
export declare type EcdsaAuthOptions = {
    privateKey?: string;
    includePublicKey?: boolean;
};
export default function addEcdsaAuthInterceptor(instance: AxiosInstance): void;
