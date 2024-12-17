import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

const ErrorPage = () => {
    const error = useRouteError();
    return (
        <>
            <div>Oops!</div>
            <div>{ isRouteErrorResponse(error) ? "This page does not exist." : "An unexpected error occurred." }</div>
        </>
    )
};

export default ErrorPage;