'use client';

import { useState, useEffect } from 'react';
import { format, isToday, isThisWeek, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function RoomSchedule({ room, schedules, onBookRoom }) {
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [weekSchedules, setWeekSchedules] = useState([]);

  useEffect(() => {
    if (!schedules || schedules.length === 0) {
      setTodaySchedules([]);
      setWeekSchedules([]);
      return;
    }

    // 今日の予定をフィルタリング
    const today = schedules.filter(schedule => {
      try {
        const startDate = parseISO(schedule.start_date);
        return isToday(startDate);
      } catch (e) {
        return false;
      }
    }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    // 今週の予定をフィルタリング、今日を除く
    const week = schedules.filter(schedule => {
      try {
        const startDate = parseISO(schedule.start_date);
        return isThisWeek(startDate) && !isToday(startDate);
      } catch (e) {
        return false;
      }
    }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    setTodaySchedules(today);
    setWeekSchedules(week);
  }, [schedules]);

  // 日付と時間をフォーマット
  const formatDateTime = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'M月d日(E) HH:mm', { locale: ja });
    } catch (e) {
      console.error('日付フォーマットエラー:', e);
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{room.name}</h2>
        {onBookRoom && (
          <button
            onClick={() => onBookRoom(room)}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            予約する
          </button>
        )}
      </div>
      
      <div className="flex-grow">
        <div className="mb-4">
          <h3 className="text-md font-medium text-gray-700 mb-2">今日の予定</h3>
          {todaySchedules.length === 0 ? (
            <p className="text-sm text-gray-500 italic">予定なし</p>
          ) : (
            <ul className="space-y-2">
              {todaySchedules.map(schedule => (
                <li key={schedule.id} className="text-sm border-l-2 border-blue-500 pl-2 py-1">
                  <div className="font-medium">{formatDateTime(schedule.start_date)} - {schedule.end_date ? formatDateTime(schedule.end_date).split(' ')[1] : '終日'}</div>
                  <div>{schedule.title}</div>
                  {schedule.creator && <div className="text-xs text-gray-500">予約者: {schedule.creator}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-2">今週の予定</h3>
          {weekSchedules.length === 0 ? (
            <p className="text-sm text-gray-500 italic">予定なし</p>
          ) : (
            <ul className="space-y-2">
              {weekSchedules.map(schedule => (
                <li key={schedule.id} className="text-sm border-l-2 border-green-500 pl-2 py-1">
                  <div className="font-medium">{formatDateTime(schedule.start_date)} - {schedule.end_date ? formatDateTime(schedule.end_date).split(' ')[1] : '終日'}</div>
                  <div>{schedule.title}</div>
                  {schedule.creator && <div className="text-xs text-gray-500">予約者: {schedule.creator}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-2 border-t border-gray-200 text-sm text-gray-600">
        <div>定員: {room.capacity}名</div>
        {room.features && room.features.length > 0 && (
          <div className="mt-1">
            設備: {room.features.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}