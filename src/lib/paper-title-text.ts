// Plain-text presentation only: keep stored publication metadata unchanged.
// Symbol mappings match READEA's String+LaTeXToUnicode converter.
const commands: Record<string, string> = {"\\alpha": "α", "\\beta": "β", "\\gamma": "γ", "\\delta": "δ", "\\epsilon": "ε", "\\varepsilon": "ε", "\\zeta": "ζ", "\\eta": "η", "\\theta": "θ", "\\vartheta": "ϑ", "\\iota": "ι", "\\kappa": "κ", "\\lambda": "λ", "\\mu": "μ", "\\nu": "ν", "\\xi": "ξ", "\\pi": "π", "\\varpi": "ϖ", "\\rho": "ρ", "\\varrho": "ϱ", "\\sigma": "σ", "\\varsigma": "ς", "\\tau": "τ", "\\upsilon": "υ", "\\phi": "φ", "\\varphi": "φ", "\\chi": "χ", "\\psi": "ψ", "\\omega": "ω", "\\Gamma": "Γ", "\\Delta": "Δ", "\\Theta": "Θ", "\\Lambda": "Λ", "\\Xi": "Ξ", "\\Pi": "Π", "\\Sigma": "Σ", "\\Upsilon": "Υ", "\\Phi": "Φ", "\\Psi": "Ψ", "\\Omega": "Ω", "\\times": "×", "\\div": "÷", "\\cdot": "·", "\\circ": "∘", "\\ast": "∗", "\\star": "⋆", "\\dagger": "†", "\\ddagger": "‡", "\\oplus": "⊕", "\\otimes": "⊗", "\\odot": "⊙", "\\pm": "±", "\\mp": "∓", "\\leq": "≤", "\\le": "≤", "\\geq": "≥", "\\ge": "≥", "\\neq": "≠", "\\ne": "≠", "\\approx": "≈", "\\simeq": "≃", "\\gtrsim": "≳", "\\lesssim": "≲", "\\cong": "≅", "\\equiv": "≡", "\\sim": "∼", "\\propto": "∝", "\\ll": "≪", "\\gg": "≫", "\\prec": "≺", "\\succ": "≻", "\\preceq": "⪯", "\\succeq": "⪰", "\\in": "∈", "\\notin": "∉", "\\ni": "∋", "\\subset": "⊂", "\\supset": "⊃", "\\subseteq": "⊆", "\\supseteq": "⊇", "\\cup": "∪", "\\cap": "∩", "\\emptyset": "∅", "\\varnothing": "∅", "\\setminus": "∖", "\\to": "→", "\\rightarrow": "→", "\\leftarrow": "←", "\\Rightarrow": "⇒", "\\Leftarrow": "⇐", "\\leftrightarrow": "↔", "\\Leftrightarrow": "⇔", "\\mapsto": "↦", "\\uparrow": "↑", "\\downarrow": "↓", "\\nearrow": "↗", "\\searrow": "↘", "\\hookrightarrow": "↪", "\\hookleftarrow": "↩", "\\longrightarrow": "⟶", "\\longleftarrow": "⟵", "\\Longrightarrow": "⟹", "\\Longleftarrow": "⟸", "\\partial": "∂", "\\nabla": "∇", "\\int": "∫", "\\iint": "∬", "\\iiint": "∭", "\\oint": "∮", "\\sum": "∑", "\\prod": "∏", "\\coprod": "∐", "\\infty": "∞", "\\lim": "lim", "\\sup": "sup", "\\inf": "inf", "\\max": "max", "\\min": "min", "\\log": "log", "\\ln": "ln", "\\exp": "exp", "\\sin": "sin", "\\cos": "cos", "\\tan": "tan", "\\det": "det", "\\dim": "dim", "\\ker": "ker", "\\arg": "arg", "\\forall": "∀", "\\exists": "∃", "\\nexists": "∄", "\\neg": "¬", "\\lnot": "¬", "\\land": "∧", "\\lor": "∨", "\\wedge": "∧", "\\vee": "∨", "\\vdash": "⊢", "\\models": "⊨", "\\top": "⊤", "\\bot": "⊥", "\\ell": "ℓ", "\\hbar": "ℏ", "\\Re": "ℜ", "\\Im": "ℑ", "\\aleph": "ℵ", "\\wp": "℘", "\\angle": "∠", "\\triangle": "△", "\\sqrt": "√", "\\prime": "′", "\\ldots": "…", "\\cdots": "⋯", "\\dots": "…", "\\vdots": "⋮", "\\ddots": "⋱", "\\langle": "⟨", "\\rangle": "⟩", "\\lceil": "⌈", "\\rceil": "⌉", "\\lfloor": "⌊", "\\rfloor": "⌋", "\\|": "‖", "\\quad": " ", "\\qquad": "  ", "\\,": " ", "\\;": " ", "\\!": "", "\\&": "&", "\\ ": " "};
const superscripts: Record<string, string> = {"0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾", "n": "ⁿ", "i": "ⁱ", "T": "ᵀ", "t": "ᵗ", "a": "ᵃ", "b": "ᵇ", "c": "ᶜ", "d": "ᵈ", "e": "ᵉ", "f": "ᶠ", "g": "ᵍ", "h": "ʰ", "k": "ᵏ", "l": "ˡ", "m": "ᵐ", "o": "ᵒ", "p": "ᵖ", "r": "ʳ", "s": "ˢ", "u": "ᵘ", "v": "ᵛ", "w": "ʷ", "x": "ˣ", "y": "ʸ", "z": "ᶻ"};
const subscripts: Record<string, string> = {"0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉", "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎", "a": "ₐ", "e": "ₑ", "i": "ᵢ", "o": "ₒ", "x": "ₓ", "n": "ₙ", "k": "ₖ", "m": "ₘ", "p": "ₚ", "t": "ₜ", "r": "ᵣ", "s": "ₛ", "h": "ₕ", "l": "ₗ", "u": "ᵤ", "j": "ⱼ", "v": "ᵥ"};
function script(text: string, map: Record<string, string>, marker: string): string {
  return [...text].every(ch => map[ch] !== undefined)
    ? [...text].map(ch => map[ch]).join("") : `${marker}(${text})`;
}
export function paperTitleText(input: string): string {
  let text = input.replace(/<(sup|sub)\b[^>]*>(.*?)<\/\1>/gi,
    (_, tag, value) => script(value, tag.toLowerCase() === "sup" ? superscripts : subscripts, tag.toLowerCase() === "sup" ? "^" : "_"))
    .replace(/<\/?[a-z][a-z0-9:.-]*(?:\s[^>]*)?\s*\/?>/gi, "")
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/gi, (_, key) => ({amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:" "})[key.toLowerCase()] ?? "")
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (original, value) => {
      const code = value[0].toLowerCase() === "x" ? parseInt(value.slice(1), 16) : Number(value);
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : original;
    });
  text = text.replace(/\\[()[\]]/g, "").replace(/\${1,2}/g, "");
  // Unwrap innermost groups repeatedly so nested text/math styling remains readable.
  for (let i = 0; i < 12; i++) {
    const previous = text;
    text = text.replace(/\\(?:text|mathrm|textrm|textbf|textit|mathbf|mathit|mathcal|mathbb|operatorname|emph)\{([^{}]*)\}/g, "$1")
      .replace(/\\(?:frac|dfrac|tfrac)\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
      .replace(/\\sqrt\{([^{}]*)\}/g, "√($1)")
      .replace(/\\[a-zA-Z]+/g, command => commands[command] ?? command)
      .replace(/\^\{([^{}]*)\}|\^([a-zA-Z0-9+-])/g, (_, group, single) => script(group ?? single, superscripts, "^"))
      .replace(/_\{([^{}]*)\}|_([a-zA-Z0-9+-])/g, (_, group, single) => script(group ?? single, subscripts, "_"));
    if (text === previous) break;
  }
  return text.replace(/\\(?:left|right)\b/g, "")
    .replace(/\\[a-zA-Z]+\{([^{}]*)\}/g, "$1")
    .replace(/\\([a-zA-Z]+)/g, "$1")
    .replace(/\\[,;! ]/g, " ").replace(/\\([%&#_])/g, "$1")
    .replace(/[{}]/g, "").replace(/\s+/g, " ").trim();
}

// Match the receiving app's portable metadata limits, including older exporters.
export function normalizeSharedPaper(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const paper = value as Record<string, unknown>;
  return {
    ...paper,
    title: typeof paper.title === "string" ? paperTitleText(paper.title).slice(0, 500) : paper.title,
    authors: Array.isArray(paper.authors) ? paper.authors.slice(0, 20).map(author => typeof author === "string" ? author.slice(0, 200) : author) : paper.authors,
  };
}
