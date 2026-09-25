import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Clock, 
  ExternalLink, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const NotificationsView: React.FC = () => {
  const {
    state,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
    setActiveTab,
  } = useSimulation();

  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD'>('ALL');

  const filteredNotifs = state.notifications.filter((n) => {
    if (filterType === 'UNREAD') return !n.read;
    return true;
  });

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Notification Center</h1>
            {unreadCount > 0 && (
              <Badge variant="red" size="sm">{unreadCount} UNREAD</Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time alerts for financial reservations, order fills, compliance actions, and market warnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark All Read</span>
            </button>
          )}

          <button
            onClick={clearAllNotifications}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-red-950/40 text-slate-400 hover:text-red-300 text-xs font-semibold border border-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'ALL'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({state.notifications.length})
        </button>
        <button
          onClick={() => setFilterType('UNREAD')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'UNREAD'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        {filteredNotifs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No notifications to display in this view.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredNotifs.map((notif) => {
              const borderStyles: Record<string, string> = {
                success: 'border-l-4 border-l-emerald-500',
                warning: 'border-l-4 border-l-amber-500',
                error: 'border-l-4 border-l-red-500',
                info: 'border-l-4 border-l-blue-500',
              };

              return (
                <div
                  key={notif.id}
                  className={`p-4 transition-colors flex items-start justify-between gap-4 ${
                    !notif.read ? 'bg-slate-800/20' : ''
                  } ${borderStyles[notif.type] || ''}`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 font-mono">
                      <span>{new Date(notif.timestamp).toLocaleString()}</span>
                      {notif.linkTab && (
                        <button
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.linkTab) {
                              setActiveTab(notif.linkTab);
                            }
                          }}
                          className="text-emerald-400 hover:underline flex items-center gap-1 font-sans font-medium"
                        >
                          <span>Open {notif.linkTab.toUpperCase()}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {!notif.read && (
                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800 shrink-0"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
