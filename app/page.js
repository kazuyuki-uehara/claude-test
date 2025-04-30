'use client';

import { useState, useEffect } from 'react';
import ScheduleCard from '../components/ScheduleCard';
import ScheduleForm from '../components/ScheduleForm';
import Modal from '../components/Modal';
import CalendarView from '../components/CalendarView';
import DaySchedule from '../components/DaySchedule';

export default function Home() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  
  // 表示モードのステート（リストまたはカレンダー）
  const [viewMode, setViewMode] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // ログイン状態をデバッグ
  useEffect(() => {
    // 認証状態をチェック
    const checkAuthState = async () => {
      try {
        console.log('認証状態チェック中...');
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include' // クッキーを含める
        });
        
        console.log('認証チェックレスポンスステータス:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('認証済みユーザー:', data.user);
          
          // クッキーの確認
          console.log('現在のクッキー:', document.cookie);
        } else {
          console.log('認証されていない:', response.status);
        }
      } catch (error) {
        console.error('認証チェックエラー:', error);
      }
    };
    
    checkAuthState();
  }, []);

  // スケジュール一覧を取得
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/schedules');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `スケジュールの取得に失敗しました: ${errorData.error || response.statusText}`
        );
      }
      
      const data = await response.json();
      setSchedules(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  // ページ読み込み時にスケジュール取得
  useEffect(() => {
    fetchSchedules();
  }, []);

  // 新規スケジュールフォームを開く
  const handleAddNew = () => {
    setCurrentSchedule(null);
    setIsModalOpen(true);
  };

  // 編集フォームを開く
  const handleEdit = (schedule) => {
    setCurrentSchedule(schedule);
    setIsModalOpen(true);
  };

  // 削除確認ダイアログを開く
  const handleDeleteConfirm = (id) => {
    setScheduleToDelete(id);
    setIsDeleting(true);
  };

  // スケジュール送信（作成 or 更新）
  const handleSubmit = async (formData) => {
    try {
      console.log('Submitting form data:', formData);
      
      if (currentSchedule) {
        // 更新
        const response = await fetch(`/api/schedules/${currentSchedule.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`スケジュールの更新に失敗しました: ${errorData.error || response.statusText}`);
        }
      } else {
        // 新規作成
        console.log('Creating new schedule with data:', formData);
        const response = await fetch('/api/schedules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(`スケジュールの作成に失敗しました: ${errorData.error || response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Created schedule:', result);
      }

      // 成功したらモーダルを閉じ、データを再取得
      setIsModalOpen(false);
      fetchSchedules();
    } catch (err) {
      console.error('Error submitting schedule:', err);
      alert(err.message);
    }
  };

  // スケジュール削除
  const handleDelete = async () => {
    try {
      console.log(`削除するスケジュール ID: ${scheduleToDelete}`);
      
      const response = await fetch(`/api/schedules/${scheduleToDelete}`, {
        method: 'DELETE',
      });

      console.log('削除レスポンスステータス:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('削除エラーレスポンス:', errorData);
        throw new Error(`スケジュールの削除に失敗しました: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      console.log('削除成功:', result);
      
      // 成功したらダイアログを閉じ、データを再取得
      setIsDeleting(false);
      setScheduleToDelete(null);
      fetchSchedules();
    } catch (err) {
      console.error('スケジュール削除エラー:', err);
      alert(err.message);
    }
  };
  
  // 日付が選択された時のハンドラー
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // タブを切り替えるハンドラー
  const switchView = (mode) => {
    setViewMode(mode);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">スケジュール帳</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          新規作成
        </button>
      </header>

      {/* タブ切り替え */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => switchView('list')}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${viewMode === 'list' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            リスト表示
          </button>
          <button
            onClick={() => switchView('calendar')}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${viewMode === 'calendar' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            カレンダー表示
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">スケジュールがありません。「新規作成」ボタンからスケジュールを追加してください。</p>
        </div>
      ) : (
        <div>
          {/* リスト表示 */}
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schedules.map((schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  onEdit={handleEdit}
                  onDelete={handleDeleteConfirm}
                />
              ))}
            </div>
          )}

          {/* カレンダー表示 */}
          {viewMode === 'calendar' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <CalendarView 
                  schedules={schedules} 
                  onDateClick={handleDateSelect} 
                />
              </div>
              <div>
                <DaySchedule 
                  date={selectedDate}
                  schedules={schedules}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* スケジュール作成・編集モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentSchedule ? 'スケジュールを編集' : '新規スケジュール作成'}
      >
        <ScheduleForm
          schedule={currentSchedule}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* 削除確認モーダル */}
      <Modal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        title="スケジュールを削除"
      >
        <div className="p-4">
          <p className="mb-4">このスケジュールを削除してもよろしいですか？</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleting(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              キャンセル
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              削除
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}