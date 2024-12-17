// https://vitejs.dev/guide/env-and-mode
interface ImportMetaEnv {
    readonly VITE_APP_APP_NAME: string;
    readonly VITE_APP_PROXY_HOST: string;
    readonly VITE_APP_PROXY_PORT: string;
    readonly VITE_APP_AUTH_WITH_TARGET_ON_AUTH: boolean;
    readonly VITE_APP_SEARCH_DEFAULT_OPTIONS_STR: string;
    readonly VITE_APP_NOTIFICATION_TIMEOUT_SHORT: number;
    readonly VITE_APP_NOTIFICATION_TIMEOUT_LONG: number;
    readonly VITE_APP_PAGELENGTH_VALUES: string;
    readonly VITE_APP_DEFAULT_PAGE_LENGTH: number;
    // more env variables...
}
  
interface ImportMeta {
    readonly env: ImportMetaEnv
}