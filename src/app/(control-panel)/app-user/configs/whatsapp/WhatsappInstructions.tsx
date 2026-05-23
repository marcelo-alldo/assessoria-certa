import React, { useState, useRef, useEffect } from 'react';

interface Step {
  id: number;
  title: string;
  content: React.ReactNode;
  color: string;
}

const WhatsappInstructions: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const steps: Step[] = [
    {
      id: 1,
      title: 'Iniciar Conexão',
      color: 'neutral',
      content: (
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-4 text-slate-800">1. Iniciar Conexão</h4>
          </div>
          <div className="space-y-4 text-slate-600">
            <p className="text-base">
              Clique no botão <strong>"Login com Facebook"</strong>.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Autenticação Facebook',
      color: 'neutral',
      content: (
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-4 text-slate-800">2. Autenticação Facebook</h4>
          </div>
          <div className="space-y-4 text-slate-600">
            <p className="mb-4">Dependendo do seu status no Facebook, você verá uma das seguintes opções:</p>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <h5 className="font-medium text-slate-800 mb-2">Se já estiver logado:</h5>
                <ul className="text-sm space-y-1 text-slate-600">
                  <li>
                    • Mensagem: <strong>"Continuar como [seu nome]?"</strong>
                  </li>
                  <li>
                    • Clique em <strong>"Continuar como [seu nome]"</strong>
                  </li>
                  <li>
                    • Se não for a conta correta: <strong>"Entrar em outra conta"</strong>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <h5 className="font-medium text-slate-800 mb-2">Se não estiver logado:</h5>
                <ul className="text-sm space-y-1 text-slate-600">
                  <li>
                    • Digite seu <strong>e-mail ou telefone</strong> e <strong>senha</strong>
                  </li>
                  <li>
                    • Clique em <strong>"Entrar"</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Conectar à Alldo',
      color: 'neutral',
      content: (
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-4 text-slate-800">3. Conectar à Alldo Tecnologia</h4>
          </div>
          <div className="space-y-4 text-slate-600">
            <p>
              Será exibida uma tela pedindo para conectar sua conta à <strong>Alldo Tecnologia</strong>.
            </p>

            <div className="bg-slate-50 p-4 rounded border border-slate-200">
              <h5 className="font-medium text-slate-800 mb-3">Permissões compartilhadas:</h5>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  • <strong>Gerenciar números de telefone</strong>
                </li>
                <li>
                  • <strong>Enviar e receber mensagens</strong>
                </li>
                <li>
                  • <strong>Acessar métricas</strong>
                </li>
              </ul>
            </div>

            <p>
              Para continuar, clique no botão <strong>"Começar"</strong>.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: 'Dados da Empresa',
      color: 'neutral',
      content: (
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-4 text-slate-800">4. Preencher Dados da Empresa</h4>
          </div>
          <div className="space-y-4 text-slate-600">
            <p className="mb-4">
              Será exibida a tela <strong>"Preencha os dados da empresa"</strong>:
            </p>

            <div className="bg-slate-50 p-4 rounded border border-slate-200">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="text-slate-500 font-bold mr-3">1.</span>
                  <div>
                    <strong>Portfólio empresarial:</strong> Escolha existente ou crie novo
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-slate-500 font-bold mr-3">2.</span>
                  <div>
                    <strong>Nome da empresa:</strong> Digite o nome oficial
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-slate-500 font-bold mr-3">3.</span>
                  <div>
                    <strong>Site ou perfil comercial:</strong> URL da empresa
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-slate-500 font-bold mr-3">4.</span>
                  <div>
                    <strong>País:</strong> Selecione o país da empresa
                  </div>
                </li>
              </ul>
            </div>

            <p>
              Clique em <strong>"Avançar"</strong> para prosseguir
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: 'Conta WhatsApp Business',
      color: 'neutral',
      content: (
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-4 text-slate-800">5. Escolher Conta do WhatsApp Business</h4>
          </div>
          <div className="space-y-4 text-slate-600">
            <p className="mb-4">Você verá a lista de contas disponíveis:</p>

            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <h5 className="font-medium text-slate-800 mb-2">Se você já tem uma conta:</h5>
                <p className="text-sm text-slate-600">
                  Selecione sua <strong>conta do WhatsApp Business</strong> existente
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <h5 className="font-medium text-slate-800 mb-2">Se não tem uma conta:</h5>
                <p className="text-sm text-slate-600">
                  Escolha <strong>"Criar uma conta do WhatsApp Business"</strong>
                </p>
              </div>
            </div>

            <p>
              Clique em <strong>"Avançar"</strong> após fazer sua escolha
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: 'Perfil WhatsApp Business',
      color: 'neutral',
      content: (
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-4 text-slate-800">6. Escolher ou Criar Perfil</h4>
          </div>
          <div className="space-y-4 text-slate-600">
            <p className="mb-4">O sistema pedirá para você escolher um perfil:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <h5 className="font-medium text-slate-800 mb-2">Perfil Existente</h5>
                <p className="text-sm text-slate-600">
                  Se já existir um <strong>perfil verificado</strong>, recomendamos selecioná-lo
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <h5 className="font-medium text-slate-800 mb-2">Novo Perfil</h5>
                <p className="text-sm text-slate-600">
                  Para primeira configuração, escolha <strong>"Criar um novo perfil"</strong>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded border border-slate-200">
              <h5 className="font-medium text-slate-800 mb-2">Se criar novo perfil:</h5>
              <ul className="text-sm space-y-1 text-slate-600">
                <li>
                  • <strong>Nome da conta:</strong> nome da sua empresa
                </li>
                <li>
                  • <strong>Nome de exibição:</strong> como aparecerá para clientes
                </li>
                <li>
                  • <strong>Categoria:</strong> tipo do seu negócio
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      title: 'Número do WhatsApp',
      color: 'neutral',
      content: (
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-4 text-slate-800">7. Adicionar Número de Telefone</h4>
          </div>
          <div className="space-y-4 text-slate-600">
            <p className="mb-4">Escolha entre duas opções:</p>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <h5 className="font-medium text-slate-800 mb-2">Usar somente um nome de exibição</h5>
                <ul className="text-sm space-y-1 text-slate-600">
                  <li>
                    • Mensagens mostram somente seu <strong>nome de exibição</strong>
                  </li>
                  <li>
                    • <strong>Nenhum número</strong> será vinculado às mensagens
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <h5 className="font-medium text-slate-800 mb-2">Adicionar novo número</h5>
                <ul className="text-sm space-y-1 text-slate-600">
                  <li>
                    • Será necessário <strong>verificar o número</strong>
                  </li>
                  <li>• Número usado para enviar mensagens</li>
                </ul>
              </div>
            </div>

            <p>
              Selecione a opção e clique em <strong>"Avançar"</strong>
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 8,
      title: 'Finalizar Configuração',
      color: 'neutral',
      content: (
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-4 text-slate-800">8. Analisar Solicitação de Acesso</h4>
          </div>
          <div className="space-y-4 text-slate-600">
            <p className="mb-4">
              Tela <strong>"Analise a solicitação de acesso do app Alldo"</strong>
            </p>

            <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-4">
              <h5 className="font-medium text-slate-800 mb-3">O que o Alldo poderá fazer:</h5>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  • <strong>Gerenciar suas contas do WhatsApp</strong>
                </li>
                <li>
                  • <strong>Acessar e gerenciar conversas</strong>
                </li>
                <li>
                  • <strong>Registrar eventos e enviar para o Meta</strong>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-center">
                <h5 className="font-medium text-slate-800 mb-1">Voltar</h5>
                <p className="text-xs text-slate-500">Alterar configurações</p>
              </div>
              <div className="bg-slate-100 p-3 rounded border border-slate-300 text-center">
                <h5 className="font-medium text-slate-800 mb-1">Confirmar</h5>
                <p className="text-xs text-slate-500">Finalizar integração</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded border border-slate-200">
              <p className="text-slate-800 font-medium text-center">
                <strong>Parabéns!</strong> Após confirmar, seu WhatsApp estará conectado!
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;

    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    const threshold = 100;

    if (translateX > threshold && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (translateX < -threshold && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }

    setTranslateX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep(currentStep - 1);
      } else if (e.key === 'ArrowRight' && currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, steps.length]);

  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  return (
    <div className="mb-6 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 p-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 text-center">Como conectar seu WhatsApp</h3>
        <p className="text-sm text-slate-500 text-center mt-1">
          Deslize para navegar entre os passos • {currentStep + 1} de {steps.length}
        </p>
      </div>

      {/* Slider Container */}
      <div className="relative h-96 overflow-hidden">
        <div
          ref={sliderRef}
          className="flex h-full transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(calc(-${currentStep * 100}% + ${isDragging ? translateX : 0}px))`,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={isDragging ? handleMouseMove : undefined}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {steps.map((step, index) => (
            <div key={step.id} className="w-full flex-shrink-0 h-full overflow-y-auto">
              {step.content}
            </div>
          ))}
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center items-center p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex space-x-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentStep ? 'bg-slate-600 scale-125' : 'bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center p-4 bg-slate-50 border-t border-slate-200">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            currentStep === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-600 text-white hover:bg-slate-700'
          }`}
        >
          ← Anterior
        </button>

        <span className="text-sm text-slate-600 font-medium">{steps[currentStep].title}</span>

        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            currentStep === steps.length - 1 ? 'bg-slate-600 text-white cursor-default' : 'bg-slate-600 text-white hover:bg-slate-700'
          }`}
        >
          {currentStep === steps.length - 1 ? 'Concluído' : 'Próximo →'}
        </button>
      </div>
    </div>
  );
};

export default WhatsappInstructions;
