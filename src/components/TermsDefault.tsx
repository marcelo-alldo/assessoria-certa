import { Container, Typography, Divider, Box } from '@mui/material';

export function TermsDefault() {
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom id="terms">
        Termos de Uso
      </Typography>
      <Typography variant="body1" paragraph>
        Alldo Assistente - Alldo Tecnologia Ltda - CNPJ 57.804.074/0001-06
      </Typography>
      <Typography variant="caption" display="block" gutterBottom>
        Última atualização: 30 de maio de 2025
      </Typography>

      <Box mt={3}>
        <Typography variant="h6">1. Aceitação dos Termos</Typography>
        <Typography variant="body1" paragraph>
          Ao utilizar a plataforma Alldo Assistente, você concorda com os presentes Termos de Uso. Caso não concorde, não utilize a plataforma.
        </Typography>

        <Typography variant="h6">2. Descrição do Serviço</Typography>
        <Typography variant="body1" paragraph>
          A Alldo Assistente é uma aplicação baseada em inteligência artificial desenvolvida pela Alldo Tecnologia Ltda, que interage com leads e
          contatos via WhatsApp de forma automatizada.
        </Typography>

        <Typography variant="h6">3. Cadastro e Acesso</Typography>
        <Typography variant="body1" paragraph>
          O usuário deve fornecer informações verídicas e manter seus dados atualizados. A responsabilidade pela guarda das credenciais de acesso é
          exclusivamente do usuário.
        </Typography>

        <Typography variant="h6">4. Responsabilidade pelo Uso</Typography>
        <Typography variant="body1" paragraph>
          É expressamente proibido o envio de mensagens em massa (spam) ou comunicações não solicitadas. Caso o número de WhatsApp do usuário seja
          bloqueado por uso indevido, a responsabilidade será exclusivamente do usuário.
        </Typography>

        <Typography variant="h6">5. Limitações de Uso</Typography>
        <Typography variant="body1" paragraph>
          É vedado utilizar a ferramenta para fins ilegais, abusivos ou fraudulentos, tentar acessar o sistema da Alldo sem autorização ou realizar
          engenharia reversa.
        </Typography>

        <Typography variant="h6">6. Suspensão ou Cancelamento</Typography>
        <Typography variant="body1" paragraph>
          A Alldo poderá suspender ou encerrar contas que violem estes Termos ou causem danos à plataforma.
        </Typography>

        <Typography variant="h6">7. Modificações nos Termos</Typography>
        <Typography variant="body1" paragraph>
          Estes Termos podem ser atualizados periodicamente. O uso contínuo da plataforma após modificações indica aceitação das novas condições.
        </Typography>

        <Typography variant="h6">8. Foro</Typography>
        <Typography variant="body1" paragraph>
          Fica eleito o foro da comarca de Novo Hamburgo/RS para resolver quaisquer questões oriundas destes Termos.
        </Typography>
      </Box>

      <Divider sx={{ my: 5 }} id="start-privacy" />

      <Typography variant="h4" gutterBottom>
        Política de Privacidade
      </Typography>
      <Typography variant="body1" paragraph>
        Alldo Assistente - Alldo Tecnologia Ltda - CNPJ 57.804.074/0001-06
      </Typography>
      <Typography variant="caption" display="block" gutterBottom>
        Última atualização: 30 de maio de 2025
      </Typography>

      <Box mt={3}>
        <Typography variant="h6">1. Coleta de Dados</Typography>
        <Typography variant="body1" paragraph>
          Coletamos informações fornecidas voluntariamente como nome, e-mail, número de WhatsApp, dados de conversas com o bot, IP e navegador.
        </Typography>

        <Typography variant="h6">2. Uso das Informações</Typography>
        <Typography variant="body1" paragraph>
          As informações são usadas para operar e melhorar o serviço, responder automaticamente e cumprir obrigações legais.
        </Typography>

        <Typography variant="h6">3. Compartilhamento de Dados</Typography>
        <Typography variant="body1" paragraph>
          Não compartilhamos dados com terceiros, exceto quando exigido por lei ou para operação da plataforma (ex: integrações com WhatsApp API).
        </Typography>

        <Typography variant="h6">4. Segurança</Typography>
        <Typography variant="body1" paragraph>
          Adotamos medidas de segurança para proteger seus dados. No entanto, nenhum sistema é 100% seguro e há risco residual.
        </Typography>

        <Typography variant="h6">5. Armazenamento e Retenção</Typography>
        <Typography variant="body1" paragraph>
          Os dados são armazenados com segurança e mantidos pelo tempo necessário conforme a finalidade ou exigência legal.
        </Typography>

        <Typography variant="h6">6. Direitos do Titular</Typography>
        <Typography variant="body1" paragraph>
          Você pode solicitar acesso, correção, exclusão ou portabilidade dos seus dados. Contato: contato@alldohost.com.br
        </Typography>

        <Typography variant="h6">7. Uso de Cookies</Typography>
        <Typography variant="body1" paragraph>
          Utilizamos cookies para melhorar a experiência do usuário. Eles podem ser desativados no navegador, com possíveis impactos no uso.
        </Typography>

        <Typography variant="h6">8. Alterações nesta Política</Typography>
        <Typography variant="body1" paragraph>
          Esta política pode ser modificada a qualquer momento. Alterações relevantes serão comunicadas pelos canais cadastrados.
        </Typography>

        <Typography variant="h6">9. Contato</Typography>
        <Typography variant="body1" paragraph>
          Dúvidas ou solicitações: contato@alldohost.com.br
        </Typography>
      </Box>
    </Container>
  );
}
