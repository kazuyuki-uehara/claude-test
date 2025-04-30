'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function ScheduleCard({ schedule, onEdit, onDelete }) {
  // 日付のフォーマット
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      // DateTimeフォーマット (YYYY-MM-DD HH:MM:SS) から日本語表示へ
      if (dateString.includes(' ')) {
        return format(new Date(dateString), 'yyyy年MM月dd日 HH:mm', { locale: ja });
      }
      // ISO形式 (YYYY-MM-DDT...)から日本語表示へ
      else if (dateString.includes('T')) {
        return format(new Date(dateString), 'yyyy年MM月dd日 HH:mm', { locale: ja });
      }
      // 日付のみの場合
      else {
        return format(new Date(dateString), 'yyyy年MM月dd日', { locale: ja });
      }
    } catch (e) {
      console.error('日付フォーマットエラー:', e, dateString);
      return dateString; // エラーの場合は元の文字列をそのまま返す
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900">{schedule.title}</h3>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(schedule)}
              className="text-blue-600 hover:text-blue-800"
            >
              編集
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(schedule.id)}
              className="text-red-600 hover:text-red-800"
            >
              削除
            </button>
          )}
        </div>
      </div>
      
      {schedule.description && (
        <p className="mt-2 text-sm text-gray-600">{schedule.description}</p>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        <div>
          <span className="font-medium">開始:</span> {formatDate(schedule.start_date)}
        </div>
        {schedule.end_date && (
          <div>
            <span className="font-medium">終了:</span> {formatDate(schedule.end_date)}
          </div>
        )}
        {schedule.creator && (
          <div className="mt-1">
            <span className="font-medium">作成者:</span> {schedule.creator}
          </div>
        )}
      </div>
    </div>
  );
}