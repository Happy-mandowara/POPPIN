"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  postId: string;
  initialLiked?: boolean;
  initialCount: number;
  token?: string | null;
  onLikedChange?: (liked: boolean, count: number) => void;
}

export function LikeButton({
  postId,
  initialLiked = false,
  initialCount = 0,
  token,
  onLikedChange,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const toggleLike = async () => {
    if (isLoading) return;

    // Optimistic UI update
    const nextLiked = !isLiked;
    const nextCount = nextLiked ? count + 1 : Math.max(0, count - 1);
    setIsLiked(nextLiked);
    setCount(nextCount);
    setIsLoading(true);

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/v1/posts/${postId}/like`, {
        method: nextLiked ? "POST" : "DELETE",
        headers,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback on failure
        setIsLiked(!nextLiked);
        setCount(count);
      } else {
        const confirmedCount = data.data.likesCount;
        setCount(confirmedCount);
        if (onLikedChange) {
          onLikedChange(nextLiked, confirmedCount);
        }
      }
    } catch {
      // Rollback on error
      setIsLiked(!nextLiked);
      setCount(count);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold select-none transition-all duration-150 active:scale-95 ${
        isLiked
          ? "text-rose-400 bg-rose-500/15 border border-rose-500/30 shadow-sm shadow-rose-500/10"
          : "text-[#B5BAC1] hover:text-[#F2F3F5] hover:bg-white/5 border border-transparent"
      }`}
      title={isLiked ? "Unlike post" : "Like post"}
      aria-label={isLiked ? "Unlike post" : "Like post"}
    >
      <Heart
        className={`w-3.5 h-3.5 transition-transform duration-200 ${
          isLiked ? "fill-rose-500 stroke-rose-500 scale-110" : "fill-none stroke-current"
        }`}
      />
      <span className="tabular-nums font-mono text-xs">{count}</span>
    </button>
  );
}
