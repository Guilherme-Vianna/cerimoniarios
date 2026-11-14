export const TOPICS = [
  {
    key: "partes_missa",
    label: "Partes da Missa",
    description: "Ritos iniciais, Liturgia da Palavra, Liturgia Eucarística e ritos finais.",
  },
  {
    key: "objetos",
    label: "Objetos e vasos sagrados",
    description: "Cálice, patena, âmbula, galhetas, turíbulo, naveta, alfaias e afins.",
  },
  {
    key: "vestes",
    label: "Vestes litúrgicas",
    description: "Alva, estola, casula, dalmática, pluvial, túnica e sobrepeliz.",
  },
  {
    key: "ano_liturgico",
    label: "Ano litúrgico e cores",
    description: "Tempos litúrgicos, solenidades, festas e o uso de cada cor.",
  },
  {
    key: "funcoes",
    label: "Funções do cerimoniário",
    description: "Cruciferário, ceroferários, turiferário, naveteiro, librífero e o mestre de cerimônias.",
  },
  {
    key: "gestos",
    label: "Gestos e posturas",
    description: "Genuflexão, inclinações, quando ficar de pé, sentado ou ajoelhado.",
  },
  {
    key: "livros",
    label: "Livros litúrgicos",
    description: "Missal, Lecionário, Evangeliário e a Instrução Geral do Missal Romano.",
  },
] as const;

export type TopicKey = (typeof TOPICS)[number]["key"];

export const TOPIC_KEYS = TOPICS.map((topic) => topic.key) as TopicKey[];

export function isTopic(value: unknown): value is TopicKey {
  return typeof value === "string" && (TOPIC_KEYS as string[]).includes(value);
}

export function topicLabel(topic: string | null) {
  if (topic === null) return "Todos os temas";
  return TOPICS.find((item) => item.key === topic)?.label ?? topic;
}

const IGMR_URL =
  "https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20030317_ordinamento-messale_en.html";

const REFERENCE_SOURCES: [string, string][] = [
  ["igmr", IGMR_URL],
  ["instrução geral", IGMR_URL],
  ["normas universais", "https://www.liturgyoffice.org/Calendar/Info/GNLY.pdf"],
  [
    "missale romanum",
    "https://www.vatican.va/content/paul-vi/pt/apost_constitutions/documents/hf_p-vi_apc_19690403_missale-romanum.html",
  ],
  [
    "mysterii paschalis",
    "https://www.vatican.va/content/paul-vi/pt/motu_proprio/documents/hf_p-vi_motu-proprio_19690214_mysterii-paschalis.html",
  ],
];

export function referenceUrl(reference: string | null) {
  if (!reference) return null;
  const lowered = reference.toLowerCase();
  return REFERENCE_SOURCES.find(([key]) => lowered.includes(key))?.[1] ?? null;
}
