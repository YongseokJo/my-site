import assert from "node:assert/strict";
import { paperTitleText, normalizeSharedPaper } from "../src/lib/paper-title-text.ts";
assert.equal(paperTitleText(String.raw`<i>Growth</i> of $\alpha$ at $10^{8}$`), "Growth of α at 10⁸");
assert.equal(paperTitleText(String.raw`Limits \(\beta + 1\)`), "Limits β + 1");
assert.equal(paperTitleText(String.raw`$M_{\mathrm{BH}} \gtrsim 10^{8} M_{\odot}$`), "M_(BH) ≳ 10⁸ M_(⊙)");
assert.equal(paperTitleText("H<sub>2</sub>O &amp; 10<sup>8</sup>"), "H₂O & 10⁸");
assert.equal(paperTitleText(String.raw`$\frac{a}{b}$`), "(a)/(b)");
assert.equal(paperTitleText("Stars &amp; galaxies"), "Stars & galaxies");
console.log("6 shared-title cases passed");

const normalized = normalizeSharedPaper({title: "a".repeat(600), authors: Array(30).fill("b".repeat(210)), url: "https://arxiv.org/abs/2610.12596"});
assert.equal(normalized.title.length, 500);
assert.equal(normalized.authors.length, 20);
assert.equal(normalized.authors[0].length, 200);
assert.equal(normalized.url, "https://arxiv.org/abs/2610.12596");
assert.equal(normalizeSharedPaper(null), null);
console.log("Metadata limits passed");
