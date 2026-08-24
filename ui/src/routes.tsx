import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import ErrorPage from "./pages/ErrorPage";
import SearchPage from "./pages/SearchPage";
import AuthenticatedPages from "./pages/AuthenticatedPages";
import SignIn from "./pages/SignIn.tsx";
import AlertsPage from "./pages/AlertsPage";
import { useAuthStore } from "./store";

// "/" has no content of its own; send the user to sign-in or the search
// page depending on auth state instead of leaving the Outlet empty.
const IndexRedirect = () => {
  const { auth } = useAuthStore();
  return <Navigate to={auth?.authenticated ? "/app/search" : "/signin"} replace />;
};

export const routes = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <IndexRedirect />,
      },
      {
        path: "app",
        element: <AuthenticatedPages />,
        children: [
          {
            path: "search",
            element: <SearchPage />,
          },
          {
            path: "alerts",
            element: <AlertsPage />,
          },
        ],
      },
      {
        path: "signin",
        element: <SignIn />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
