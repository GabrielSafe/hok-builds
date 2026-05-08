const SUPABASE_BASE = "https://shebnxyhiguhzosxeftm.supabase.co/storage/v1/object/public/hok-assets/";

export default function imageLoader({ src }: { src: string; width: number; quality?: number }) {
  if (src.startsWith(SUPABASE_BASE)) {
    return `/img/${src.slice(SUPABASE_BASE.length)}`;
  }
  return src;
}
