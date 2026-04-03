"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Code2, User } from "lucide-react";
import type { BlogPostDetail } from "@/lib/hashnode-api";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogPostClient({ post }: { post: BlogPostDetail }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Blog
        </Link>

        {/* Cover Image or Fallback */}
        <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden mb-8 bg-muted">
          {post.coverImage?.url ? (
            <Image
              src={post.coverImage.url}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-accent/10">
              <Code2 className="w-24 h-24 text-primary/30" />
            </div>
          )}
        </div>

        {/* Title + Subtitle */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight mb-3">
          {post.title}
        </h1>
        {post.subtitle && (
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 leading-relaxed">
            {post.subtitle}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
          {/* Author */}
          <div className="flex items-center gap-2">
            {post.author.profilePicture ? (
              <Image
                src={post.author.profilePicture}
                alt={post.author.name}
                width={28}
                height={28}
                className="rounded-full"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
            <span className="font-medium text-foreground">{post.author.name}</span>
          </div>

          <span className="text-border">•</span>

          {/* Date */}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>

          <span className="text-border">•</span>

          {/* Read time */}
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{post.readTimeInMinutes} min read</span>
          </div>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <Badge
                key={tag.slug}
                variant="outline"
                className="text-xs px-3 py-1 bg-primary/5 border-primary/20 text-primary"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Content */}
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content.html }}
        />

        {/* Bottom back link */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Blog
          </Link>
        </div>
      </article>
    </div>
  );
}
