'use client';

import { useState, useEffect } from 'react';
import CertificationList from '../../components/CertificationList';
import Link from 'next/link';

export default function Certifications() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 資格情報を取得
  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/certifications');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `資格情報の取得に失敗しました: ${errorData.error || response.statusText}`
        );
      }
      
      const data = await response.json();
      setCertifications(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching certifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // ページ読み込み時に資格情報を取得
  useEffect(() => {
    fetchCertifications();
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">資格管理</h1>
        <div className="flex space-x-2">
          <Link
            href="/certification-holders"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            資格保有者一覧
          </Link>
          <Link
            href="/contacts"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
          >
            アドレス帳に戻る
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center p-8">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      ) : (
        <CertificationList
          certifications={certifications}
          onUpdate={fetchCertifications}
        />
      )}
    </div>
  );
}