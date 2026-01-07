/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon } from "lucide-react";

// Define a type for the syntax highlighter theme
interface SyntaxHighlighterTheme {
    [key: string]: React.CSSProperties | SyntaxHighlighterTheme;
}

interface CodeBlockProps {
    code: string;
    language?: string;
    className?: string;
    showLineNumbers?: boolean;
    theme?: "oneDark" | "atomDark";
}

export default function CodeBlock({
    code,
    language = "jsx",
    className,
    showLineNumbers = false,
    theme = "oneDark",
}: CodeBlockProps) {
    const [copied, setCopied] = React.useState(false);

    const onCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Select base theme based on prop
    const baseTheme = theme === "oneDark" ? oneDark : atomDark;

    // Create a modified theme with consistent styling and backgrounds
    const modifiedTheme: SyntaxHighlighterTheme = {
        ...baseTheme,
        'pre[class*="language-"]': {
            ...baseTheme['pre[class*="language-"]'],
            margin: "0",
            padding: "1.5rem 1rem",
            borderRadius: "0.375rem",
            background: "transparent",
            backgroundColor: "transparent",
        },
        'code[class*="language-"]': {
            ...baseTheme['code[class*="language-"]'],
            background: "transparent",
            backgroundColor: "transparent",
        },
    };

    // Fix for oneDark line background issues
    if (theme === "oneDark") {
        // Add additional theme properties for oneDark
        modifiedTheme[':not(pre) > code[class*="language-"]'] = {
            ...(modifiedTheme[':not(pre) > code[class*="language-"]'] as React.CSSProperties),
            background: "transparent",
            backgroundColor: "transparent",
        };

        // Override line highlighting
        modifiedTheme[".token.operator"] = {
            ...(modifiedTheme[".token.operator"] as React.CSSProperties),
            background: "transparent",
            backgroundColor: "transparent",
        };
    }

    return (
        <div className="relative">
            {/* Copy button container - positioned outside the code block */}
            <div className="absolute -top-4 -right-4 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full dark:bg-zinc-800/80 dark:hover:bg-zinc-800/90 bg-zinc-200/80 hover:bg-zinc-200/90 shadow-md focus:ring-0"
                    onClick={onCopy}
                >
                    {copied ? <CheckIcon className="h-4 w-4 text-green-400" /> : <CopyIcon className="h-4 w-4" />}
                    <span className="sr-only">Copy code</span>
                </Button>
            </div>

            {/* Code container */}
            <div
                className={cn(
                    "w-full rounded-md overflow-hidden border font-mono",
                    "dark:border-zinc-700/50 dark:bg-zinc-900/90",
                    "border-zinc-300/70 bg-zinc-100/90",
                    className
                )}
            >
                <div className="overflow-y-auto max-h-[400px]">
                    <SyntaxHighlighter
                        language={language}
                        style={modifiedTheme}
                        showLineNumbers={showLineNumbers}
                        wrapLines={true}
                        wrapLongLines={true}
                        customStyle={{
                            margin: 0,
                            background: "transparent",
                            backgroundColor: "transparent",
                            fontSize: "0.875rem",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        }}
                        codeTagProps={{
                            style: {
                                background: "transparent",
                                backgroundColor: "transparent",
                            },
                        }}
                    >
                        {code}
                    </SyntaxHighlighter>
                </div>
            </div>
        </div>
    );
}
