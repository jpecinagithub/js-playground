import { useState, useMemo } from 'react';
import type { Snippet } from '../types';
import { CATEGORIES } from '../lib/storage';
import './SnippetSidebar.css';

interface SnippetSidebarProps {
  snippets: Snippet[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onNew: () => void;
  isOpen: boolean;
  onClose: () => void;
  showOverlay?: boolean;
}

interface GroupedSnippets {
  [categoryId: string]: {
    [topicId: string]: Snippet[];
  };
}

export function SnippetSidebar({
  snippets,
  currentId,
  onSelect,
  onEdit,
  onNew,
  isOpen,
  onClose,
  showOverlay = true,
}: SnippetSidebarProps) {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const groupedSnippets = useMemo(() => {
    const grouped: GroupedSnippets = {};
    
    snippets.forEach(snippet => {
      const categoryId = snippet.category || 'uncategorized';
      const topicId = snippet.topic || 'other';
      
      if (!grouped[categoryId]) {
        grouped[categoryId] = {};
      }
      if (!grouped[categoryId][topicId]) {
        grouped[categoryId][topicId] = [];
      }
      grouped[categoryId][topicId].push(snippet);
    });
    
    Object.keys(grouped).forEach(cat => {
      Object.keys(grouped[cat]).forEach(topic => {
        grouped[cat][topic].sort((a, b) => a.name.localeCompare(b.name));
      });
    });
    
    return grouped;
  }, [snippets]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return CATEGORIES;
    
    const searchLower = search.toLowerCase();
    return CATEGORIES.map(category => {
      const matchingTopics = category.topics.filter(topic => {
        const topicSnippets = groupedSnippets[category.id]?.[topic.id] || [];
        return topicSnippets.some(s => s.name.toLowerCase().includes(searchLower));
      });
      
      if (matchingTopics.length === 0) {
        const uncategorized = groupedSnippets[category.id]?.['other'] || [];
        if (uncategorized.some(s => s.name.toLowerCase().includes(searchLower))) {
          return {
            ...category,
            topics: [...category.topics, { id: 'other', name: 'Otros' }]
          };
        }
        return null;
      }
      
      return { ...category, topics: matchingTopics };
    }).filter(Boolean) as typeof CATEGORIES;
  }, [CATEGORIES, search, groupedSnippets]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const getCategoryCount = (categoryId: string) => {
    const categorySnippets = groupedSnippets[categoryId];
    if (!categorySnippets) return 0;
    return Object.values(categorySnippets).flat().length;
  };

  return (
    <>
      {isOpen && showOverlay && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Snippets</h2>
          {showOverlay && (
            <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
              ✕
            </button>
          )}
        </div>
        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search snippets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="new-snippet-btn" onClick={onNew}>
          + New Snippet
        </button>
        <div className="snippet-list accordion-list">
          {filteredCategories.map(category => {
            const categorySnippets = groupedSnippets[category.id] || {};
            const count = getCategoryCount(category.id);
            const isExpanded = expandedCategories.has(category.id);
            
            if (count === 0) return null;
            
            return (
              <div key={category.id} className="accordion-category">
                <div 
                  className={`accordion-header ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <span className="accordion-arrow">{isExpanded ? '▼' : '▶'}</span>
                  <span className="accordion-title">{category.name}</span>
                  <span className="accordion-count">({count})</span>
                </div>
                
                {isExpanded && (
                  <div className="accordion-content">
                    {category.topics.map(topic => {
                      const topicSnippets = categorySnippets[topic.id] || [];
                      const topicIsExpanded = expandedTopics.has(`${category.id}-${topic.id}`);
                      
                      if (topicSnippets.length === 0) {
                        const uncategorized = categorySnippets['other'] || [];
                        if (topic.id !== 'other' || uncategorized.length === 0) return null;
                      }
                      
                      return (
                        <div key={topic.id} className="accordion-topic">
                          <div 
                            className={`topic-header ${topicIsExpanded ? 'expanded' : ''}`}
                            onClick={() => toggleTopic(`${category.id}-${topic.id}`)}
                          >
                            <span className="accordion-arrow">{topicIsExpanded ? '▼' : '▶'}</span>
                            <span className="topic-name">{topic.name}</span>
                            <span className="accordion-count">({topicSnippets.length})</span>
                          </div>
                          
                          {topicIsExpanded && (
                            <div className="topic-content">
                              {topicSnippets.map((snippet, idx) => (
                                <div
                                  key={snippet.id}
                                  className={`snippet-item ${snippet.id === currentId ? 'active' : ''}`}
                                  onClick={() => onSelect(snippet.id)}
                                >
                                  <div className="snippet-info">
                                    <span className="snippet-name">{idx + 1}. {snippet.name}</span>
                                  </div>
                                  <div className="snippet-actions">
                                    <button
                                      className="btn-edit"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(snippet.id);
                                      }}
                                      aria-label="Edit snippet"
                                      title="Edit"
                                    >
                                      ✎
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {topicSnippets.length === 0 && (
                                <div className="snippet-empty">No snippets</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
