export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 空格替换为连字符
    .replace(/-+/g, '-'); // 移除多余的连字符
}

export async function checkSlugAvailability(slug: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/slug-check?slug=${encodeURIComponent(slug)}`);
    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error('Error checking slug availability:', error);
    return false;
  }
}

interface DraftArticle {
  title: string;
  content: string;
  slug: string;
}

export function saveDraft(article: DraftArticle): void {
  localStorage.setItem('article_draft', JSON.stringify(article));
}

export function loadDraft(): DraftArticle | null {
  const draft = localStorage.getItem('article_draft');
  return draft ? JSON.parse(draft) : null;
}

export function clearDraft(): void {
  localStorage.removeItem('article_draft');
}