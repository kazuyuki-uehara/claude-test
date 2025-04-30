'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ContactCard from '../../components/ContactCard';
import ContactForm from '../../components/ContactForm';
import Modal from '../../components/Modal';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');

  // 連絡先一覧を取得
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contacts');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `連絡先の取得に失敗しました: ${errorData.error || response.statusText}`
        );
      }
      
      const data = await response.json();
      setContacts(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  // ページ読み込み時に連絡先取得
  useEffect(() => {
    fetchContacts();
  }, []);

  // 新規連絡先フォームを開く
  const handleAddNew = () => {
    setCurrentContact(null);
    setIsModalOpen(true);
  };

  // 編集フォームを開く
  const handleEdit = (contact) => {
    setCurrentContact(contact);
    setIsModalOpen(true);
  };

  // 削除確認ダイアログを開く
  const handleDeleteConfirm = (id) => {
    setContactToDelete(id);
    setIsDeleting(true);
  };

  // 連絡先送信（作成 or 更新）
  const handleSubmit = async (formData) => {
    try {
      if (currentContact) {
        // 更新
        const response = await fetch(`/api/contacts/${currentContact.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`連絡先の更新に失敗しました: ${errorData.error || response.statusText}`);
        }
      } else {
        // 新規作成
        const response = await fetch('/api/contacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`連絡先の作成に失敗しました: ${errorData.error || response.statusText}`);
        }
      }

      // 成功したらモーダルを閉じ、データを再取得
      setIsModalOpen(false);
      fetchContacts();
    } catch (err) {
      console.error('Error submitting contact:', err);
      alert(err.message);
    }
  };

  // 連絡先削除
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/contacts/${contactToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`連絡先の削除に失敗しました: ${errorData.error || response.statusText}`);
      }

      // 成功したらダイアログを閉じ、データを再取得
      setIsDeleting(false);
      setContactToDelete(null);
      fetchContacts();
    } catch (err) {
      console.error('Error deleting contact:', err);
      alert(err.message);
    }
  };

  // 検索クエリに基づいたフィルタリング
  const filteredContacts = contacts.filter(contact => {
    const query = searchQuery.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.phone?.toLowerCase().includes(query) ||
      contact.address?.toLowerCase().includes(query) ||
      contact.notes?.toLowerCase().includes(query) ||
      contact.hire_date?.toLowerCase().includes(query) ||
      contact.termination_date?.toLowerCase().includes(query) ||
      contact.department?.toLowerCase().includes(query) ||
      contact.position?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">アドレス帳</h1>
        <div className="flex space-x-2">
          <Link
            href="/certification-holders"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
          >
            資格保有者一覧
          </Link>
          <Link
            href="/certifications"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            資格管理
          </Link>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            新規登録
          </button>
        </div>
      </header>

      {/* 検索フォーム */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="名前、メール、電話番号、入社日、退社日などで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          {searchQuery ? (
            <p className="text-gray-600">「{searchQuery}」に一致する連絡先はありません。</p>
          ) : (
            <p className="text-gray-600">連絡先がありません。「新規登録」ボタンから連絡先を追加してください。</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={handleEdit}
              onDelete={handleDeleteConfirm}
            />
          ))}
        </div>
      )}

      {/* 連絡先作成・編集モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentContact ? '連絡先を編集' : '新規連絡先登録'}
      >
        <ContactForm
          contact={currentContact}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* 削除確認モーダル */}
      <Modal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        title="連絡先を削除"
      >
        <div className="p-4">
          <p className="mb-4">この連絡先を削除してもよろしいですか？</p>
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