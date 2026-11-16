import type { Metadata } from "next";
import Link from "next/link";
import { ContactLink, LegalSection } from "@/components/legal/legal-section";
import { LinkButton } from "@/components/ui/link-button";
import { ACCOUNT_PATH, PRIVACY_PATH } from "@/lib/auth/constants";

export const metadata: Metadata = { title: "Excluir conta" };

export default function DeleteAccountInfoPage() {
  return (
    <>
      <div>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-ink">Excluir sua conta</h1>
        <p className="mt-2 text-lg text-muted">Você pode excluir sua conta do Cerimoniários a qualquer momento.</p>
      </div>

      <LegalSection title="Como excluir">
        <ul>
          <li>Entre no Cerimoniários com sua conta Google, no site ou no app para Android.</li>
          <li>Toque na sua foto, no canto de cima, e escolha Minha conta.</li>
          <li>Toque em Excluir minha conta e confirme com a sua conta Google.</li>
        </ul>
        <p>
          Se não conseguir entrar, peça a exclusão <ContactLink />, escrevendo do e-mail da conta Google que você usa
          no app.
        </p>
      </LegalSection>

      <LegalSection title="O que é apagado">
        <p>
          Apagamos na hora e de forma definitiva seu cadastro (nome, e-mail e foto), suas provas e respostas, seus
          flashcards e seu XP. Você também sai do ranking. Não guardamos cópia desses dados.
        </p>
        <p>
          Contribuições feitas pela Google Play ficam registradas na sua conta Google, conforme as regras da Google. Veja
          também a <Link href={PRIVACY_PATH}>política de privacidade</Link>.
        </p>
      </LegalSection>

      <LinkButton href={ACCOUNT_PATH} className="self-start">
        Entrar e excluir minha conta
      </LinkButton>
    </>
  );
}
