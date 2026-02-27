import { describe, it, expect, beforeEach } from 'vitest';
import { 
  CATEGORIES, 
  getSnippets, 
  saveSnippet, 
  updateSnippet, 
  deleteSnippet,
  getCurrentCode,
  setCurrentCode,
  getTheme,
  setTheme
} from '../lib/storage';

describe('CATEGORIES', () => {
  it('should have 11 categories (including Nivel 0)', () => {
    expect(CATEGORIES.length).toBe(11);
  });

  it('first category should be Nivel 0 - Personal', () => {
    expect(CATEGORIES[0].id).toBe('mis-snippets');
    expect(CATEGORIES[0].name).toBe('Nivel 0 — Personal');
  });

  it('each category should have 4 topics', () => {
    CATEGORIES.forEach(cat => {
      expect(cat.topics.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should have unique category IDs', () => {
    const ids = CATEGORIES.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('Storage - Snippets', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('js-playground-initialized-v6', 'true');
  });

  it('should return empty array initially', () => {
    const snippets = getSnippets();
    expect(snippets).toEqual([]);
  });

  it('should save a new snippet', () => {
    const snippet = saveSnippet({
      name: 'Test Snippet',
      code: 'console.log("test")',
      category: 'mis-snippets',
      topic: 'mis-snippets'
    });

    expect(snippet.id).toBeDefined();
    expect(snippet.name).toBe('Test Snippet');
    expect(snippet.code).toBe('console.log("test")');
    expect(snippet.category).toBe('mis-snippets');
    expect(snippet.createdAt).toBeDefined();
    expect(snippet.updatedAt).toBeDefined();
  });

  it('should retrieve saved snippets', () => {
    saveSnippet({
      name: 'Snippet 1',
      code: 'code1',
      category: 'mis-snippets',
      topic: 'mis-snippets'
    });

    const snippets = getSnippets();
    expect(snippets.length).toBe(1);
    expect(snippets[0].name).toBe('Snippet 1');
  });

  it('should update an existing snippet', () => {
    const saved = saveSnippet({
      name: 'Original',
      code: 'original code',
      category: 'mis-snippets',
      topic: 'mis-snippets'
    });

    const updated = updateSnippet(saved.id, {
      name: 'Updated',
      code: 'updated code'
    });

    expect(updated).not.toBeNull();
    expect(updated?.name).toBe('Updated');
    expect(updated?.code).toBe('updated code');
  });

  it('should delete a snippet', () => {
    const saved = saveSnippet({
      name: 'To Delete',
      code: 'code',
      category: 'mis-snippets',
      topic: 'mis-snippets'
    });

    const result = deleteSnippet(saved.id);
    expect(result).toBe(true);

    const snippets = getSnippets();
    expect(snippets.length).toBe(0);
  });

  it('should return false when deleting non-existent snippet', () => {
    const result = deleteSnippet('non-existent-id');
    expect(result).toBe(false);
  });
});

describe('Storage - Current Code', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return default code when nothing saved', () => {
    const code = getCurrentCode();
    expect(code).toContain('Welcome to JS Playground');
  });

  it('should save and retrieve current code', () => {
    setCurrentCode('console.log("test")');
    const code = getCurrentCode();
    expect(code).toBe('console.log("test")');
  });
});

describe('Storage - Theme', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return dark as default theme', () => {
    const theme = getTheme();
    expect(theme).toBe('dark');
  });

  it('should save and retrieve theme', () => {
    setTheme('light');
    expect(getTheme()).toBe('light');
    
    setTheme('dark');
    expect(getTheme()).toBe('dark');
  });
});
