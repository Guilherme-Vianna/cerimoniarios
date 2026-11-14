import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/link-button";
import { QUIZ_PATH } from "@/lib/auth/constants";

export const metadata: Metadata = { title: "Ajuda" };

const faq = [
  {
    question: "Como funciona a prova?",
    answer:
      "Toque em Começar prova: são 10 perguntas de todos os temas, do básico ao avançado, porque o cerimoniário precisa saber de tudo. Em Personalizar dá para escolher um tema e o tamanho. A IA (Gemini) escreve as perguntas. Você pode voltar e mudar respostas até entregar. Suas respostas ficam salvas neste aparelho se você fechar a página.",
  },
  {
    question: "E se a IA errar uma pergunta?",
    answer:
      "As perguntas seguem a Instrução Geral do Missal Romano (IGMR), mas a IA pode se enganar. Na dúvida, confira com o mestre de cerimônias da sua paróquia. Se a IA não responder, usamos um banco de perguntas revisado.",
  },
  {
    question: "De onde vêm os flashcards?",
    answer:
      "Cada pergunta que você erra (ou deixa em branco) vira um flashcard com a resposta e a explicação. Se errar de novo a mesma pergunta, o card volta para o começo.",
  },
  {
    question: "Como funciona a revisão?",
    answer:
      "É repetição espaçada, como no Anki. Depois de ver a resposta, diga como foi. Difícil, Bom e Fácil concluem o card e ele só volta daqui a alguns dias. Errei manda o card para o fim da fila, e ele aparece de novo na mesma sessão até você acertar. A barra mostra quantos você acertou de primeira, quantos acertou depois de errar e quantos ainda faltam repetir. Cansou? Toque em Encerrar por hoje: o que ficou para repetir volta na próxima revisão.",
  },
  {
    question: "Como ganho XP e subo no ranking?",
    answer:
      "10 XP por resposta certa, mais 20 se acertar a prova inteira. Cada flashcard revisado no dia certo vale de 1 a 3 XP. O ranking semanal recomeça toda segunda-feira; o geral soma tudo.",
  },
  {
    question: "O que é a sequência?",
    answer: "São os dias seguidos em que você ganhou XP. Uma prova ou uma revisão por dia já mantém a sequência.",
  },
];

const SOURCES = [
  {
    title: "Instrução Geral do Missal Romano (IGMR)",
    note: "Santa Sé, 3ª edição típica",
    url: "https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20030317_ordinamento-messale_en.html",
  },
  {
    title: "Normas Universais do Ano Litúrgico e do Calendário",
    note: "Texto das Normas (Liturgy Office)",
    url: "https://www.liturgyoffice.org/Calendar/Info/GNLY.pdf",
  },
  {
    title: "Mysterii Paschalis (1969)",
    note: "Paulo VI aprova as Normas e o Calendário",
    url: "https://www.vatican.va/content/paul-vi/pt/motu_proprio/documents/hf_p-vi_motu-proprio_19690214_mysterii-paschalis.html",
  },
  {
    title: "Missale Romanum (1969)",
    note: "Paulo VI promulga o Missal Romano",
    url: "https://www.vatican.va/content/paul-vi/pt/apost_constitutions/documents/hf_p-vi_apc_19690403_missale-romanum.html",
  },
];

const shortcuts = [
  ["1 a 4", "Escolher alternativa na prova / dar nota na revisão"],
  ["← →", "Pergunta anterior / próxima"],
  ["Espaço", "Mostrar a resposta do flashcard"],
];

export default function HelpPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10">
      <div>
        <h1 className="font-serif text-4xl font-bold tracking-tight">Como funciona</h1>
        <p className="mt-2 text-lg text-muted">Tudo o que você precisa saber em um minuto.</p>
      </div>

      <div className="flex flex-col gap-3">
        {faq.map((item) => (
          <details key={item.question} className="group rounded-3xl border border-border bg-surface">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
              {item.question}
              <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-180">
                ▾
              </span>
            </summary>
            <p className="px-5 pb-5 leading-relaxed text-muted">{item.answer}</p>
          </details>
        ))}
      </div>

      <section aria-labelledby="shortcuts-title" className="flex flex-col gap-3">
        <h2 id="shortcuts-title" className="text-xl font-semibold">
          Atalhos de teclado
        </h2>
        <dl className="divide-y divide-border rounded-3xl border border-border bg-surface">
          {shortcuts.map(([keys, description]) => (
            <div key={keys} className="flex items-center gap-4 px-5 py-3">
              <dt className="w-24 shrink-0">
                <kbd className="rounded-lg border border-border bg-canvas px-2 py-1 font-mono text-sm">{keys}</kbd>
              </dt>
              <dd className="text-muted">{description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="sources-title" className="flex flex-col gap-3">
        <h2 id="sources-title" className="text-xl font-semibold">
          Fontes
        </h2>
        <p className="text-muted">
          As perguntas do nosso banco citam o número do documento oficial. Toque em &quot;Fonte&quot; na correção ou no
          flashcard para abrir o texto.
        </p>
        <ul className="flex flex-col divide-y divide-border rounded-3xl border border-border bg-surface">
          {SOURCES.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-canvas focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
              >
                <span>
                  <span className="block font-medium">{source.title}</span>
                  <span className="text-sm text-muted">{source.note}</span>
                </span>
                <span aria-hidden="true" className="text-muted">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <LinkButton href={QUIZ_PATH} className="self-start">
        Fazer uma prova
      </LinkButton>
    </div>
  );
}
