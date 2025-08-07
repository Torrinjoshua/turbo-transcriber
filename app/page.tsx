'use client';

import React, { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [model, setModel] = useState<string>('gpt-4o-transcribe');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTranscript('');
    setStatus('Uploading...');
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (url) formData.append('url', url);
      formData.append('model', model);

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed');
      }

      const data = await res.json();
      setTranscript(data.text || '');
      setStatus('Done ✅');
    } catch (err: any) {
      setStatus('Error: ' + err.message);
    }
  };

  return (
    <main style={{ maxWidth: 800, margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>Turbo Transcriber</h1>
      <p style={{ marginBottom: '1rem' }}>Upload audio/video or paste a link. Only use content you have rights to transcribe.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600 }}>Upload File</label>
          <input type="file" accept="audio/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <div style={{ fontSize: 12, opacity: 0.7 }}>Accepted: mp3, wav, m4a, mp4, etc.</div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600 }}>Or Paste Link (YouTube, Instagram, etc.)</label>
          <input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600 }}>Model</label>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="gpt-4o-transcribe">gpt-4o-transcribe (best)</option>
            <option value="gpt-4o-mini-transcribe">gpt-4o-mini-transcribe (cheaper/faster)</option>
          </select>
        </div>

        <button type="submit" style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Transcribe</button>
      </form>

      <div style={{ marginTop: '1rem' }}>
        <strong>Status:</strong> {status}
      </div>

      {transcript && (
        <section style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Transcript</h2>
          <textarea style={{ width: '100%', height: 300 }} value={transcript} readOnly />
        </section>
      )}
    </main>
  );
}
