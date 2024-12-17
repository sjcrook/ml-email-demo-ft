import axios from "axios";
import { APP_CONFIG } from "../local";

const axiosInstance = axios.create({
    baseURL: 'http://' + APP_CONFIG.APP_PROXY_HOST + ':' + APP_CONFIG.APP_PROXY_PORT,
});

class APIClient<T> {
    endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    get = (p: (object | string | null) = {}) => {
        if (typeof p === null) {
            return axiosInstance.get<T>(this.endpoint);
        } else if (typeof p === 'string') {
            return axiosInstance.get<T>(this.endpoint + '?' + p)
        } else {
            return axiosInstance.get<T>(this.endpoint, p);
        }
    }

    post = (urlParams: object, postData: object) => {
        return axiosInstance.post<T>(this.endpoint, postData, { params: urlParams });
    }

    put = (config: object) => {
        return axiosInstance.put<T>(this.endpoint, config);
    }

}

export default APIClient;