import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Card {
  uid: string;
  userUid: string | null;
  position: number;
  name: string;
  email: string;
  phone: string;
  ieRg: string | null;
  cpf: string | null;
  cnpj: string | null;
  fantasyName: string | null;
  stepUid: string;
  birthDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Step {
  uid: string;
  name: string;
  position: number;
  userUid: string | null;
  type: string;
  description: string | null;
  enable: boolean;
  createdAt: string;
  updatedAt: string;
  leads: Card[];
  clients: Card[];
}

export interface boardSliceType {
  steps: Step[];
  aiAutomatic?: boolean;
}

const initialState: boardSliceType = {
  steps: [],
  aiAutomatic: false,
};

export const boardSlice = createSlice({
  name: 'boardSlice',
  initialState,
  reducers: {
    setAiAutomatic: (state, action: PayloadAction<{ aiAutomatic: boolean }>) => {
      state.aiAutomatic = action.payload.aiAutomatic;
    },
    setStep: (state, action: PayloadAction<{ steps: Step[] }>) => {
      state.steps = action.payload.steps;
    },
    changeCard: (
      state,
      action: PayloadAction<{
        fromStepUid: string;
        toStepUid: string;
        cardUid: string;
        position: number;
        type: 'client' | 'lead';
      }>,
    ) => {
      const { fromStepUid, toStepUid, cardUid, position, type } = action.payload;
      const fromStep = state.steps.find((s) => s.uid === fromStepUid);
      const toStep = state.steps.find((s) => s.uid === toStepUid);

      if (!fromStep || !toStep) return;

      // Limite de 50 cards para o step de posição 2 (apenas para leads)
      if (type === 'lead' && toStep?.uid === import.meta.env.VITE_APP_START_CONVERSATION_UID && toStep.leads.length >= 50) {
        return;
      }

      // Determina qual array usar baseado no type
      const cardsArray = type === 'lead' ? 'leads' : 'clients';

      // Encontra o card e sua posição original
      const cardIndex = fromStep[cardsArray].findIndex((c) => c.uid === cardUid);

      if (cardIndex === -1) {
        return;
      }

      const [card] = fromStep[cardsArray].splice(cardIndex, 1);

      // Decrementa a posição dos cards acima do card removido no step de origem
      fromStep[cardsArray].forEach((c) => {
        if (c.position > card.position) {
          c.position -= 1;
        }
      });

      // Atualiza o stepUid e a nova posição do card
      card.stepUid = toStepUid;
      card.position = position;

      // Incrementa a posição dos cards no step de destino que estão na posição >= à nova posição
      toStep[cardsArray].forEach((c) => {
        if (c.position >= position) {
          c.position += 1;
        }
      });

      // Insere o card na posição correta
      toStep[cardsArray].push(card);
      // Reordena os cards do step de destino pelo campo position
      toStep[cardsArray].sort((a, b) => a.position - b.position);
    },
    changeStep: (
      state,
      action: PayloadAction<{
        fromPosition: number;
        toPosition: number;
      }>,
    ) => {
      const { fromPosition, toPosition } = action.payload;
      const steps = state.steps;
      const stepIndex = steps.findIndex((s) => s.position === fromPosition);

      if (stepIndex === -1) return;

      const [step] = steps.splice(stepIndex, 1);

      // Ajusta posições dos steps entre fromPosition e toPosition
      if (fromPosition < toPosition) {
        // Move para frente: decrementa posição dos steps entre from+1 e to
        steps.forEach((s) => {
          if (s.position > fromPosition && s.position <= toPosition) {
            s.position -= 1;
          }
        });
      } else if (fromPosition > toPosition) {
        // Move para trás: incrementa posição dos steps entre to e from-1
        steps.forEach((s) => {
          if (s.position >= toPosition && s.position < fromPosition) {
            s.position += 1;
          }
        });
      }

      step.position = toPosition;
      steps.push(step);
      // Reordena os steps pelo campo position
      steps.sort((a, b) => a.position - b.position);
    },
    addStep: (state, action: PayloadAction<Step>) => {
      const newStep = action.payload;

      // Ajusta posições dos steps que estão na posição >= à nova posição
      state.steps.forEach((s) => {
        if (s.position >= newStep.position) {
          s.position += 1;
        }
      });
      state.steps.push(newStep);
      // Reordena os steps pelo campo position
      state.steps.sort((a, b) => a.position - b.position);
    },
    removeStep: (state, action: PayloadAction<string>) => {
      const uid = action.payload;
      const stepIndex = state.steps.findIndex((s) => s.uid === uid);

      if (stepIndex === -1) return;

      const removedStep = state.steps.splice(stepIndex, 1)[0];
      // Ajusta posições dos steps após o removido
      state.steps.forEach((s) => {
        if (s.position > removedStep.position) {
          s.position -= 1;
        }
      });
      // Reordena os steps pelo campo position
      state.steps.sort((a, b) => a.position - b.position);
    },
    renameStep: (state, action: PayloadAction<{ uid: string; name: string }>) => {
      const { uid, name } = action.payload;
      const step = state.steps.find((s) => s.uid === uid);

      if (step) {
        step.name = name;
      }
    },
  },
});

export const { setStep, changeCard, changeStep, addStep, removeStep, setAiAutomatic, renameStep } = boardSlice.actions;
export default boardSlice.reducer;
