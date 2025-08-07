export const metadata = {
  title: 'Turbo Transcriber',
  description: 'Upload a file or paste a link and get a transcription in seconds.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
