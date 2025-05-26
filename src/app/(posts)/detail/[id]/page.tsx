import ReactMarkdown from 'react-markdown';

interface Article {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
}

export async function generateStaticParams() {
  const posts: Article[] = await fetch(`http://localhost:3000/api/articles`).then((res) => res.json());
  return posts.map((post) => ({
    id: String(post.id),
  }))
}
export const dynamicParams = true;
export default async function ArticleDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const article = await fetch(`/api/article?id=${id}`).then((res) => res.json());

  if (!article) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">文章不存在</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article className="prose lg:prose-xl">
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        <div className="text-gray-500 mb-8">
          <time>{new Date(article.created_at).toLocaleDateString()}</time>
        </div>
        <div className="markdown-content">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}