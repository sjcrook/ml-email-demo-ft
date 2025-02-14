'use strict';

//import { } from '../local.js';
import { searchIcon, exclamationCircleIcon } from '@progress/kendo-svg-icons';

const config = {
    "APP_NAME": import.meta.env.VITE_APP_APP_NAME,
    "APP_PROXY_HOST": import.meta.env.VITE_APP_PROXY_HOST,
    "APP_PROXY_PORT": import.meta.env.VITE_APP_PROXY_PORT,
    "AUTH_WITH_TARGET_ON_AUTH": import.meta.env.VITE_APP_AUTH_WITH_TARGET_ON_AUTH,
    "SEARCH_DEFAULT_PAGE_LENGTH": import.meta.env.VITE_APP_SEARCH_DEFAULT_PAGE_LENGTH,
    "SEARCH_DEFAULT_OPTIONS_STR": import.meta.env.VITE_APP_SEARCH_DEFAULT_OPTIONS_STR,
    "NOTIFICATION_TIMEOUT_SHORT": import.meta.env.VITE_APP_NOTIFICATION_TIMEOUT_SHORT,
    "NOTIFICATION_TIMEOUT_LONG": import.meta.env.VITE_APP_NOTIFICATION_TIMEOUT_LONG,
    "SEARCH_MAX_ENUMERATED_PAGES": import.meta.env.VITE_APP_SEARCH_MAX_ENUMERATED_PAGES,
    "SEARCH_FACET_VIEWER_LESSER_AMOUNT_TO_DISPLAY": import.meta.env.VITE_APP_SEARCH_FACET_VIEWER_LESSER_AMOUNT_TO_DISPLAY,
    "PAGELENGTH_VALUES": import.meta.env.VITE_APP_PAGELENGTH_VALUES,
    "MENU_ITEMS_GUEST": [
    ],
    "MENU_ITEMS_AUTHENTICATED": [
        {
            text: 'Search',
            svgIcon: searchIcon,
            selected: true,
            route: '/app/search'
        }, {
            text: 'Alerts',
            svgIcon: exclamationCircleIcon,
            route: '/app/alerts'
        }
    ]
};

export default config;