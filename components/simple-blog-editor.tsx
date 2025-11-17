'use client';

import { useState } from 'react';

interface SimpleBlogEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface ContentBlock {
  id: string;
  type: 'text' | 'heading' | 'image';
  content: string;
}

export function SimpleBlogEditor({ value, onChange, placeholder }: SimpleBlogEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => {
    if (value && value.trim()) {
      // Parse existing HTML content into blocks
      const parser = new DOMParser();
      const doc = parser.parseFromString(value, 'text/html');
      const elements = Array.from(doc.body.children);
      
      if (elements.length > 0) {
        const parsedBlocks: ContentBlock[] = [];
        
        elements.forEach((element, index) => {
          const tagName = element.tagName.toLowerCase();
          
          if (tagName === 'h2') {
            parsedBlocks.push({
              id: `parsed-${index}`,
              type: 'heading',
              content: element.textContent || ''
            });
          } else if (tagName === 'img') {
            parsedBlocks.push({
              id: `parsed-${index}`,
              type: 'image',
              content: (element as HTMLImageElement).src || ''
            });
          } else if (tagName === 'p') {
            // Convert <br> tags back to newlines for editing
            const content = element.innerHTML.replace(/<br\s*\/?>/gi, '\n');
            // Remove any remaining HTML tags
            const textContent = content.replace(/<[^>]*>/g, '');
            if (textContent.trim()) {
              parsedBlocks.push({
                id: `parsed-${index}`,
                type: 'text',
                content: textContent
              });
            }
          }
        });
        
        return parsedBlocks.length > 0 ? parsedBlocks : [{ id: '1', type: 'text', content: '' }];
      }
    }
    return [{ id: '1', type: 'text', content: '' }];
  });

  const updateContent = (newBlocks: ContentBlock[]) => {
    setBlocks(newBlocks);
    
    // Convert blocks to HTML
    const html = newBlocks.map(block => {
      switch (block.type) {
        case 'heading':
          return `<h2 style="font-size: 1.5rem; font-weight: 600; margin: 1.5rem 0 0.75rem 0; color: var(--text-heading-light);">${block.content}</h2>`;
        case 'image':
          if (block.content && block.content.trim()) {
            return `<img src="${block.content}" style="max-width: 100%; height: auto; margin: 1rem 0; border-radius: 8px;" />`;
          }
          return '';
        case 'text':
        default:
          if (block.content && block.content.trim()) {
            return `<p style="margin-bottom: 1rem; line-height: 1.7;">${block.content.replace(/\n/g, '<br>')}</p>`;
          }
          return '';
      }
    }).filter(html => html.length > 0).join('');
    
    onChange(html);
  };

  const addSection = (type: 'text' | 'heading' | 'image') => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: ''
    };
    
    const newBlocks = [...blocks, newBlock];
    updateContent(newBlocks);
  };

  const updateBlock = (id: string, content: string) => {
    const newBlocks = blocks.map(block => 
      block.id === id ? { ...block, content } : block
    );
    updateContent(newBlocks);
  };

  const removeBlock = (id: string) => {
    if (blocks.length > 1) {
      const newBlocks = blocks.filter(block => block.id !== id);
      updateContent(newBlocks);
    }
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const currentIndex = blocks.findIndex(block => block.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    
    const newBlocks = [...blocks];
    [newBlocks[currentIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[currentIndex]];
    updateContent(newBlocks);
  };

  return (
    <div className="border border-[var(--border-light)] rounded-lg overflow-hidden">
      {/* Simple Toolbar */}
      <div className="bg-[var(--bg-soft-light)] border-b border-[var(--border-light)] p-3">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => addSection('text')}
            className="inline-flex items-center px-4 py-2 bg-[var(--accent-primary)] hover:opacity-90 text-white font-medium rounded-lg text-sm transition"
          >
            <i className="ti ti-text-size mr-2"></i>
            Add Text Section
          </button>
          <button
            type="button"
            onClick={() => addSection('heading')}
            className="inline-flex items-center px-4 py-2 bg-[var(--accent-secondary)] hover:opacity-90 text-white font-medium rounded-lg text-sm transition"
          >
            <i className="ti ti-heading mr-2"></i>
            Add Heading
          </button>
          <button
            type="button"
            onClick={() => addSection('image')}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:opacity-90 text-white font-medium rounded-lg text-sm transition"
          >
            <i className="ti ti-photo mr-2"></i>
            Add Image
          </button>
        </div>
      </div>

      {/* Content Blocks */}
      <div className="p-4 space-y-4">
        {blocks.map((block, index) => (
          <div key={block.id} className="group relative border border-[var(--border-light)] rounded-lg p-4 hover:border-[var(--accent-primary)] transition">
            {/* Block Controls */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => moveBlock(block.id, 'up')}
                  className="p-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
                  title="Move up"
                >
                  <i className="ti ti-chevron-up"></i>
                </button>
              )}
              {index < blocks.length - 1 && (
                <button
                  type="button"
                  onClick={() => moveBlock(block.id, 'down')}
                  className="p-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
                  title="Move down"
                >
                  <i className="ti ti-chevron-down"></i>
                </button>
              )}
              {blocks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="p-1 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-300 rounded"
                  title="Remove"
                >
                  <i className="ti ti-trash"></i>
                </button>
              )}
            </div>

            {/* Block Content */}
            <div className="pr-20">
              <div className="flex items-center gap-2 mb-2">
                <i className={`ti ${
                  block.type === 'heading' ? 'ti-heading' : 
                  block.type === 'image' ? 'ti-photo' : 'ti-text-size'
                } text-[var(--accent-primary)]`}></i>
                <span className="text-sm font-medium text-[var(--text-secondary-light)] capitalize">
                  {block.type === 'image' ? 'Image URL' : block.type}
                </span>
              </div>
              
              {block.type === 'image' ? (
                <div className="space-y-3">
                  <input
                    type="url"
                    className="form-input w-full"
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, e.target.value)}
                    placeholder="https://i.imgur.com/YvVx8kT.png"
                  />
                  {block.content && (
                    <div className="border border-[var(--border-light)] rounded-lg p-2 bg-[var(--bg-soft-light)]">
                      <img 
                        src={block.content} 
                        alt="Preview" 
                        className="max-w-full h-auto rounded"
                        style={{ maxHeight: '200px' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        onLoad={(e) => {
                          (e.target as HTMLImageElement).style.display = 'block';
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  className="form-textarea w-full"
                  rows={block.type === 'heading' ? 2 : 4}
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, e.target.value)}
                  placeholder={
                    block.type === 'heading' 
                      ? 'Enter your heading text...' 
                      : 'Enter your paragraph text...'
                  }
                />
              )}
            </div>
          </div>
        ))}
        
        {blocks.length === 0 && (
          <div className="text-center py-8 text-[var(--text-secondary-light)]">
            <i className="ti ti-edit text-3xl mb-2 opacity-50"></i>
            <p>Click the buttons above to start adding content to your blog post.</p>
          </div>
        )}
      </div>
    </div>
  );
}