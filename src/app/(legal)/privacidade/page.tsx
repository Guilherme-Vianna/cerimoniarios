import type { Metadata } from "next";
import Link from "next/link";
import { ContactLink, LegalSection } from "@/components/legal/legal-section";
import { ACCOUNT_PATH, DELETE_ACCOUNT_INFO_PATH } from "@/lib/auth/constants";
import { PRIVACY_UPDATED_AT } from "@/lib/legal";

export const metadata: Metadata = { title: "Política de privacidade" };

export default function PrivacyPage() {
  return (
    <>
      <div>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-ink">Política de privacidade</h1>
        <p className="mt-2 text-muted">Última atualização: {PRIVACY_UPDATED_AT}</p>
      </div>

      <p className="text-lg leading-relaxed text-muted">
        O Cerimoniários Católicos é um app gratuito para cerimoniários e acólitos estudarem a liturgia da Missa, no site e no app
        para Android. Esta página explica quais dados usamos, por quê e como você pode apagá-los, de acordo com a Lei
        Geral de Proteção de Dados (LGPD).
      </p>

      <LegalSection title="Dados que coletamos">
        <ul>
          <li>
            <strong>Conta:</strong> se você entra com o Google, recebemos nome, e-mail, foto de perfil e um identificador
            da conta. Se cria uma conta com e-mail e senha, guardamos o nome e o e-mail que você informou; a senha fica
            só com o Firebase Authentication, nunca conosco.
          </li>
          <li>
            <strong>Visitante:</strong> quem faz uma prova sem entrar recebe um identificador anônimo, sem nome nem
            e-mail. Quando você entra, as provas, os flashcards e o XP feitos como visitante passam para a sua conta.
          </li>
          <li>
            <strong>Seu estudo:</strong> as provas que você faz e as respostas, os flashcards, as revisões e os pontos de
            XP.
          </li>
          <li>
            <strong>Neste aparelho:</strong> um cookie de sessão para manter você conectado e as respostas de uma prova
            em andamento, guardadas no navegador até você entregar a prova.
          </li>
          <li>
            <strong>No app para Android:</strong> se os anúncios estiverem ligados, o Google AdMob usa o ID de
            publicidade e informações do aparelho para mostrar e medir anúncios. Contribuições são pagas pela Google
            Play: nós recebemos só a confirmação da compra, nunca os dados do cartão ou do pagamento.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Como usamos os dados">
        <ul>
          <li>Identificar você e guardar seu progresso.</li>
          <li>Montar provas e revisões, priorizando os temas em que você erra mais.</li>
          <li>
            Mostrar o ranking: <strong>seu nome, sua foto e seu XP ficam visíveis para quem usa o app</strong>. Visitantes
            não aparecem no ranking.
          </li>
          <li>No app para Android, mostrar anúncios e remover os anúncios de quem contribuiu.</li>
        </ul>
        <p>
          Não vendemos seus dados. Para gerar perguntas, a IA recebe os temas da prova, os temas em que você mais erra e
          as perguntas que você já fez, mas nunca seu nome, e-mail ou foto.
        </p>
      </LegalSection>

      <LegalSection title="Com quem compartilhamos">
        <p>Usamos serviços de terceiros que tratam dados em nosso nome:</p>
        <ul>
          <li>Google Firebase Authentication, para o login (Google, e-mail e senha ou visitante).</li>
          <li>Neon, banco de dados onde ficam suas provas, flashcards e XP.</li>
          <li>Vercel, que hospeda o site.</li>
          <li>Google Gemini, que gera as perguntas (sem dados que identifiquem você).</li>
          <li>Google Ads e Google Analytics, para medir os anúncios do site.</li>
          <li>Google AdMob e Google Play, no app para Android.</li>
        </ul>
        <p>Alguns desses serviços guardam dados fora do Brasil, com as garantias previstas na LGPD.</p>
      </LegalSection>

      <LegalSection title="Anúncios">
        <p>
          No app para Android, quem não contribuiu vê um banner pequeno, que pode ser desligado a qualquer momento em
          Apoiar → Anúncios. Quando a lei exige, o app pede seu consentimento antes de mostrar anúncios
          personalizados; você pode mudar a escolha em Apoiar → Privacidade dos anúncios.
        </p>
      </LegalSection>

      <LegalSection title="Medição de anúncios e doações">
        <p>
          O site usa a Google Tag (Google Ads e Google Analytics) para saber quais anúncios trazem pessoas que realmente
          estudam. Ela usa cookies e registra ações como entregar uma prova, criar conta, compartilhar a pontuação e
          copiar a chave Pix, sem enviar seu nome, e-mail ou respostas. Você pode bloquear esses cookies nas
          configurações do navegador e ver ou limitar os anúncios personalizados em{" "}
          <a href="https://myadcenter.google.com" target="_blank" rel="noreferrer">
            myadcenter.google.com
          </a>
          .
        </p>
        <p>
          Doações por Pix são feitas no app do seu banco. Como em qualquer Pix, quem recebe vê o nome de quem pagou; não
          recebemos nenhum outro dado bancário.
        </p>
      </LegalSection>

      <LegalSection title="Por quanto tempo guardamos">
        <p>
          Guardamos seus dados enquanto sua conta existir. Ao excluir a conta, apagamos na hora suas provas, flashcards,
          XP e cadastro, e você sai do ranking. Provas de visitante que nunca passarem para uma conta ficam guardadas só
          com o identificador anônimo.
        </p>
      </LegalSection>

      <LegalSection title="Seus direitos">
        <p>
          Você pode pedir acesso, correção ou exclusão dos seus dados e tirar dúvidas sobre esta política{" "}
          <ContactLink />. Para excluir a conta você mesmo, entre no Cerimoniários e abra{" "}
          <Link href={ACCOUNT_PATH}>Minha conta</Link>; veja o passo a passo em{" "}
          <Link href={DELETE_ACCOUNT_INFO_PATH}>Excluir conta</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Crianças e adolescentes">
        <p>
          Muitos cerimoniários são jovens. Quem tem menos de 12 anos deve usar o Cerimoniários com autorização de um dos
          pais ou responsável. Os anúncios do app são limitados a conteúdo para todas as idades.
        </p>
      </LegalSection>

      <LegalSection title="Mudanças">
        <p>Se esta política mudar, atualizamos esta página e a data no topo.</p>
      </LegalSection>
    </>
  );
}
