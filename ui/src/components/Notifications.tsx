import { useNotificationStore } from "../store";
import {
    Notification,
    NotificationGroup,
} from "@progress/kendo-react-notification";

const Notifications = () => {
    const notifications = useNotificationStore(s => s.notifications);
    const removeNotification = useNotificationStore(s => s.removeNotification);

    return (
        <>
            <NotificationGroup
                style={{ top: "20px", left: "50%", transform: "translateX(-50%)" }}
            >
                {
                    notifications.map((notification, index) => {
                        return <Notification
                                className="appNotificationX"
                                type={{ style: notification.style, icon: notification.icon }}
                                closable={notification.closable}
                                onClose={() => removeNotification(notification.id!)}
                                key={'notification' + index}
                                style={{
                                    maxWidth: '400px',
                                    fontSize: '90%',
                                    fontWeight: 'bold'
                                }}
                            >
                                    <span>{ notification.message }</span>
                            </Notification>;
                    })
                }
            </NotificationGroup>
            <style>{`
                .k-notification-content {
                    padding-left: 10px;
                    padding-right: 5px;
                }
            `}</style>
        </>
    );
};

export default Notifications;