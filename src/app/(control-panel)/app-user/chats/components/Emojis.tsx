import { Dialog, DialogTitle, DialogContent, Tabs, Tab } from '@mui/material';
import { useState } from 'react';

const emojiList1 = [
  '😀',
  '😁',
  '😂',
  '🤣',
  '😃',
  '😄',
  '😅',
  '😆',
  '😉',
  '😊',
  '😋',
  '😎',
  '😍',
  '😘',
  '🥰',
  '😗',
  '😙',
  '😚',
  '🙂',
  '🤗',
  '🤩',
  '🤔',
  '🤨',
  '😐',
  '😑',
  '😶',
  '🙄',
  '😏',
  '😣',
  '😥',
  '😮',
  '🤐',
  '😯',
  '😪',
  '😫',
  '🥱',
  '😴',
  '😌',
  '😛',
  '😜',
  '😝',
  '🤤',
  '😒',
  '😓',
  '😔',
  '😕',
  '🙃',
  '🤑',
  '😲',
  '☹️',
  '🙁',
  '😖',
  '😞',
  '😟',
  '😤',
  '😢',
  '😭',
  '😦',
  '😧',
  '😨',
  '😩',
  '🤯',
  '😬',
  '😰',
  '😱',
  '🥵',
  '🥶',
  '😳',
  '🤪',
  '😵',
  '😡',
  '😠',
  '🤬',
  '😷',
  '🤒',
  '🤕',
  '🤢',
  '🤮',
  '🤧',
  '😇',
  '🥳',
  // ...adicione mais se quiser
];

const emojiList2 = [
  '👋', // aceno
  '🤚', // mão levantada
  '🖐️', // mão aberta
  '✋', // mão levantada (sem preenchimento)
  '🖖', // saudação vulcana
  '👌', // ok
  '🤌', // mão italiana
  '🤏', // beliscando
  '✌️', // paz
  '🤞', // dedos cruzados
  '🤟', // amo você em linguagem de sinais
  '🤘', // rock
  '🤙', // shaka (hang loose)
  '🫱', // mão direita
  '🫲', // mão esquerda
  '🫳', // palma para baixo
  '🫴', // palma para cima
  '🫵', // apontando para frente
  '🫶', // mãos formando coração
  '🙏', // mãos em prece
  '👍', // joinha
  '👎', // joinha para baixo
  '👏', // palmas
  '🙌', // mãos para o alto
  '👐', // mãos abertas
  '🤲', // mãos juntas
  '🤝', // aperto de mãos
  '✍️', // escrevendo
  '💪', // bíceps
  '🦾', // braço mecânico
  '☝️', // dedo apontando para cima
  '👆', // dedo indicador para cima
  '👇', // dedo indicador para baixo
  '👉', // dedo indicador para direita
  '👈', // dedo indicador para esquerda
  '🫰', // mão fazendo coração coreano
  '🫷', // mão empurrando para a esquerda
  '🫸', // mão empurrando para a direita
  // Outros tipos populares
  '🔥', // fogo
  '💯', // 100
  '🎉', // festa
  '❤️', // coração
  '💔', // coração partido
  '✨', // brilho
  '⭐', // estrela
  '🌟', // estrela brilhante
  '⚡', // raio
  '🎶', // música
  '🎵', // nota musical
  '🚀', // foguete
  '🏆', // troféu
  '🥇', // medalha de ouro
  '🥈', // medalha de prata
  '🥉', // medalha de bronze
  '🏅', // medalha
  '👑', // coroa
  '🧠', // cérebro
  '🦄', // unicórnio
  '😺', // gato sorrindo
  '😸', // gato alegre
  '😻', // gato apaixonado
  '🙈', // macaco não vê
  '🙉', // macaco não ouve
  '🙊', // macaco não fala
  '💩', // cocô
  '🤡', // palhaço
  '👻', // fantasma
  '🤖', // robô
  '🎃', // abóbora
  '🛒', // carrinho de compras
  '📦', // caixa
  '🗓️', // calendário
  '📌', // alfinete
  '📎', // clipe
  '🔒', // cadeado
  '🔑', // chave
  '🔔', // sino
  '💡', // lâmpada
  '📱', // celular
  '💻', // notebook
  '🖥️', // computador
  '🕹️', // joystick
  '🎲', // dado
  '🎯', // alvo
  '🧩', // quebra-cabeça
  '🛡️', // escudo
  '⚽', // futebol
  '🏀', // basquete
  '🏈', // futebol americano
  '⚾', // beisebol
  '🎾', // tênis
  '🏐', // vôlei
  '🏓', // ping pong
  '🥅', // gol
];

interface EmojisProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSelect: (emoji: string) => void;
}

function Emojis({ onSelect, open = false, setOpen }: EmojisProps) {
  const [tab, setTab] = useState(0);
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  const handleEmojiClick = (emoji: string) => {
    if (onSelect) onSelect(emoji);

    setOpen(false);
  };
  const emojiList = tab === 0 ? emojiList1 : emojiList2;

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Tabs value={tab} onChange={handleTabChange} centered>
            <Tab label="Emojis" />
            <Tab label="Diversos" />
          </Tabs>
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-wrap gap-2 p-2" style={{ maxHeight: 350, overflowY: 'auto' }}>
            {emojiList.map((emoji, i) => (
              <button
                key={i}
                type="button"
                className="text-5xl hover:scale-125 transition-transform bg-transparent border-none cursor-pointer"
                style={{ background: 'none', border: 'none', padding: 4 }}
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Emojis;
