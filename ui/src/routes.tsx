import { createBrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout";
import ErrorPage from "./pages/ErrorPage";
import SearchPage from "./pages/SearchPage";
import AuthenticatedPages from "./pages/AuthenticatedPages";
import TestPage from "./pages/TestPage";
import GuestPage from "./pages/GuestPage";
import SignIn from "./pages/SignIn";
import NetworkGraphSPARQLExample from "./pages/NetworkGraphSPARQLExample";
import CategorialChartExamples from "./pages/CategorialChartExamples";
import TimelineEventDataExample from "./pages/TimelineEventDataExample";
import GeoMapExampleStaticData from "./pages/GeoMapExampleStaticData";
import NetworkGraphSearchExample from "./pages/NetworkGraphSearchExample";
import TimelineExample from "./pages/TimelineExample";
import GeoMapExample from "./pages/GeoMapExample";
import DataGridPage from "./pages/DataGridPage";
import AlertsPage from "./pages/AlertsPage";
import TimelineEmailSearch from "./components/TimelineEmailSearch";

/*
const routes: {
    path: string;
    element: JSX.Element;
    errorElement: JSX.Element;
    children: ({
        path: string;
        element: JSX.Element;
        children: ({
            name: RouteNames;
            index: boolean;
            element: JSX.Element;
            path?: undefined;
        } | {
            ...;
        })[];
    } | {
        ...;
    })[];
*/

/*export enum RouteNames {
    HOME = 'HOME',
    SIGNIN = 'SIGNIN',
    TEST = 'TEST'
}*/

/*type Route = {
    name?: RouteNames;
    path?: string;
    element: JSX.Element;
    errorElement?: JSX.Element;
    index?: boolean;
    children?: Route[];
}*/

/*export function getPath(r: any, n: RouteNames, pathAcc = '', level = 0): any {
    let i = 0;
    let path = null;
    while (i < r.length && path === null) {
        const newPath = pathAcc + '/' + (r[i].path ? r[i].path : '');
        if (r[i].name && r[i].name === n) {
            path = newPath;
        } else if (r[i].children) {
            path = getPath(r[i].children!, n, newPath, level + 1);
        }
        i++;
    }
    if (path === null && level === 0) {
        throw new Error('invalid name: ' + n);
    } else if (path === null) {
        return path;
    } else {
        return path.replace(/\/+/, '/');
    }
}*/

export const routes = [
    {
        path: '/',
        element: <Layout/>,
        errorElement: <ErrorPage/>,
        children: [
            {
                path: 'app',
                element: <AuthenticatedPages/>,
                children: [
                    {
                        path: 'search',
                        element: <SearchPage/>
                    },
                    {
                        path: 'alerts',
                        element: <AlertsPage/>
                    },
                    {
                        path: 'networkgraphsearchexample',
                        element: <NetworkGraphSearchExample/>
                    },
                    {
                        path: 'networkgraphsparqlexample',
                        element: <NetworkGraphSPARQLExample/>
                    },
                    {
                        path: 'geomapexample',
                        element: <GeoMapExample/>
                    },
                    {
                        path: 'datagrid',
                        element: <DataGridPage/>
                    },
                    {
                        path: 'timelineexample',
                        element: <TimelineExample/>
                    },
                    {
                        path: 'test',
                        element: <TestPage/>
                    }
                ]
            },
            {
                path: 'signin',
                element: <SignIn/>
            },
            {
                path: 'guest',
                element: <GuestPage/>
            },
            {
                path: 'categoricalchartexamples',
                element: <CategorialChartExamples/>
            },
            {
                path: 'geomapexample',
                element: <GeoMapExampleStaticData/>
            },
            {
                path: 'timelineeventdataexample',
                element: <TimelineEventDataExample/>
            }
        ]
    }
];

const router = createBrowserRouter(routes);

export default router;