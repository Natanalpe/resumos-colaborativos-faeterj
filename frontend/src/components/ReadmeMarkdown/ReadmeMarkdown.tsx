import React, { useMemo } from "react";
import { MarkdownHooks } from "react-markdown";
import rehypeStarryNight from "rehype-starry-night";
import remarkGfm from "remark-gfm";

export const ReadmeMarkdown = React.memo(({ content }: { content?: string }) => {

    const memoizedPlugins = useMemo(() => ({
        rehype: [rehypeStarryNight],
        remark: [remarkGfm]
    }), []);

    return (
        <div className="markdown-container">
            <MarkdownHooks
                rehypePlugins={memoizedPlugins.rehype}
                remarkPlugins={memoizedPlugins.remark}
            >
                {content || ''}
            </MarkdownHooks>
        </div >
    );
});