import Link from 'next/link';
import { Languages, ArrowLeft, Code2, Key, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'API Reference — OCR Translate',
  description: 'Documentation for the OCR Translate REST API.',
};

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
      <code>{children}</code>
    </pre>
  );
}

function EndpointBadge({ method }: { method: 'GET' | 'POST' | 'DELETE' }) {
  const colors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    POST: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 font-mono text-xs font-bold ${colors[method]}`}
    >
      {method}
    </span>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Languages className="h-6 w-6" />
            <span className="text-lg font-semibold">OCR Translate</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <div className="mb-10">
            <div className="mb-3 flex items-center gap-2">
              <Code2 className="text-primary h-6 w-6" />
              <h1 className="text-3xl font-bold">API Reference</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Integrate OCR Translate into your pipeline using the REST API.
            </p>
          </div>

          {/* Authentication */}
          <section className="mb-10 space-y-4">
            <h2 className="text-xl font-semibold">Authentication</h2>
            <p className="text-muted-foreground text-sm">
              All API requests require an API key. Create one in{' '}
              <Link
                href="/settings"
                className="text-primary underline underline-offset-4"
              >
                Settings → API Keys
              </Link>
              . Pass it in the{' '}
              <code className="bg-muted rounded px-1 py-0.5 text-xs">
                Authorization
              </code>{' '}
              header:
            </p>
            <CodeBlock>{`Authorization: Bearer YOUR_API_KEY`}</CodeBlock>
          </section>

          {/* Base URL */}
          <section className="mb-10 space-y-4">
            <h2 className="text-xl font-semibold">Base URL</h2>
            <CodeBlock>{`https://api.ocr-translate.app`}</CodeBlock>
            <p className="text-muted-foreground text-sm">
              All endpoints are versioned under{' '}
              <code className="bg-muted rounded px-1 py-0.5 text-xs">
                /api/v1
              </code>
              .
            </p>
          </section>

          {/* Endpoints */}
          <section className="mb-10 space-y-6">
            <h2 className="text-xl font-semibold">Endpoints</h2>

            {/* Translate Image */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <EndpointBadge method="POST" />
                  <CardTitle className="font-mono text-sm">
                    /api/v1/translate-image
                  </CardTitle>
                </div>
                <CardDescription>
                  Translate text in a single image. Returns the translated
                  image, a text-removed image, and a region-by-region breakdown.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">
                    Request (multipart/form-data)
                  </p>
                  <div className="space-y-1 text-sm">
                    {[
                      {
                        name: 'image',
                        type: 'File',
                        required: true,
                        desc: 'Image file (JPEG, PNG, WebP). Max 10 MB.',
                      },
                      {
                        name: 'target_lang',
                        type: 'string',
                        required: true,
                        desc: 'Target language code (e.g., "en", "de").',
                      },
                      {
                        name: 'source_lang',
                        type: 'string',
                        required: false,
                        desc: 'Source language code. Omit for auto-detect.',
                      },
                      {
                        name: 'exclude_text',
                        type: 'string',
                        required: false,
                        desc: 'Comma-separated patterns to skip (e.g., "BRAND,@handle").',
                      },
                    ].map(f => (
                      <div key={f.name} className="flex items-start gap-3">
                        <code className="bg-muted min-w-[120px] rounded px-1.5 py-0.5 text-xs">
                          {f.name}
                        </code>
                        <span className="text-muted-foreground text-xs">
                          {f.type}
                        </span>
                        {f.required ? (
                          <Badge variant="default" className="text-xs">
                            required
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            optional
                          </Badge>
                        )}
                        <span className="text-muted-foreground text-xs">
                          {f.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Example (curl)</p>
                  <CodeBlock>{`curl -X POST https://api.ocr-translate.app/api/v1/translate-image \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@photo.jpg" \\
  -F "target_lang=en" \\
  -F "source_lang=de"`}</CodeBlock>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Response (200)</p>
                  <CodeBlock>{`{
  "original_image_url": "https://...",
  "translated_image_url": "https://...",
  "clean_image_url": "https://...",
  "regions": [
    {
      "id": "region_1",
      "original_text": "Willkommen",
      "translated_text": "Welcome",
      "confidence": 0.97,
      "bounding_box": { "x": 10, "y": 20, "width": 80, "height": 30 }
    }
  ]
}`}</CodeBlock>
                </div>
              </CardContent>
            </Card>

            {/* Batch Create */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <EndpointBadge method="POST" />
                  <CardTitle className="font-mono text-sm">
                    /api/v1/batch/translate
                  </CardTitle>
                </div>
                <CardDescription>
                  Create a batch translation job for up to 20 images and 10
                  target languages. The job runs asynchronously — poll the
                  status endpoint or use a webhook.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">
                    Request (multipart/form-data)
                  </p>
                  <div className="space-y-1 text-sm">
                    {[
                      {
                        name: 'images[]',
                        type: 'File[]',
                        required: true,
                        desc: 'Up to 20 image files.',
                      },
                      {
                        name: 'target_languages[]',
                        type: 'string[]',
                        required: true,
                        desc: 'One or more language codes.',
                      },
                      {
                        name: 'source_lang',
                        type: 'string',
                        required: false,
                        desc: 'Source language. Omit for auto-detect.',
                      },
                      {
                        name: 'exclude_text',
                        type: 'string',
                        required: false,
                        desc: 'Comma-separated patterns to skip.',
                      },
                      {
                        name: 'webhook_url',
                        type: 'string',
                        required: false,
                        desc: 'URL to POST when the batch completes.',
                      },
                    ].map(f => (
                      <div key={f.name} className="flex items-start gap-3">
                        <code className="bg-muted min-w-[120px] rounded px-1.5 py-0.5 text-xs">
                          {f.name}
                        </code>
                        <span className="text-muted-foreground text-xs">
                          {f.type}
                        </span>
                        {f.required ? (
                          <Badge variant="default" className="text-xs">
                            required
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            optional
                          </Badge>
                        )}
                        <span className="text-muted-foreground text-xs">
                          {f.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Response (201)</p>
                  <CodeBlock>{`{
  "batch_id": "batch_abc123",
  "status": "pending",
  "total_images": 3,
  "target_languages": ["en", "de"],
  "created_at": "2026-02-22T10:00:00Z"
}`}</CodeBlock>
                </div>
              </CardContent>
            </Card>

            {/* Batch Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <EndpointBadge method="GET" />
                  <CardTitle className="font-mono text-sm">
                    /api/v1/batch/{'{batch_id}'}
                  </CardTitle>
                </div>
                <CardDescription>
                  Get the current status and results of a batch job.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">Example (curl)</p>
                  <CodeBlock>{`curl https://api.ocr-translate.app/api/v1/batch/batch_abc123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</CodeBlock>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Response (200)</p>
                  <CodeBlock>{`{
  "batch_id": "batch_abc123",
  "status": "completed",
  "total_images": 3,
  "completed_count": 3,
  "failed_count": 0,
  "images": [
    {
      "image_id": "img_1",
      "original_filename": "photo.jpg",
      "status": "completed",
      "outputs": {
        "en": {
          "translated_image_url": "https://...",
          "original_image_url": "https://...",
          "clean_image_url": "https://..."
        }
      }
    }
  ]
}`}</CodeBlock>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">
                    Batch status values
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'pending',
                      'processing',
                      'completed',
                      'partially_completed',
                      'failed',
                      'cancelled',
                    ].map(s => (
                      <code
                        key={s}
                        className="bg-muted rounded px-1.5 py-0.5 text-xs"
                      >
                        {s}
                      </code>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Batch Cancel */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <EndpointBadge method="POST" />
                  <CardTitle className="font-mono text-sm">
                    /api/v1/batch/{'{batch_id}'}/cancel
                  </CardTitle>
                </div>
                <CardDescription>Cancel a running batch job.</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock>{`curl -X POST https://api.ocr-translate.app/api/v1/batch/batch_abc123/cancel \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</CodeBlock>
              </CardContent>
            </Card>

            {/* List Batches */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <EndpointBadge method="GET" />
                  <CardTitle className="font-mono text-sm">
                    /api/v1/batch
                  </CardTitle>
                </div>
                <CardDescription>
                  List all batch jobs for your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">Query parameters</p>
                  <div className="space-y-1 text-sm">
                    {[
                      {
                        name: 'page',
                        type: 'int',
                        desc: 'Page number (default: 1).',
                      },
                      {
                        name: 'limit',
                        type: 'int',
                        desc: 'Results per page (default: 20, max: 100).',
                      },
                    ].map(f => (
                      <div key={f.name} className="flex items-center gap-3">
                        <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
                          {f.name}
                        </code>
                        <span className="text-muted-foreground text-xs">
                          {f.type}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          optional
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {f.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Languages */}
          <section className="mb-10 space-y-4">
            <h2 className="text-xl font-semibold">Supported Languages</h2>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {[
                { code: 'en', name: 'English' },
                { code: 'de', name: 'German' },
                { code: 'fr', name: 'French' },
                { code: 'es', name: 'Spanish' },
                { code: 'it', name: 'Italian' },
                { code: 'pt', name: 'Portuguese' },
                { code: 'nl', name: 'Dutch' },
                { code: 'sv', name: 'Swedish' },
                { code: 'da', name: 'Danish' },
                { code: 'no', name: 'Norwegian' },
                { code: 'fi', name: 'Finnish' },
              ].map(lang => (
                <div
                  key={lang.code}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <span>{lang.name}</span>
                  <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
                    {lang.code}
                  </code>
                </div>
              ))}
            </div>
          </section>

          {/* Rate limits */}
          <section className="mb-10 space-y-4">
            <h2 className="text-xl font-semibold">Limits</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Max file size', value: '10 MB' },
                { label: 'Max images per batch', value: '20' },
                { label: 'Max languages per batch', value: '10' },
                { label: 'Max concurrent batches', value: '3' },
              ].map(item => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <span className="text-muted-foreground text-sm">
                    {item.label}
                  </span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Get started */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Get started</h2>
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-8 text-center">
                <Key className="text-muted-foreground mb-3 h-8 w-8" />
                <p className="font-medium">Create an API key to begin</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Go to Settings to generate your first API key.
                </p>
                <Link href="/settings" className="mt-4">
                  <Button size="sm" className="gap-2">
                    <Terminal className="h-4 w-4" />
                    Go to Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <footer className="border-t">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              <span className="font-semibold">OCR Translate</span>
            </div>
            <div className="text-muted-foreground flex gap-4 text-sm">
              <Link href="/terms" className="hover:underline">
                Terms
              </Link>
              <Link href="/privacy" className="hover:underline">
                Privacy
              </Link>
              <Link href="/help" className="hover:underline">
                Help
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
