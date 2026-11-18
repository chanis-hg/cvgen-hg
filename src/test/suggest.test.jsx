import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { I18nProvider } from "../i18n";
import Suggest from "../components/Suggest";
import {
  CERT_ISSUERS,
  DEGREES,
  JOB_TITLES,
  LANGUAGES,
  SCHOOLS,
  SKILLS,
  SUGGESTIONS,
  suggestionsFor,
} from "../data/suggestions";

function Harness({ options, onCommit }) {
  const [v, setV] = useState("");
  return (
    <I18nProvider lang="fr">
      <Suggest label="Compétence" options={options} value={v} onChange={setV} onCommit={onCommit} />
    </I18nProvider>
  );
}

const OPTS = ["React", "React Native", "Laravel", "Électricité bâtiment", "Vue.js", "Excel"];

const setup = (opts = OPTS, onCommit) => {
  const user = userEvent.setup();
  render(<Harness options={opts} onCommit={onCommit} />);
  return { user, input: screen.getByRole("combobox") };
};

const optionNames = () =>
  within(screen.getByRole("listbox"))
    .getAllByRole("option")
    .map((n) => n.textContent);

describe("Suggest", () => {
  it("opens the whole list on focus, so nothing has to be typed", async () => {
    const { user, input } = setup();
    expect(screen.queryByRole("listbox")).toBeNull();
    await user.click(input);
    expect(optionNames()).toHaveLength(OPTS.length);
  });

  it("filters as you type and puts prefixes before inner matches", async () => {
    const { user, input } = setup();
    await user.type(input, "re");
    const names = optionNames();
    expect(names[0]).toBe("React");
    expect(names).toContain("React Native");
    expect(names).not.toContain("Excel");
  });

  // Quelqu'un qui tape « electri » doit trouver « Électricité » : sinon la
  // liste a l'air vide alors que l'entrée existe.
  it("ignores accents and punctuation when matching", async () => {
    const { user, input } = setup();
    await user.type(input, "electri");
    expect(optionNames().join()).toContain("Électricité bâtiment");
    await user.clear(input);
    await user.type(input, "vue js");
    expect(optionNames()).toContain("Vue.js");
  });

  it("offers what you typed when it is in no list", async () => {
    const { user, input } = setup();
    await user.type(input, "Soudure TIG");
    const first = within(screen.getByRole("listbox")).getAllByRole("option")[0];
    expect(first).toHaveTextContent("Soudure TIG");
  });

  it("does not offer your own text twice when it already exists", async () => {
    const { user, input } = setup();
    await user.type(input, "Excel");
    expect(optionNames().filter((n) => n === "Excel")).toHaveLength(1);
  });

  // En pleine frappe, « Ajouter re » au-dessus de React serait du bruit :
  // la proposition n'arrive que lorsque la liste n'a rien à offrir.
  it("keeps the add option out of the way while matches remain", async () => {
    const { user, input } = setup();
    await user.type(input, "re");
    expect(optionNames().some((n) => n.startsWith("Ajouter"))).toBe(false);
  });

  // La demande exacte : on tape, Tab complète.
  it("completes the typed prefix on Tab", async () => {
    const { user, input } = setup();
    await user.type(input, "lara");
    await user.keyboard("{Tab}");
    expect(input).toHaveValue("Laravel");
  });

  // Et le point sensible : Tab doit rester Tab quand il n'y a rien à
  // compléter, sinon le champ devient un piège au clavier.
  it("leaves Tab alone when nothing completes the input", async () => {
    const { user, input } = setup();
    await user.type(input, "Soudure TIG");
    await user.keyboard("{Tab}");
    expect(input).toHaveValue("Soudure TIG");
    expect(input).not.toHaveFocus();
  });

  it("never rewrites the field while typing", async () => {
    const { user, input } = setup();
    await user.type(input, "rea");
    expect(input).toHaveValue("rea");
  });

  it("picks with the arrow keys and Enter", async () => {
    const commit = vi.fn();
    const { user, input } = setup(OPTS, commit);
    await user.type(input, "re");
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(input).toHaveValue("React Native");
    expect(commit).toHaveBeenCalledWith("React Native");
  });

  // Entrée sans sélection valide ce qui est écrit, jamais la première
  // proposition : la personne n'a rien choisi.
  it("commits what you typed when no option is highlighted", async () => {
    const commit = vi.fn();
    const { user, input } = setup(OPTS, commit);
    await user.type(input, "rea{Enter}");
    expect(input).toHaveValue("rea");
    expect(commit).not.toHaveBeenCalled();
  });

  it("closes on Escape without changing the value", async () => {
    const { user, input } = setup();
    await user.type(input, "re");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(input).toHaveValue("re");
  });

  it("selects with a pointer", async () => {
    const { user, input } = setup();
    await user.click(input);
    await user.click(screen.getByRole("option", { name: "Laravel" }));
    expect(input).toHaveValue("Laravel");
  });

  it("wires the combobox to its listbox for screen readers", async () => {
    const { user, input } = setup();
    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input.getAttribute("aria-controls")).toBe(screen.getByRole("listbox").id);
    await user.keyboard("{ArrowDown}");
    const active = within(screen.getByRole("listbox")).getAllByRole("option")[0];
    expect(input.getAttribute("aria-activedescendant")).toBe(active.id);
  });
});

describe("suggestion lists", () => {
  it("covers every field that declares one", () => {
    for (const field of [
      "skills",
      "languages",
      "school",
      "degree",
      "jobTitle",
      "position",
      "issuer",
      "stack",
    ])
      expect(suggestionsFor(field), field).toBeTruthy();
    expect(suggestionsFor("summary")).toBeNull();
  });

  it("has no duplicates inside a list", () => {
    for (const [name, list] of Object.entries(SUGGESTIONS)) {
      const seen = list.map((v) => v.toLowerCase());
      expect(new Set(seen).size, name).toBe(seen.length);
    }
  });

  // C'est la règle demandée : les rubriques ne se mélangent pas. Une langue
  // n'est pas une compétence, un établissement n'est pas un diplôme.
  it("never mixes one rubric into another", () => {
    const skills = new Set(SKILLS.map((s) => s.toLowerCase()));
    for (const l of LANGUAGES) expect(skills.has(l.toLowerCase()), l).toBe(false);
    for (const s of SCHOOLS) expect(skills.has(s.toLowerCase()), s).toBe(false);
    const degrees = new Set(DEGREES.map((d) => d.toLowerCase()));
    for (const s of SCHOOLS) expect(degrees.has(s.toLowerCase()), s).toBe(false);
    const titles = new Set(JOB_TITLES.map((j) => j.toLowerCase()));
    for (const d of DEGREES) expect(titles.has(d.toLowerCase()), d).toBe(false);
    for (const i of CERT_ISSUERS) expect(skills.has(i.toLowerCase()), i).toBe(false);
  });

  it("keeps entries short enough to sit on a CV line", () => {
    for (const [name, list] of Object.entries(SUGGESTIONS))
      for (const v of list) expect(v.length, `${name}: ${v}`).toBeLessThanOrEqual(90);
  });

  // Les qualités de caractère ne se vérifient pas et desservent un CV : la
  // liste ne doit pas en proposer.
  it("suggests no unverifiable character traits as skills", () => {
    const banned = ["dynamique", "motivé", "sérieux", "ponctuel", "souriant", "rigoureux"];
    for (const s of SKILLS) expect(banned.includes(s.toLowerCase()), s).toBe(false);
  });
});
