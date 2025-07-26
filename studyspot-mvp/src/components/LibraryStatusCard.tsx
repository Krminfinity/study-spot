import React, { useState, useEffect } from 'react';
import { LibraryStatus, LibraryCalendarEvent, checkLibraryStatus, getLibraryCalendar } from '../services/libraryService';

interface LibraryStatusCardProps {
  libraryId: string;
  libraryName: string;
  onStatusUpdate?: (status: LibraryStatus) => void;
}

const LibraryStatusCard: React.FC<LibraryStatusCardProps> = ({ 
  libraryId, 
  libraryName, 
  onStatusUpdate 
}) => {
  const [status, setStatus] = useState<LibraryStatus | null>(null);
  const [events, setEvents] = useState<LibraryCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    loadLibraryStatus();
    loadCalendarEvents();
  }, [libraryId]);

  const loadLibraryStatus = async () => {
    try {
      setLoading(true);
      const libraryStatus = await checkLibraryStatus(libraryId);
      setStatus(libraryStatus);
      onStatusUpdate?.(libraryStatus);
    } catch (error) {
      console.error('図書館ステータス取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCalendarEvents = async () => {
    try {
      const calendarEvents = await getLibraryCalendar(libraryId);
      setEvents(calendarEvents);
    } catch (error) {
      console.error('カレンダー情報取得エラー:', error);
    }
  };

  const getStatusColor = (isOpen: boolean) => {
    return isOpen ? '#00C851' : '#FF3547';
  };

  const getStatusText = (isOpen: boolean) => {
    return isOpen ? '開館中' : '休館中';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { 
      month: 'numeric', 
      day: 'numeric', 
      weekday: 'short' 
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'closed': return '🚫';
      case 'special_hours': return '⏰';
      case 'event': return '📅';
      default: return '📍';
    }
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        margin: '8px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span>営業状況を確認中...</span>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      margin: '8px 0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          📚 {libraryName}
        </h3>
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          style={{
            background: 'none',
            border: '1px solid #007AFF',
            borderRadius: '4px',
            color: '#007AFF',
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          {showCalendar ? 'カレンダー閉じる' : 'カレンダー表示'}
        </button>
      </div>

      {/* 営業状況 */}
      {status && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              color: getStatusColor(status.isOpen),
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              ● {getStatusText(status.isOpen)}
            </span>
            <span style={{ fontSize: '14px', color: '#666' }}>
              {status.todayHours}
            </span>
          </div>
          
          {status.specialNotice && (
            <div style={{
              backgroundColor: '#FFF3CD',
              border: '1px solid #FFEAA7',
              borderRadius: '4px',
              padding: '8px',
              fontSize: '13px',
              color: '#856404'
            }}>
              ⚠️ {status.specialNotice}
            </div>
          )}

          <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
            最終更新: {status.lastUpdated.toLocaleTimeString('ja-JP', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      )}

      {/* カレンダーイベント */}
      {showCalendar && events.length > 0 && (
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          padding: '12px',
          marginTop: '12px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
            今後の予定・休館日
          </h4>
          {events.map((event, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 0',
              borderBottom: index < events.length - 1 ? '1px solid #eee' : 'none'
            }}>
              <span style={{ fontSize: '16px' }}>
                {getEventIcon(event.type)}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '500' }}>
                  {formatDate(event.date)} - {event.description}
                </div>
                {event.specialHours && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    特別営業時間: {event.specialHours}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 更新ボタン */}
      <div style={{ marginTop: '12px', textAlign: 'right' }}>
        <button
          onClick={loadLibraryStatus}
          style={{
            backgroundColor: '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          状況を更新
        </button>
      </div>
    </div>
  );
};

export default LibraryStatusCard;
