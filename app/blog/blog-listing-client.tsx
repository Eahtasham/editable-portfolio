"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Code2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { BlogPost } from "@/lib/hashnode-api";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export function BlogListingClient({ posts }: { posts: BlogPost[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Collect all unique tags
  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags.map((t) => t.name)))
  ).sort();

  // Filter posts
  const filtered = posts.filter((post) => {
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.brief.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag =
      !selectedTag || post.tags.some((t) => t.name === selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Portfolio
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3 tracking-tight">
            Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Thoughts, tutorials, and insights from my journey in software development.
          </p>
        </div>

        {/* Search + Tag Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTag === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(null)}
                className="text-xs"
              >
                All
              </Button>
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className="text-xs"
                >
                  {tag}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Posts Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Code2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No posts found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedTag
                ? "Try adjusting your search or filter."
                : "No blog posts available yet."}
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((post) => (
              <motion.div key={post.id} variants={itemVariants}>
                <Link href={`/blog/${post.slug}`} className="block h-full group">
                  <Card className="h-full flex flex-col bg-card border-border/50 backdrop-blur-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden">
                    {/* Cover */}
                    <div className="relative w-full h-48 bg-muted flex items-center justify-center overflow-hidden">
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
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant="secondary"
                          className="bg-background/80 backdrop-blur-md text-xs font-medium"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {post.readTimeInMinutes} min
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span>{formatDate(post.publishedAt)}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow flex flex-col gap-3">
                      <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {post.brief}
                      </CardDescription>

                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-border/30">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag.slug}
                              variant="outline"
                              className="text-[10px] px-2 py-0.5 bg-primary/5 border-primary/20 text-primary"
                            >
                              {tag.name}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-2 py-0.5 text-muted-foreground"
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
        )}
      </div>
    </div>
  );
}
