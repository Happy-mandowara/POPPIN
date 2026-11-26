/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { PostComment } from "@/types";
import { Send } from "lucide-react";

interface CommentDrawerProps {
  postId: string;
  comments: PostComment[];
  onAddComment: (postId: string, comment: PostComment) => void;
}

export function CommentDrawer({ postId, comments, onAddComment }: CommentDrawerProps) {
  const { user, profile } = useAuth();
  const [commentText, setCommentText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    const newComment: PostComment = {
      id: "comment_" + Date.now(),
      authorId: user.id,
      authorName: profile?.displayName || profile?.username || "You",
      authorUsername: profile?.username || "you",
      authorAvatar: profile?.avatar || null,
      content: commentText.trim(),
      createdAt: "Just now",
    };

    onAddComment(postId, newComment);
    setCommentText("");
  };

  return (
    <div className="pt-4 mt-4 border-t border-white/10 space-y-4 text-[#F2F3F5]">
      {/* Existing Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5 text-xs bg-[#2B2D31]/80 border border-white/5 p-3 rounded-2xl">
              <div className="w-7 h-7 rounded-full bg-[#383A40] text-white font-bold flex items-center justify-center shrink-0 overflow-hidden border border-white/10 text-xs">
                {c.authorAvatar ? (
                  <img src={c.authorAvatar} alt={c.authorName} className="w-full h-full object-cover" />
                ) : (
                  c.authorUsername.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <Link
                    href={`/profiles/${c.authorUsername}`}
                    className="font-bold text-white hover:text-[#8A9BFF] transition-colors"
                  >
                    {c.authorName}
                  </Link>
                  <span className="text-[11px] text-zinc-400 font-mono">@{c.authorUsername}</span>
                  <span className="text-zinc-600 text-xs">·</span>
                  <span className="text-[11px] text-zinc-500 font-mono">{c.createdAt}</span>
                </div>
                <p className="text-zinc-200 text-xs font-normal leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-400 text-center py-2">
          No comments yet. Start the conversation!
        </p>
      )}

      {/* Add Comment Input */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            required
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a thoughtful reply..."
            maxLength={280}
            className="flex-1 px-4 py-2 rounded-xl bg-[#383A40] border border-white/10 text-xs font-medium text-white placeholder-zinc-400 focus:bg-[#313338] focus:outline-none focus:ring-2 focus:ring-[#5865F2] transition-all"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-[#5865F2] text-white text-xs font-bold hover:bg-[#4752C4] active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer select-none"
          >
            <Send className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Reply</span>
          </button>
        </form>
      ) : (
        <p className="text-xs text-zinc-400 text-center">
          <Link href="/login" className="text-[#8A9BFF] font-bold hover:underline">
            Sign in
          </Link>{" "}
          to join the discussion.
        </p>
      )}
    </div>
  );
}
