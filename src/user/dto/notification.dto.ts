export class CreateNotificationDto {
  message: string;
}

export class NotificationResponseDto {
  username: string;
  notifications: string[];
  count: number;
}
