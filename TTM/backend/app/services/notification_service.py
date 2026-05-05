from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.models.user import User
from typing import List, Optional


class NotificationService:
    @staticmethod
    def create_notification(db: Session, user_id: int, message: str) -> Notification:
        """Create a new notification"""
        notification = Notification(user_id=user_id, message=message)
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def get_user_notifications(db: Session, user_id: int) -> List[Notification]:
        """Get all notifications for a user"""
        return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

    @staticmethod
    def get_unread_notifications(db: Session, user_id: int) -> List[Notification]:
        """Get unread notifications for a user"""
        return db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).order_by(Notification.created_at.desc()).all()

    @staticmethod
    def mark_as_read(db: Session, notification_id: int) -> Notification:
        """Mark notification as read"""
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if notification:
            notification.is_read = True
            db.commit()
            db.refresh(notification)
        return notification

    @staticmethod
    def mark_all_as_read(db: Session, user_id: int) -> None:
        """Mark all notifications as read for a user"""
        db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True})
        db.commit()

    @staticmethod
    def delete_notification(db: Session, notification_id: int) -> None:
        """Delete a notification"""
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if notification:
            db.delete(notification)
            db.commit()
