import { MarkLogicContext } from "ml-fasttrack";
import { useContext } from "react";
import NetworkGraphSPARQL from "../components/NetworkGraphSPARQL";

const TestPage = () => {
    const context = useContext(MarkLogicContext);

    return (
        <div className="ngs-container">
            <NetworkGraphSPARQL
                documentResponse={{ uri: "/emails/taylor-m/all_documents/57_.xml" }}
                searchResponse={context.searchResponse}
            />
            <style>{`
                div.ngs-container {
                    height: calc(100vh - 60px);
                }

            `}</style>
        </div>
    );
};

export default TestPage;