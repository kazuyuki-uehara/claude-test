'use client';

import { useState, useEffect } from 'react';

export default function ContactCertificationForm({ contactCertification, certifications, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    certification_id: '',
    acquisition_date: '',
    expiration_date: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // 編集モードの場合は現在のデータをフォームに設定
  useEffect(() => {
    if (contactCertification) {
      setFormData({
        certification_id: contactCertification.certification_id || '',
        acquisition_date: contactCertification.acquisition_date || '',
        expiration_date: contactCertification.expiration_date || '',
        notes: contactCertification.notes || ''
      });
    }
  }, [contactCertification]);

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
    
    if (!formData.certification_id) {
      newErrors.certification_id = '資格を選択してください';
    }
    
    if (!formData.acquisition_date) {
      newErrors.acquisition_date = '取得日は必須です';
    }
    
    if (formData.expiration_date && new Date(formData.expiration_date) < new Date(formData.acquisition_date)) {
      newErrors.expiration_date = '有効期限は取得日より後である必要があります';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label htmlFor="certification_id" className="block text-sm font-medium text-gray-700">
          資格*
        </label>
        <select
          id="certification_id"
          name="certification_id"
          value={formData.certification_id}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.certification_id ? 'border-red-500' : 'border-gray-300'
          } p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
        >
          <option value="">選択してください</option>
          {certifications.map(cert => (
            <option key={cert.id} value={cert.id}>
              {cert.name} (発行者: {cert.issuer})
            </option>
          ))}
        </select>
        {errors.certification_id && (
          <p className="mt-1 text-sm text-red-600">{errors.certification_id}</p>
        )}
      </div>

      <div>
        <label htmlFor="acquisition_date" className="block text-sm font-medium text-gray-700">
          取得日*
        </label>
        <input
          type="date"
          id="acquisition_date"
          name="acquisition_date"
          value={formData.acquisition_date}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.acquisition_date ? 'border-red-500' : 'border-gray-300'
          } p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
        />
        {errors.acquisition_date && (
          <p className="mt-1 text-sm text-red-600">{errors.acquisition_date}</p>
        )}
      </div>

      <div>
        <label htmlFor="expiration_date" className="block text-sm font-medium text-gray-700">
          有効期限
        </label>
        <input
          type="date"
          id="expiration_date"
          name="expiration_date"
          value={formData.expiration_date}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.expiration_date ? 'border-red-500' : 'border-gray-300'
          } p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
        />
        {errors.expiration_date && (
          <p className="mt-1 text-sm text-red-600">{errors.expiration_date}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          メモ
        </label>
        <textarea
          id="notes"
          name="notes"
          rows="3"
          value={formData.notes}
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
          {contactCertification ? '更新' : '付与'}
        </button>
      </div>
    </form>
  );
}