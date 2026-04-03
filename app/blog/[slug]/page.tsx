import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPortfolioData } from "@/lib/portfolio-api";
import { fetchBlogPost, fetchBlogPosts } from "@/lib/hashnode-api";
import { BlogPostClient } from "./blog-post-client";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const portfolioData = await fetchPortfolioData();
  const host = portfolioData.blog?.hashnodeHost || "";
  const post = await fetchBlogPost(host, slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  const title = post.seo?.title || post.title;
  const description =
    post.seo?.description || `${post.title} — Read on ${portfolioData.hero.heading || "my portfolio"}.`;
  const coverUrl = post.coverImage?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt,
      tags: post.tags.map((t) => t.name),
      ...(coverUrl && {
        images: [{ url: coverUrl, width: 1200, height: 630 }],
      }),
    },
    twitter: {
      card: coverUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(coverUrl && { images: [coverUrl] }),
    },
  };
}

export async function generateStaticParams() {
  try {
    const portfolioData = await fetchPortfolioData();
    const host = portfolioData.blog?.hashnodeHost || "";
    if (!host) return [];

    const posts = await fetchBlogPosts(host, 20);
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const portfolioData = await fetchPortfolioData();
  const host = portfolioData.blog?.hashnodeHost || "";
  const post = await fetchBlogPost(host, slug);

  if (!post) {
    notFound();
  }

  return <BlogPostClient post={post} />;
}
