"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { getBusinessById } from "@/lib/services/business-service";
import {
  createBusinessPost,
  deleteBusinessPost,
  getBusinessPosts,
} from "@/lib/services/business-post-service";
import { Business, BusinessPost } from "@/types";

export default function ProviderBusinessPostsPage() {
  const params = useParams();
  const { user, userData } = useAuth();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [posts, setPosts] = useState<BusinessPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | undefined>(undefined);

  useEffect(() => {
    async function loadData() {
      try {
        const [businessData, postsData] = await Promise.all([
          getBusinessById(businessId),
          getBusinessPosts(businessId),
        ]);

        if (!businessData) {
          setError("Business not found");
          return;
        }

        if (!user?.uid || businessData.providerId !== user.uid) {
          setError("Only the owner can manage posts");
          return;
        }

        setBusiness(businessData);
        setPosts(postsData);
      } catch (loadError) {
        console.error(loadError);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [businessId, user?.uid]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.uid || !business || !title.trim() || !content.trim()) return;

    setSaving(true);
    setError("");

    try {
      const providerData = userData as any;
      const providerName = providerData?.firstName
        ? `${providerData.firstName} ${providerData.lastName || ""}`.trim()
        : providerData?.fullName || "Provider";

      await createBusinessPost(
        businessId,
        user.uid,
        providerName,
        title.trim(),
        content.trim(),
        image
      );

      const latestPosts = await getBusinessPosts(businessId);
      setPosts(latestPosts);
      setTitle("");
      setContent("");
      setImage(undefined);
    } catch (createError: any) {
      console.error(createError);
      setError(createError?.message || "Failed to create post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!user?.uid) return;
    if (!confirm("Delete this post?")) return;

    setDeletingId(postId);

    try {
      await deleteBusinessPost(postId, user.uid);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (deleteError) {
      console.error(deleteError);
      setError("Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-4">
          <p className="text-destructive">{error || "Unable to manage posts"}</p>
          <Button asChild variant="outline">
            <Link href="/provider/businesses">Back to My Businesses</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/provider/businesses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Business Posts</h1>
          <p className="text-muted-foreground">{business.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-28 p-3 border rounded-md resize-none"
              placeholder="Share updates, promotions, or announcements..."
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0])}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={saving || !title.trim() || !content.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              {saving ? "Publishing..." : "Publish Post"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No posts yet. Create your first business update.
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{post.title}</h3>
                    <p className="text-xs text-muted-foreground">by {post.providerName}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {deletingId === post.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{post.content}</p>
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="rounded-lg max-h-64 w-full object-cover"
                  />
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
