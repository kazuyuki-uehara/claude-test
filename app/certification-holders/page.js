'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CertificationHolders() {
  const [certificationHolders, setCertificationHolders] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [selectedCertification, setSelectedCertification] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 資格情報とその保有者を取得
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 資格マスターデータを取得
      const certResponse = await fetch('/api/certifications');
      if (!certResponse.ok) {
        throw new Error('資格情報の取得に失敗しました');
      }
      const certData = await certResponse.json();
      setCertifications(certData);
      
      // 資格保有者情報を取得
      let url = '/api/certifications/holders';
      if (selectedCertification) {
        url += `?certification_id=${selectedCertification}`;
      }
      
      const holdersResponse = await fetch(url);
      if (!holdersResponse.ok) {
        throw new Error('資格保有者情報の取得に失敗しました');
      }
      const holdersData = await holdersResponse.json();
      setCertificationHolders(holdersData);
      
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
  }, [selectedCertification]);

  // 資格フィルターの変更ハンドラー
  const handleCertificationChange = (e) => {
    setSelectedCertification(e.target.value);
  };

  // 日付をフォーマット
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  // 有効期限の状態に基づいてバッジの色を決定
  const getStatusBadgeClass = (status, expirationDate) => {
    if (status === 'revoked') return 'bg-red-100 text-red-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    
    if (expirationDate) {
      const now = new Date();
      const expDate = new Date(expirationDate);
      
      // 期限切れ
      if (expDate < now) return 'bg-red-100 text-red-800';
      
      // 期限が30日以内
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      if (expDate <= thirtyDaysFromNow) return 'bg-yellow-100 text-yellow-800';
    }
    
    return 'bg-green-100 text-green-800';
  };

  // ステータスのラベルを取得
  const getStatusLabel = (status, expirationDate) => {
    if (status === 'revoked') return '取消';
    if (status === 'pending') return '申請中';
    
    if (expirationDate) {
      const now = new Date();
      const expDate = new Date(expirationDate);
      
      if (expDate < now) return '期限切れ';
      
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      if (expDate <= thirtyDaysFromNow) return '期限間近';
    }
    
    return '有効';
  };

  // 資格ごとにグループ化されたデータを作成
  const groupedByCertification = certificationHolders.reduce((acc, holder) => {
    const certId = holder.certification_id;
    if (!acc[certId]) {
      acc[certId] = {
        id: certId,
        name: holder.certification_name,
        organization: holder.issuing_organization,
        holders: []
      };
    }
    acc[certId].holders.push(holder);
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">資格保有者一覧</h1>
        <div className="flex space-x-2">
          <Link
            href="/contacts"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
          >
            アドレス帳
          </Link>
          <Link
            href="/certifications"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            資格管理
          </Link>
        </div>
      </header>

      {/* 資格フィルター */}
      <div className="mb-6">
        <label htmlFor="certification-filter" className="block text-sm font-medium text-gray-700 mb-1">
          資格で絞り込み
        </label>
        <select
          id="certification-filter"
          value={selectedCertification}
          onChange={handleCertificationChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">全ての資格</option>
          {certifications.map((cert) => (
            <option key={cert.id} value={cert.id}>
              {cert.name} {cert.issuing_organization && `(${cert.issuing_organization})`}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      ) : certificationHolders.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            {selectedCertification ? '選択した資格の保有者はいません。' : '資格を保有している従業員はいません。'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedByCertification).map((certGroup) => (
            <div key={certGroup.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="text-lg font-medium">
                  {certGroup.name}
                  {certGroup.organization && ` (${certGroup.organization})`} - 
                  <span className="text-gray-500 text-sm">
                    保有者: {certGroup.holders.length}名
                  </span>
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        名前
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        部署・役職
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        取得日
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        有効期限
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状態
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {certGroup.holders.map((holder) => (
                      <tr key={holder.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link 
                            href={`/contacts/${holder.contact_id}`}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            {holder.contact_name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {holder.department ? holder.department : ''}
                            {holder.department && holder.position ? ' - ' : ''}
                            {holder.position ? holder.position : ''}
                            {!holder.department && !holder.position && '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(holder.issue_date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(holder.expiration_date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(holder.status, holder.expiration_date)}`}>
                            {getStatusLabel(holder.status, holder.expiration_date)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}