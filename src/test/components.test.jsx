import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import CVSheet from "../components/CVSheet";
import { normalizeData } from "../data/model";

function openEditor() {
  document.body.insertAdjacentHTML("beforeend", '<div id="print-root"></div>');
  window.location.hash = "#/editor";
  return render(<App />);
}

const sample = normalizeData({
  firstName: "Aïcha",
  lastName: "DOSSOU",
  jobTitle: "Développeuse web",
  email: "a@b.cc",
  github: "github.com/aicha",
  summary: "Profil.",
  birthDate: "12/03/2003",
  photo: "data:image/jpeg;base64,AAAA",
  education: [{ id: "e", school: "IFRI", degree: "Licence", startDate: "2024", endDate: "2027" }],
  experiences: [
    {
      id: "x",
      company: "DigiMama",
      position: "Stagiaire",
      startDate: "2026",
      current: true,
      description: "Un\nDeux",
    },
  ],
  projects: [{ id: "p", name: "Vitrine", stack: "React", link: "github.com/x" }],
  skills: [
    { id: "s", name: "React" },
    { id: "t", name: "Laravel" },
  ],
  languages: [{ id: "l", name: "Français", level: 3 }],
});

const headings = (container) => [...container.querySelectorAll("h2")].map((h) => h.textContent);

describe("CVSheet", () => {
  const sheet = (props) =>
    render(<CVSheet data={sample} templateId="stage" region="benin" cvLang="fr" {...props} />);

  it("follows the section order of each single-column model", () => {
    expect(headings(sheet({ templateId: "stage" }).container)).toEqual([
      "Profil",
      "Formation",
      "Projets",
      "Expériences",
      "Compétences",
      "Langues",
    ]);
  });

  it("puts skills first in the hybrid model and renames them", () => {
    expect(headings(sheet({ templateId: "hybride" }).container)[0]).toBe("Compétences clés");
  });

  it("uses two columns for the showcase model", () => {
    const { container } = sheet({ templateId: "vitrine" });
    expect(container.querySelector("aside")).not.toBeNull();
    expect(headings(container)).toContain("Contact");
  });

  it("shows photo, civil status and references only in Benin mode", () => {
    const benin = sheet({ region: "benin" }).container;
    expect(benin.querySelector("img")).not.toBeNull();
    expect(benin.textContent).toContain("Né(e) le 12/03/2003");
    expect(benin.textContent).toContain("Références disponibles sur demande.");
    const intl = sheet({ region: "international" }).container;
    expect(intl.querySelector("img")).toBeNull();
    expect(intl.textContent).not.toContain("Né(e) le");
    expect(intl.textContent).not.toContain("Références");
  });

  it("translates the CV labels independently of the interface", () => {
    const { container } = sheet({ cvLang: "en" });
    expect(headings(container)).toContain("Education");
    expect(container.textContent).toContain("Present");
  });

  it("renders real links and multi-line descriptions as bullets", () => {
    const { container } = sheet({});
    expect(container.querySelector('a[href="https://github.com/aicha"]')).not.toBeNull();
    expect(container.querySelectorAll("li")).toHaveLength(2);
  });
});

describe("Editor", () => {
  it("blocks the first step until the required fields are valid", async () => {
    const user = userEvent.setup();
    openEditor();
    await user.click(await screen.findByRole("button", { name: /Continuer/ }));
    expect(screen.getAllByText("Ce champ est requis.").length).toBe(4);
    expect(screen.getByLabelText(/Prénoms/).getAttribute("aria-invalid")).toBe("true");

    await user.type(screen.getByLabelText(/Prénoms/), "Aïcha");
    await user.type(screen.getByLabelText(/^Nom/), "DOSSOU");
    await user.type(screen.getByLabelText(/Poste visé/), "Développeuse");
    await user.type(screen.getByLabelText(/E-mail/), "pas-un-email");
    await user.click(screen.getByRole("button", { name: /Continuer/ }));
    expect(screen.getByText("Adresse e-mail non valide.")).toBeInTheDocument;
    expect(screen.queryByRole("heading", { name: "Profil", level: 1 })).toBeNull();

    await user.clear(screen.getByLabelText(/E-mail/));
    await user.type(screen.getByLabelText(/E-mail/), "a@b.cc");
    await user.click(screen.getByRole("button", { name: /Continuer/ }));
    expect(await screen.findByRole("heading", { name: "Profil", level: 1 })).toBeTruthy();
  });

  it("updates the preview as the user types", async () => {
    const user = userEvent.setup();
    const { container } = openEditor();
    await user.type(await screen.findByLabelText(/Prénoms/), "Aïcha");
    expect(container.querySelector("[data-preview] h1").textContent).toContain("Aïcha");
  });

  it("hides photo and civil status fields in International mode", async () => {
    const user = userEvent.setup();
    openEditor();
    expect(await screen.findByText("État civil (mode Bénin)")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "International" }));
    expect(screen.queryByText("État civil (mode Bénin)")).toBeNull();
  });

  it("autosaves to localStorage", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    openEditor();
    await user.type(await screen.findByLabelText(/Prénoms/), "Aïcha");
    await vi.advanceTimersByTimeAsync(600);
    expect(JSON.parse(localStorage.getItem("cvgen:v2")).data.firstName).toBe("Aïcha");
    vi.useRealTimers();
  });
});

describe("list editing (education step)", () => {
  async function goToEducation() {
    localStorage.setItem(
      "cvgen:v2",
      JSON.stringify({
        data: {},
        settings: { step: 2, region: "benin", cvLang: "fr", lang: "fr", template: "stage" },
      }),
    );
    const user = userEvent.setup();
    openEditor();
    await screen.findByRole("heading", { name: "Formation", level: 1 });
    return user;
  }

  const openForm = (user) =>
    user.click(screen.getAllByRole("button", { name: "Ajouter cette formation" })[0]);

  const add = async (user, school) => {
    await openForm(user);
    await user.type(screen.getByLabelText(/École ou université/), school);
    await user.click(screen.getByRole("button", { name: "Ajouter cette formation" }));
  };

  it("adds, reorders, edits and removes items", async () => {
    const user = await goToEducation();
    await add(user, "IFRI");
    await add(user, "Lycée");
    const titles = () =>
      screen
        .getAllByRole("listitem")
        .map((li) => li.textContent)
        .filter((t) => /IFRI|Lycée/.test(t));
    expect(titles()[0]).toContain("IFRI");

    await user.click(screen.getByRole("button", { name: "Monter : Lycée" }));
    expect(titles()[0]).toContain("Lycée");

    await user.click(screen.getByRole("button", { name: "Modifier : IFRI" }));
    const input = screen.getByLabelText(/École ou université/);
    await user.clear(input);
    await user.type(input, "Université");
    await user.click(screen.getByRole("button", { name: "Enregistrer les modifications" }));
    expect(screen.getByRole("button", { name: "Modifier : Université" })).toBeTruthy();

    // deleting now asks once, in the row itself, instead of a browser dialog
    await user.click(screen.getByRole("button", { name: "Supprimer : Lycée" }));
    expect(screen.getByText("Supprimer cet élément ?")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Supprimer", exact: true }));
    expect(screen.queryByRole("button", { name: "Modifier : Lycée" })).toBeNull();
  });

  it("refuses an item without its required field", async () => {
    const user = await goToEducation();
    await openForm(user);
    await user.click(screen.getByRole("button", { name: "Ajouter cette formation" }));
    expect(screen.getByText("Renseignez ce champ pour ajouter l'élément.")).toBeTruthy();
  });
});

describe("writing assistant", () => {
  it("suggests formal wording and applies it only on click", async () => {
    localStorage.setItem(
      "cvgen:v2",
      JSON.stringify({
        data: { summary: "Je suis bon en React." },
        settings: { step: 1, region: "benin", cvLang: "fr", lang: "fr", template: "stage" },
      }),
    );
    const user = userEvent.setup();
    openEditor();
    const box = await screen.findByLabelText(/Accroche professionnelle/);
    expect(box.value).toBe("Je suis bon en React.");
    await user.click(screen.getByRole("button", { name: "Remplacer" }));
    expect(box.value).toBe("je maîtrise React.");
  });

  it("builds three summaries from the guided fields", async () => {
    localStorage.setItem(
      "cvgen:v2",
      JSON.stringify({
        data: {},
        settings: { step: 1, region: "benin", cvLang: "fr", lang: "fr", template: "stage" },
      }),
    );
    const user = userEvent.setup();
    openEditor();
    await user.click(await screen.findByRole("button", { name: /M'aider à écrire/ }));
    await user.type(screen.getByLabelText("Filière ou spécialité"), "Informatique");
    await user.click(screen.getByRole("button", { name: "Proposer 3 accroches" }));
    expect(screen.getAllByRole("button", { name: "Utiliser" })).toHaveLength(3);
  });

  it("does not contact LanguageTool until the user clicks Verify", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    localStorage.setItem(
      "cvgen:v2",
      JSON.stringify({
        data: { summary: "Bonjour" },
        settings: { step: 1, region: "benin", cvLang: "fr", lang: "fr", template: "stage" },
      }),
    );
    const user = userEvent.setup();
    openEditor();
    await user.click(await screen.findByRole("button", { name: /Vérifier la grammaire/ }));
    expect(screen.getByText(/sera envoyé à LanguageTool/)).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe("date fields", () => {
  it("writes MM/YYYY from the two selects, so nothing depends on how the user types", async () => {
    localStorage.setItem(
      "cvgen:v2",
      JSON.stringify({
        data: {},
        settings: { step: 2, region: "benin", cvLang: "fr", lang: "fr", template: "stage" },
      }),
    );
    const user = userEvent.setup();
    openEditor();
    await user.click(await screen.findByRole("button", { name: "Ajouter cette formation" }));
    await user.type(screen.getByLabelText(/École ou université/), "IFRI");
    // month first on purpose: picking it before the year must not lose it
    await user.selectOptions(screen.getByLabelText("Début — Mois"), "09");
    expect(screen.getByLabelText("Début — Mois")).toHaveValue("09");
    await user.selectOptions(screen.getByLabelText("Début — Année"), "2024");
    await user.click(screen.getByRole("button", { name: "Ajouter cette formation" }));
    expect(screen.getAllByText(/09\/2024/).length).toBeGreaterThan(0);
  });

  it("re-reads a stored date into the selects", async () => {
    localStorage.setItem(
      "cvgen:v2",
      JSON.stringify({
        data: { education: [{ id: "e", school: "IFRI", startDate: "09/2024", endDate: "" }] },
        settings: { step: 2, region: "benin", cvLang: "fr", lang: "fr", template: "stage" },
      }),
    );
    const user = userEvent.setup();
    openEditor();
    await user.click(await screen.findByRole("button", { name: /Modifier : IFRI/ }));
    expect(screen.getByLabelText("Début — Mois")).toHaveValue("09");
    expect(screen.getByLabelText("Début — Année")).toHaveValue("2024");
  });

  it("keeps an older free-text date visible instead of silently dropping it", async () => {
    localStorage.setItem(
      "cvgen:v2",
      JSON.stringify({
        data: { education: [{ id: "e", school: "IFRI", startDate: "rentrée 2024", endDate: "" }] },
        settings: { step: 2, region: "benin", cvLang: "fr", lang: "fr", template: "stage" },
      }),
    );
    const user = userEvent.setup();
    openEditor();
    await user.click(await screen.findByRole("button", { name: /Modifier : IFRI/ }));
    expect(screen.getAllByText(/rentrée 2024/).length).toBeGreaterThan(0);
  });
});

describe("routing", () => {
  it("shows the landing page by default and the five models on the picker", async () => {
    window.location.hash = "";
    const { unmount } = render(<App />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Ton parcours");
    unmount();
    window.location.hash = "#/models";
    render(<App />);
    expect(await screen.findAllByRole("button", { name: /Utiliser ce modèle|Modèle actuel/ })).toHaveLength(
      5,
    );
  });

  it("switches the interface language", async () => {
    window.location.hash = "";
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Your path");
    expect(document.documentElement.lang).toBe("en");
  });
});
