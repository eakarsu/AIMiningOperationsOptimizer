import React from 'react';

function formatAIContent(text) {
  if (!text) return '';

  // Convert markdown-like content to HTML
  let html = text
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Numbered lists
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    // Bullet lists
    .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p>')
    // Single newlines within content
    .replace(/\n/g, '<br/>');

  return `<p>${html}</p>`;
}

function AIResultDisplay({ result, loading }) {
  if (loading) {
    return (
      <div className="ai-loading">
        <div className="spinner"></div>
        <span>AI is analyzing your data...</span>
      </div>
    );
  }

  if (!result) return null;

  const content = result.content || result;
  const model = result.model || '';
  const usage = result.usage;

  return (
    <div className="ai-result">
      <div className="ai-result-header">
        <span className="ai-badge">AI Analysis</span>
        {model && <span className="ai-model">Model: {model}</span>}
        {usage && (
          <span className="ai-model">
            Tokens: {usage.prompt_tokens + usage.completion_tokens}
          </span>
        )}
      </div>
      <div
        className="ai-result-content"
        dangerouslySetInnerHTML={{ __html: formatAIContent(typeof content === 'string' ? content : JSON.stringify(content)) }}
      />
    </div>
  );
}

export default AIResultDisplay;
