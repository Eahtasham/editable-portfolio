import { Metadata } from "next";
import { fetchPortfolioData } from "@/lib/portfolio-api";
import { fetchBlogPosts } from "@/lib/hashnode-api";
import { BlogListingClient } from "./blog-listing-client";

export const revalidate = 3600; // ISR: revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
  const portfolioData = await fetchPortfolioData();
  const name = portfolioData.hero.heading || "Blog";

  return {
    title: `Blog — ${name}`,
    description: `Read the latest blog posts, tutorials, and insights by ${name.replace("Hi, I'm ", "")}.`,
    openGraph: {
      title: `Blog — ${name}`,
      description: `Read the latest blog posts, tutorials, and insights by ${name.replace("Hi, I'm ", "")}.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Blog — ${name}`,
      description: `Read the latest blog posts, tutorials, and insights by ${name.replace("Hi, I'm ", "")}.`,
    },
  };
}

export default async function BlogPage() {
  const portfolioData = await fetchPortfolioData();
  const host = portfolioData.blog?.hashnodeHost || "";
  const posts = await fetchBlogPosts(host, 20);

  return <BlogListingClient posts={posts} />;
}
