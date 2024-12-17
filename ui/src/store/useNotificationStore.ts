import { create } from "zustand";
import Notification from "../entities/Notification";

interface NotificationStore {
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    removeNotification: (id: number) => void;
}

function hash(s: string) {
    let h = 0;
    // if the length of the string is 0, return 0
    if (s.length == 0) return h;
    for (let i = 0 ; i < s.length; i++) {
        let ch = s.charCodeAt(i);
        h = ((h << 5) - h) + ch;
        h = h & h;
    }
    return h;
}

const useNotificationStore = create<NotificationStore>(set => ({
    notifications: [],
    addNotification: (notification) => set((store) => {
        notification.id = hash(JSON.stringify(notification));
        if (store.notifications.find(n => n.id === notification.id) === undefined) {
            if (notification.timeout) {
                setTimeout(() => {
                    store.removeNotification(notification.id!);
                }, notification.timeout);
            }
            return {
                notifications: [ ...store.notifications, notification ]
            };
        } else {
            return {
                notification: store.notifications
            };
        }
    }),
    removeNotification: (id:number) => set((store) => ({
        notifications: store.notifications.filter(item => item.id !== id)
    }))
}));

export default useNotificationStore;