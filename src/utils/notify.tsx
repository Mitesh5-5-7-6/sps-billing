import { Notification, toast } from "@/components/ui";

type NotificationType = 'success' | 'warning' | 'danger' | 'info';

const Notify = (
    type: NotificationType,
    message: string,
    title?: string,
    duration: number = 3000
) => {
    const notificationElement = (
        <Notification title={title} type={type}>
            {message}
        </Notification>
    );
    toast.push(notificationElement, duration);
};

export default Notify;
