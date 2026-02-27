import { useState, useEffect } from 'react';
import { CATEGORIES } from '../lib/storage';
import './SnippetModal.css';

interface SnippetModalProps {
  isOpen: boolean;
  mode: 'new' | 'save' | 'edit';
  initialName?: string;
  initialCode?: string;
  initialCategory?: string;
  initialTopic?: string;
  onClose: () => void;
  onSave: (name: string, code: string, category?: string, topic?: string) => void;
}

export function SnippetModal({ 
  isOpen, 
  mode, 
  initialName = '', 
  initialCode = '',
  initialCategory = '',
  initialTopic = '',
  onClose, 
  onSave 
}: SnippetModalProps) {
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState(initialCode);
  const [category, setCategory] = useState(initialCategory);
  const [topic, setTopic] = useState(initialTopic);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setCode(initialCode);
      setCategory(initialCategory || CATEGORIES[0]?.id || '');
      setTopic(initialTopic || CATEGORIES[0]?.topics[0]?.id || '');
    }
  }, [isOpen, initialName, initialCode, initialCategory, initialTopic]);

  const currentCategory = CATEGORIES.find(c => c.id === category);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), code, category, topic);
      setName('');
      setCode('');
      setCategory(CATEGORIES[0]?.id || '');
      setTopic(CATEGORIES[0]?.topics[0]?.id || '');
      onClose();
    }
  };

  const title = mode === 'edit' ? 'Edit Snippet' : 'New Snippet';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="snippet-name">Name</label>
            <input
              id="snippet-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="My snippet"
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="snippet-category">Category</label>
            <select
              id="snippet-category"
              value={category}
              onChange={e => {
                setCategory(e.target.value);
                const cat = CATEGORIES.find(c => c.id === e.target.value);
                if (cat && cat.topics.length > 0) {
                  setTopic(cat.topics[0].id);
                }
              }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="snippet-topic">Topic</label>
            <select
              id="snippet-topic"
              value={topic}
              onChange={e => setTopic(e.target.value)}
            >
              {currentCategory?.topics.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="snippet-code">Code</label>
            <textarea
              id="snippet-code"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="// Your code here..."
              rows={8}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={!name.trim()}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
