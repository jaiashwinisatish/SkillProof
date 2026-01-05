import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { NotificationType } from '../common/enums';

export interface CreateNotificationData {
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(userId: string, data: CreateNotificationData) {
    return this.prisma.notification.create({
      data: {
        userId,
        title: data.title,
        message: data.message,
        type: data.type,
        data: data.data || {},
      },
    });
  }

  async getUserNotifications(userId: string, limit = 20, offset = 0) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });
  }

  async deleteAllNotifications(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }

  // Bulk notification methods
  async notifyMultipleUsers(userIds: string[], data: CreateNotificationData) {
    const notifications = userIds.map(userId => ({
      userId,
      title: data.title,
      message: data.message,
      type: data.type,
      data: data.data || {},
    }));

    return this.prisma.notification.createMany({
      data: notifications,
    });
  }

  // System-wide notifications (for admins)
  async createSystemNotification(data: CreateNotificationData) {
    // Get all active users
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    return this.notifyMultipleUsers(users.map(user => user.id), data);
  }

  // Specific notification helpers
  async notifyProjectApproved(userId: string, projectTitle: string) {
    return this.createNotification(userId, {
      title: 'Project Approved! 🎉',
      message: `Your project "${projectTitle}" has been approved and is now visible to recruiters.`,
      type: NotificationType.PROJECT_APPROVED,
      data: { projectTitle },
    });
  }

  async notifyProjectRejected(userId: string, projectTitle: string, reason?: string) {
    return this.createNotification(userId, {
      title: 'Project Review Update',
      message: `Your project "${projectTitle}" needs some revisions. Please check the feedback.`,
      type: NotificationType.PROJECT_REJECTED,
      data: { projectTitle, reason },
    });
  }

  async notifySkillVerified(userId: string, skillName: string, level: string) {
    return this.createNotification(userId, {
      title: 'Skill Verified! 🏆',
      message: `Your ${skillName} skill has been verified at ${level} level.`,
      type: NotificationType.SKILL_VERIFIED,
      data: { skillName, level },
    });
  }

  async notifyBadgeEarned(userId: string, badgeName: string) {
    return this.createNotification(userId, {
      title: 'New Badge Earned! 🎖️',
      message: `Congratulations! You've earned the "${badgeName}" badge.`,
      type: NotificationType.BADGE_EARNED,
      data: { badgeName },
    });
  }

  async notifyApplicationReceived(companyId: string, applicantName: string, jobTitle: string) {
    return this.createNotification(companyId, {
      title: 'New Application Received',
      message: `${applicantName} has applied for the ${jobTitle} position.`,
      type: NotificationType.APPLICATION_RECEIVED,
      data: { applicantName, jobTitle },
    });
  }
}
