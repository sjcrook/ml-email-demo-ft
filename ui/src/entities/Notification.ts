type Notification = {
    id?: number;
    style: "none" | "success" | "error" | "warning" | "info" | undefined;
    icon: boolean;
    closable: boolean;
    message: string;
    timeout?: number;
}

export default Notification;