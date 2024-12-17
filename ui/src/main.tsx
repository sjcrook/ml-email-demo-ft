import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom'
import router from './routes'
import { MarkLogicProvider } from "ml-fasttrack";
import { APP_CONFIG } from './local';
import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './App.scss';
import './App.css';
import './index.css';

//            auth={{ username: "ml-demo-app-user", password: "password" }}
//            options="search-options"
//            paginationOptions={{ pageLength: 10 }}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <MarkLogicProvider
            scheme="http"
            host={APP_CONFIG.APP_PROXY_HOST}
            port={APP_CONFIG.APP_PROXY_PORT}
            options={APP_CONFIG.SEARCH_DEFAULT_OPTIONS_STR}
            paginationOptions={{ pageLength: 10 }}
        >
            <RouterProvider router={ router } />
        </MarkLogicProvider>
    </React.StrictMode>
);