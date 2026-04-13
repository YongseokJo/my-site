import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import SearchDialog from "./SearchDialog";

export default function SearchToggle() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center h-10 w-10 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
        aria-label="Search site"
      >
        <Search className="size-5" />
      </button>
      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
