import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
}

export default function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const pagefindRef = useRef<any>(null);

  async function initPagefind() {
    if (!pagefindRef.current) {
      try {
        // Pagefind JS is generated at build time — construct path dynamically to avoid Rollup resolution
        const pagefindPath = "/pagefind/pagefind.js";
        pagefindRef.current = await import(/* @vite-ignore */ pagefindPath);
        pagefindRef.current.init();
      } catch {
        console.warn("Pagefind not available — run npm run build first");
      }
    }
  }

  async function handleSearch(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    await initPagefind();
    if (!pagefindRef.current) return;
    const search = await pagefindRef.current.debouncedSearch(value, {}, 300);
    if (!search) return;
    const items = await Promise.all(
      search.results.slice(0, 10).map(async (r: any) => {
        const data = await r.data();
        return {
          url: data.url,
          title: data.meta?.title ?? "",
          excerpt: data.excerpt ?? "",
        };
      })
    );
    setResults(items);
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setQuery("");
      setResults([]);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-[600px] max-h-[70vh] flex flex-col p-0"
        showCloseButton={false}
      >
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="sr-only">Search site</DialogTitle>
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
            className="text-base"
          />
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {query && results.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No results found for &apos;{query}&apos;
            </p>
          )}
          {results.map((result) => (
            <a
              key={result.url}
              href={result.url}
              onClick={() => onOpenChange(false)}
              className="block py-3 border-b border-border last:border-0 hover:bg-muted/50 -mx-4 px-4 transition-colors"
            >
              <p className="text-base font-bold text-foreground">
                {result.title}
              </p>
              <p
                className="text-sm text-muted-foreground mt-1 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: result.excerpt }}
              />
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
