import { toast } from 'sonner';
import { formatDistanceToNow, format, isAfter, subDays } from 'date-fns';
import { SUPPORTED_LANGUAGES } from '@/types';

export function getLangName(code: string) {
  return SUPPORTED_LANGUAGES.find(l => l.code === code)?.name ?? code;
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (isAfter(date, subDays(new Date(), 7))) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  return format(date, 'MMM d');
}

export async function downloadFile(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
    toast.success('Download started');
  } catch {
    toast.error('Download failed');
  }
}
