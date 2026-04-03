"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Code2 } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import { fetchBlogPosts, type BlogPost } from "@/lib/hashnode-api";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function BlogCardSkeleton() {
  return (
    <Card className="h-full flex flex-col bg-card border-border/50 backdrop-blur-sm overflow-hidden animate-pulse">
      <div className="w-full h-48 sm:h-52 bg-muted" />
      <CardHeader className="pb-3">
        <div className="h-5 bg-muted rounded w-3/4 mb-2" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-3">
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-5/6" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </div>
        <div className="flex gap-2 mt-auto">
          <div className="h-5 bg-muted rounded-full w-16" />
          <div className="h-5 bg-muted rounded-full w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export const BlogSection = () => {
  const { data } = usePortfolio();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const hashnodeHost = data.blog?.hashnodeHost;

  useEffect(() => {
    if (!hashnodeHost) {
      setLoading(false);
      return;
    }

    fetchBlogPosts(hashnodeHost, 3)
      .then((fetchedPosts) => setPosts(fetchedPosts))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [hashnodeHost]);

  if (!hashnodeHost) return null;
  if (!loading && posts.length === 0) return null;

  return (
    <div className="w-full py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 md:mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Latest Blog Posts
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Thoughts, tutorials, and insights from my journey in software development.
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {posts.map((post) => (
                <motion.div key={post.id} variants={itemVariants}>
                  <Link href={`/blog/${post.slug}`} className="block h-full group">
                    <Card className="h-full flex flex-col bg-card border-border/50 backdrop-blur-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden">
                      {/* Cover Image or Fallback */}
                      <div className="relative w-full h-48 sm:h-52 bg-muted flex items-center justify-center overflow-hidden">
                        {post.coverImage?.url ? (
                          <Image
                            src={post.coverImage.url}
                            alt={post.title}
                            width={500}
                            height={300}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-accent/10">
                            <Code2 className="w-16 h-16 text-primary/40" />
                          </div>
                        )}
                        {/* Read time overlay */}
                        <div className="absolute top-3 right-3">
                          <Badge
                            variant="secondary"
                            className="bg-background/80 backdrop-blur-md text-xs font-medium"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {post.readTimeInMinutes} min read
                          </Badge>
                        </div>
                      </div>

                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg sm:text-xl font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
                          {post.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-grow flex flex-col gap-4">
                        <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {post.brief}
                        </CardDescription>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-border/30">
                            {post.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag.slug}
                                variant="outline"
                                className="text-[10px] sm:text-xs px-2 py-0.5 bg-primary/5 border-primary/20 text-primary"
                              >
                                {tag.name}
                              </Badge>
                            ))}
                            {post.tags.length > 3 && (
                              <Badge
                                variant="outline"
                                className="text-[10px] sm:text-xs px-2 py-0.5 text-muted-foreground"
                              >
                                +{post.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* View All Button */}
            <div className="flex justify-center mt-10">
              <Link href="/blog">
                <Button
                  variant="outline"
                  size="lg"
                  className="group px-8 py-4 text-base border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                >
                  View All Posts
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BlogSection;
