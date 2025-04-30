'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RoomSchedule from '../../components/RoomSchedule';
import Modal from '../../components/Modal';
import ScheduleForm from '../../components/ScheduleForm';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);

  // 会議室とスケジュール情報を取得
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 会議室情報を取得
      const roomsResponse = await fetch('/api/rooms');
      if (!roomsResponse.ok) {
        throw new Error('会議室情報の取得に失敗しました');
      }
      const roomsData = await roomsResponse.json();
      setRooms(roomsData);
      
      // 会議室スケジュールを取得
      const schedulesResponse = await fetch('/api/rooms/schedules');
      if (!schedulesResponse.ok) {
        throw new Error('会議室スケジュールの取得に失敗しました');
      }
      const schedulesData = await schedulesResponse.json();
      setSchedules(schedulesData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ページ読み込み時にデータ取得
  useEffect(() => {
    fetchData();
  }, []);

  // 会議室予約フォームを開く
  const handleBookRoom = (room) => {
    setCurrentRoom(room);
    setIsModalOpen(true);
  };

  // 会議室スケジュール送信
  const handleSubmit = async (formData) => {
    try {
      // 会議室IDを追加
      const scheduleData = {
        ...formData,
        room_id: currentRoom.id,
        type: 'room'
      };
      
      const response = await fetch('/api/rooms/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`会議室予約に失敗しました: ${errorData.error || response.statusText}`);
      }

      // 成功したらモーダルを閉じ、データを再取得
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error submitting schedule:', err);
      alert(err.message);
    }
  };

  // 会議室ごとのスケジュールをフィルタリング
  const getRoomSchedules = (roomId) => {
    return schedules.filter(schedule => schedule.room_id === roomId);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">会議室予約</h1>
        <Link
          href="/"
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
        >
          スケジュール帳に戻る
        </Link>
      </header>

      {loading ? (
        <div className="flex justify-center p-8">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">会議室情報がありません。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <RoomSchedule
              key={room.id}
              room={room}
              schedules={getRoomSchedules(room.id)}
              onBookRoom={handleBookRoom}
            />
          ))}
        </div>
      )}

      {/* 会議室予約モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentRoom ? `${currentRoom.name} 予約` : '会議室予約'}
      >
        {currentRoom && (
          <div>
            <div className="mb-4 text-sm text-gray-600">
              <p>定員: {currentRoom.capacity}名</p>
              {currentRoom.features && currentRoom.features.length > 0 && (
                <p>設備: {currentRoom.features.join(', ')}</p>
              )}
            </div>
            <ScheduleForm
              schedule={null}
              onSubmit={handleSubmit}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}