'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function ContactCertificationList({ contactCertifications, onEdit, onDelete, isLoading = false }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy年MM月dd日', { locale: ja });
    } catch (e) {
      console.error('日付フォーマットエラー:', e);
      return dateString;
    }
  };

  // 有効期限の状態をチェック
  const getExpirationStatus = (expirationDate) => {
    if (!expirationDate) return null;
    
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'expired', label: '期限切れ', color: 'bg-red-100 text-red-800' };
    } else if (diffDays <= 30) {
      return { status: 'warning', label: `あと${diffDays}日`, color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'valid', label: '有効', color: 'bg-green-100 text-green-800' };
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-500">資格情報を読み込み中...</p>
        </div>
      ) : contactCertifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-gray-500">この連絡先に付与された資格はありません</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">資格名</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">発行者</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">取得日</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">有効期限</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">アクション</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contactCertifications.map(cert => {
                const expirationStatus = getExpirationStatus(cert.expiration_date);
                
                return (
                  <tr key={cert.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cert.certification_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cert.certification_issuer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(cert.acquisition_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(cert.expiration_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {expirationStatus ? (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${expirationStatus.color}`}>
                          {expirationStatus.label}
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          無期限
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(cert)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            編集
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(cert.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            削除
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}