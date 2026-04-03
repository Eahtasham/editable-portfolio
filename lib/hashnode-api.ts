// lib/hashnode-api.ts
// Hashnode GraphQL API client — no API key needed for public reads

const GQL_ENDPOINT = "https://gql.hashnode.com";

// --- Types ---

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  brief: string;
  publishedAt: string;
  readTimeInMinutes: number;
  coverImage: { url: string } | null;
  tags: Array<{ name: string; slug: string }>;
}

export interface BlogPostDetail {
  id: string;
  title: string;
  subtitle: string | null;
  publishedAt: string;
  readTimeInMinutes: number;
  content: { html: string };
  coverImage: { url: string } | null;
  tags: Array<{ name: string; slug: string }>;
  author: {
    name: string;
    profilePicture: string | null;
  };
  seo: {
    title: string | null;
    description: string | null;
  } | null;
}

// --- Queries ---

const POSTS_QUERY = `
  query GetPosts($host: String!, $first: Int!) {
    publication(host: $host) {
      posts(first: $first) {
        edges {
          node {
            id
            title
            slug
            brief
            publishedAt
            readTimeInMinutes
            coverImage {
              url
            }
            tags {
              name
              slug
            }
          }
        }
      }
    }
  }
`;

const POST_BY_SLUG_QUERY = `
  query GetPostBySlug($host: String!, $slug: String!) {
    publication(host: $host) {
      post(slug: $slug) {
        id
        title
        subtitle
        publishedAt
        readTimeInMinutes
        content {
          html
        }
        coverImage {
          url
        }
        tags {
          name
          slug
        }
        author {
          name
          profilePicture
        }
        seo {
          title
          description
        }
      }
    }
  }
`;

// --- Fetch functions ---

async function queryHashnode<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const response = await fetch(GQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`Hashnode API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(`Hashnode GraphQL error: ${result.errors[0]?.message || "Unknown error"}`);
  }

  return result.data;
}

/**
 * Fetch a list of blog posts from a Hashnode publication.
 */
export async function fetchBlogPosts(host: string, first: number = 10): Promise<BlogPost[]> {
  if (!host) return [];

  try {
    const data = await queryHashnode<{
      publication: {
        posts: {
          edges: Array<{ node: BlogPost }>;
        };
      } | null;
    }>(POSTS_QUERY, { host, first });

    if (!data.publication?.posts?.edges) return [];

    return data.publication.posts.edges.map((edge) => edge.node);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

/**
 * Fetch a single blog post by slug from a Hashnode publication.
 */
export async function fetchBlogPost(host: string, slug: string): Promise<BlogPostDetail | null> {
  if (!host || !slug) return null;

  try {
    const data = await queryHashnode<{
      publication: {
        post: BlogPostDetail | null;
      } | null;
    }>(POST_BY_SLUG_QUERY, { host, slug });

    return data.publication?.post || null;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}
