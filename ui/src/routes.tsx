import { createBrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout";
import ErrorPage from "./pages/ErrorPage";
import SearchPage from "./pages/SearchPage";
import AuthenticatedPages from "./pages/AuthenticatedPages";
import SignIn from "./pages/SignIn.tsx";
import AlertsPage from "./pages/AlertsPage";

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
                    }
                ]
            },
            {
                path: 'signin',
                element: <SignIn/>
            }
        ]
    }
];

const router = createBrowserRouter(routes);

export default router;