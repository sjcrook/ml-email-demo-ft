'use strict';

//import { } from '../local.js';
import { calendarIcon, chartAreaStacked100Icon, circleIcon, globeOutlineIcon, linkIcon, linkVerticalIcon, searchIcon, slidersIcon } from '@progress/kendo-svg-icons';

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
        {
            text: 'Categorical Chart Examples',
            svgIcon: chartAreaStacked100Icon,
            route: '/categoricalchartexamples'
        }, {
            text: 'GeoMap Example',
            svgIcon: globeOutlineIcon,
            route: '/geomapexample'
        }, {
            text: 'Timeline Event Data Example',
            svgIcon: slidersIcon,
            route: '/timelineeventdataexample'
        }, {
            text: 'Guest Page',
            svgIcon: circleIcon,
            route: '/guest',
            selected: true
        }
    ],
    "MENU_ITEMS_AUTHENTICATED": [
        {
            text: 'Search',
            svgIcon: searchIcon,
            selected: true,
            route: '/app/search'
        }, {
            text: 'Alerts',
            svgIcon: searchIcon,
            route: '/app/alerts'
        }, {
            separator: true
        }, {
            text: 'Network Graph Search Example',
            svgIcon: linkIcon,
            route: '/app/networkgraphsearchexample'
        },
        {
            text: 'Network Graph SPARQL Example',
            svgIcon: linkVerticalIcon,
            route: '/app/networkgraphsparqlexample'
        },
        {
            text: 'GeoMap Example',
            svgIcon: globeOutlineIcon,
            route: '/app/geomapexample'
        },
        {
            text: 'Data Grid',
            svgIcon: globeOutlineIcon,
            route: '/app/datagrid'
        },
        {
            text: 'Timeline Example',
            svgIcon: slidersIcon,
            route: '/app/timelineexample'
        },
        {
            text: 'Test Page',
            svgIcon: circleIcon,
            route: '/app/test'
        }
    ]
};

export default config;