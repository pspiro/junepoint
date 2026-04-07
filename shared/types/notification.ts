export interface Notification {
  id: string;
  userId: string;
  loanId?: string;
  type: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
}

export type SseNotificationEvent = {
  type: 'NEW_NOTIFICATION';
  data: Notification;
};
