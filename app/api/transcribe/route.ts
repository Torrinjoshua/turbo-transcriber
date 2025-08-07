import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import ytdlp from 'yt-dlp-exec';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const formSchema = z.object({
  url: z.string().url().optional().or(z.literal('')),
  model: z.string().default(process.env.TRANSCRIBE_MODEL || 'gpt-4o-transcribe'),
});

const MAX_UPLOAD_MB = parseInt(process.env.MAX_UPLOAD_MB || '100', 10);
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

  // Helper: fetch audio from external downloader (returns a temp file path)
  async function fetchAudioViaDownloader(url: string): Promise<{ filePath: string, cleanup: () => void }> {
    const downloader = process.env.DOWNLOADER_URL;
    if (!downloader) {
      throw new Error('DOWNLOADER_URL is not configured. On Netlify, use an external downloader microservice.');
    }
    const res = await fetch(downloader + '/audio?url=' + encodeURIComponent(url));
    if (!res.ok) {
      const txt = await res.text();
      throw new Error('Downloader failed: ' + txt);
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tmpPath = path.join(os.tmpdir(), `dload-${Date.now()}.mp3`);
    await fs.promises.writeFile(tmpPath, buffer);
    return { filePath: tmpPath, cleanup: () => { fs.existsSync(tmpPath) && fs.unlinkSync(tmpPath); } };
  }


async function saveUploadedFile(req: NextRequest): Promise<{ filePath: string, cleanup: () => void } | null> {
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) return null;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return null;

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File exceeds ${MAX_UPLOAD_MB} MB limit`);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const tmpPath = path.join(os.tmpdir(), `upload-${Date.now()}-${file.name}`);
  await fs.promises.writeFile(tmpPath, buffer);

  return { filePath: tmpPath, cleanup: () => { fs.existsSync(tmpPath) && fs.unlinkSync(tmpPath); } };
}

async function downloadFromUrl(url: string): Promise<{ filePath: string, cleanup: () => void }> {

    // If running in a serverless host (e.g., Netlify), use external downloader
    if (process.env.NETLIFY || process.env.DOWNLOADER_URL) {
      return await fetchAudioViaDownloader(url);
    }

  const outPath = path.join(os.tmpdir(), `dload-${Date.now()}.%(ext)s`);
  // Use yt-dlp to get the best audio
  await ytdlp(url, {
    output: outPath,
    extractAudio: true,
    audioFormat: 'mp3',
    audioQuality: '0',
    // quiet: true
  });

  // Resolve the actual file (since yt-dlp replaces %(ext)s)
  const dir = os.tmpdir();
  const prefix = path.basename(outPath).split(".%(ext)s")[0];
  const files = await fs.promises.readdir(dir);
  const match = files.find(f => f.startsWith(prefix));
  let finalPath = path.join(dir, match || '');
  if (!match || !fs.existsSync(finalPath)) {
    // Fallback: try to find the newest file in tmp
    const stats = await Promise.all(files.map(async f => ({ f, t: (await fs.promises.stat(path.join(dir, f))).mtimeMs })));
    stats.sort((a,b) => b.t - a.t);
    finalPath = path.join(dir, stats[0].f);
  }

  return { filePath: finalPath, cleanup: () => { fs.existsSync(finalPath) && fs.unlinkSync(finalPath); } };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const url = (formData.get('url') as string) || '';
    const model = (formData.get('model') as string) || process.env.TRANSCRIBE_MODEL || 'gpt-4o-transcribe';

    formSchema.parse({ url, model });

    let tmp: { filePath: string, cleanup: () => void } | null = null;
    let dload: { filePath: string, cleanup: () => void } | null = null;

    // Prefer upload, else URL download
    tmp = await saveUploadedFile(req);

    if (!tmp && url) {
      dload = await downloadFromUrl(url);
    }

    const inputPath = tmp?.filePath || dload?.filePath;
    if (!inputPath) {
      return NextResponse.json({ error: 'Provide a file upload or a valid URL.' }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const fileStream = fs.createReadStream(inputPath);
    const resp = await client.audio.transcriptions.create({
      file: fileStream as any,
      model,
      // Optional parameters:
      // language: 'en',
      // temperature: 0,
      // response_format: 'text',
      // prompt: '',
    });

    const text = resp.text || (resp as any).data?.text || '';

    tmp?.cleanup();
    dload?.cleanup();

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error(err);
    return new NextResponse(err.message || 'Transcription failed', { status: 500 });
  }
}
