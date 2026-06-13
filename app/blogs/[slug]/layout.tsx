import type { Metadata } from "next";
import { getBlogBySlug } from "@/lib/db";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

type Props = {
  children: React.ReactNode;
  params: { slug: string };
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const blog = await getBlogBySlug(params.slug);
    if (!blog) return { title: "Blog Post" };
    return {
      title: blog.title,
      description: blog.excerpt,
      alternates: { canonical: `/blogs/${blog.slug}` },
      openGraph: {
        type: "article",
        title: blog.title,
        description: blog.excerpt,
        url: `${SITE_URL}/blogs/${blog.slug}`,
        publishedTime: blog.createdAt,
        modifiedTime: blog.updatedAt || blog.createdAt,
        authors: blog.author ? [blog.author] : undefined,
        images: blog.coverImage ? [blog.coverImage] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description: blog.excerpt,
      },
    };
  } catch {
    return { title: "Blog Post" };
  }
}

export default async function BlogPostLayout({ children, params }: Props) {
  let jsonLd: Record<string, unknown> | null = null;
  try {
    const blog = await getBlogBySlug(params.slug);
    if (blog) {
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: blog.title,
        description: blog.excerpt,
        datePublished: blog.createdAt,
        dateModified: blog.updatedAt || blog.createdAt,
        author: { "@type": "Organization", name: blog.author || SITE_NAME },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: { "@type": "ImageObject", url: `${SITE_URL}/icon` },
        },
        mainEntityOfPage: `${SITE_URL}/blogs/${blog.slug}`,
        image: blog.coverImage || `${SITE_URL}/opengraph-image`,
        keywords: blog.tags?.join(", "),
      };
    }
  } catch {
    // no structured data if the post can't be fetched
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
