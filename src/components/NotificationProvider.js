'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { Bell, X, Video, Calendar, CheckCircle } from 'lucide-react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export default function NotificationProvider({ children, userId, userRole }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
    
    // Auto-remove after 5 seconds for non-persistent notifications
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Simulate real-time notifications
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      // Check for appointment reminders
      const now = new Date();
      const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000);
      
      // Mock appointment check - replace with real API call
      if (Math.random() < 0.1) { // 10% chance every interval
        addNotification({
          type: 'appointment_reminder',
          title: 'Upcoming Appointment',
          message: 'Your appointment is in 15 minutes',
          icon: Calendar,
          color: 'blue',
          persistent: true
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'meeting_started': return Video;
      case 'appointment_reminder': return Calendar;
      case 'meeting_ended': return CheckCircle;
      default: return Bell;
    }
  };

  const getColor = (color) => {
    switch (color) {
      case 'green': return 'text-green-600 bg-green-100';
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'red': return 'text-red-600 bg-red-100';
      case 'yellow': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification, markAsRead }}>
      {children}
      
      {/* Notification Bell */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
        >
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map(notification => {
                  const Icon = getIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getColor(notification.color)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </NotificationContext.Provider>
  );
}