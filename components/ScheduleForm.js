'use client';

import { useState, useEffect } from 'react';

export default function ScheduleForm({ schedule, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    creator: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (schedule) {
      // 編集モードの場合は現在のスケジュールデータをフォームに設定
      // 日付と時間を分離して設定
      let startDate = '';
      let startTime = '';
      let endDate = '';
      let endTime = '';
      
      // start_dateの処理
      if (schedule.start_date) {
        // datetime形式 (YYYY-MM-DD HH:MM:SS) の場合
        if (schedule.start_date.includes(' ')) {
          const parts = schedule.start_date.split(' ');
          startDate = parts[0]; // 日付部分
          startTime = parts[1].substring(0, 5); // 時間部分 (HH:MM)
        } 
        // ISO形式 (YYYY-MM-DDT...) の場合
        else if (schedule.start_date.includes('T')) {
          const parts = schedule.start_date.split('T');
          startDate = parts[0];
          if (parts[1]) {
            startTime = parts[1].substring(0, 5); // 時間部分 (HH:MM)
          }
        }
        // 日付のみの場合
        else {
          startDate = schedule.start_date;
        }
      }
      
      // end_dateの処理
      if (schedule.end_date) {
        // datetime形式 (YYYY-MM-DD HH:MM:SS) の場合
        if (schedule.end_date.includes(' ')) {
          const parts = schedule.end_date.split(' ');
          endDate = parts[0]; // 日付部分
          endTime = parts[1].substring(0, 5); // 時間部分 (HH:MM)
        } 
        // ISO形式 (YYYY-MM-DDT...) の場合
        else if (schedule.end_date.includes('T')) {
          const parts = schedule.end_date.split('T');
          endDate = parts[0];
          if (parts[1]) {
            endTime = parts[1].substring(0, 5); // 時間部分 (HH:MM)
          }
        }
        // 日付のみの場合
        else {
          endDate = schedule.end_date;
        }
      }
      
      setFormData({
        title: schedule.title || '',
        description: schedule.description || '',
        start_date: startDate,
        start_time: startTime,
        end_date: endDate,
        end_time: endTime,
        creator: schedule.creator || ''
      });
      
      console.log('フォーム初期値設定:', { 
        original_start: schedule.start_date,
        parsed_start_date: startDate,
        parsed_start_time: startTime,
        original_end: schedule.end_date,
        parsed_end_date: endDate,
        parsed_end_time: endTime
      });
    }
  }, [schedule]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // エラーをクリア
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = '開始日は必須です';
    }
    
    if (formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      newErrors.end_date = '終了日は開始日より後である必要があります';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // 日付と時間を結合して保存
      const formattedData = {
        ...formData,
        // 日付と時間の両方がある場合は結合し、時間がない場合は日付のみ
        start_date: formData.start_date ? 
          (formData.start_time ? `${formData.start_date} ${formData.start_time}` : formData.start_date) : null,
        end_date: formData.end_date ? 
          (formData.end_time ? `${formData.end_date} ${formData.end_time}` : formData.end_date) : null,
        // フォームデータからstart_timeとend_timeを除外
        start_time: undefined,
        end_time: undefined
      };
      
      console.log('Submitting formatted data:', formattedData);
      onSubmit(formattedData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          タイトル*
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          } p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          説明
        </label>
        <textarea
          id="description"
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
          開始日*
        </label>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.start_date ? 'border-red-500' : 'border-gray-300'
            } p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
          />
          <input
            type="time"
            id="start_time"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
      </div>

      <div>
        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
          終了日
        </label>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.end_date ? 'border-red-500' : 'border-gray-300'
            } p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
          />
          <input
            type="time"
            id="end_time"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
      </div>

      <div>
        <label htmlFor="creator" className="block text-sm font-medium text-gray-700">
          作成者
        </label>
        <input
          type="text"
          id="creator"
          name="creator"
          value={formData.creator}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {schedule ? '更新' : '作成'}
        </button>
      </div>
    </form>
  );
}