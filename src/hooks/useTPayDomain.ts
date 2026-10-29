import { useState, useEffect, useCallback } from 'react';
import { container } from '../../core/container';
import { DomainEventBus } from '../../core/shared/domain/DomainEventBus';
import type { SupportedLanguage, ExecutionMode } from '../../core/hybrid-assistant/domain/value-objects/VoiceIntent';
import type { InventoryItem } from '../../core/resource-tracking/merchant/domain/InventoryItem';
import type { MerchantSale } from '../../core/resource-tracking/merchant/domain/entities/MerchantSale';
import type { BudgetCategory } from '../../core/resource-tracking/budget/domain/entities/BudgetCategory';
import type { ExpenseRecord } from '../../core/resource-tracking/budget/domain/entities/ExpenseRecord';
import type { PassengerSeat } from '../../core/resource-tracking/transit/domain/entities/PassengerSeat';
import type { OfflineEscrowToken } from '../../core/escrow/domain/OfflineEscrowToken';

/**
 * React Hook for Merchant Sub-domain Use Cases
 */
export function useMerchantDomain() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<MerchantSale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const items = await container.inventoryRepository.findAll();
    const history = await container.inventoryRepository.getSales();
    setInventory([...items]);
    setSales([...history]);
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = () => refresh();
    DomainEventBus.subscribe('InventoryStockDeductedEvent', unsubscribe);
    DomainEventBus.subscribe('VoiceInventoryBatchImportedEvent', unsubscribe);
  }, [refresh]);

  const processVoiceSale = async (
    spokenQuery: string,
    matchedItemName: string,
    currencyAmount: number
  ) => {
    setIsLoading(true);
    const result = await container.processVoiceSaleUseCase.execute({
      spokenQuery,
      matchedItemName,
      currencyAmount,
      paymentMethod: 'bluetooth_escrow',
    });
    setIsLoading(false);
    if (result.isSuccess) {
      const data = result.getValue();
      setFeedback(data.spokenConfirmation);
      await refresh();
      return data;
    } else {
      setFeedback(result.error);
      throw new Error(result.error || 'Sale failed');
    }
  };

  const importVoiceInventory = async (spokenTranscript: string) => {
    setIsLoading(true);
    const result = await container.bulkImportVoiceInventoryUseCase.execute({ spokenTranscript });
    setIsLoading(false);
    if (result.isSuccess) {
      const data = result.getValue();
      setFeedback(data.spreadsheetSummaryText);
      await refresh();
      return data;
    } else {
      setFeedback(result.error);
      throw new Error(result.error || 'Import failed');
    }
  };

  const getDailyReconciliation = async () => {
    const result = await container.generateDailyReconciliationUseCase.execute();
    if (result.isSuccess) {
      return result.getValue();
    }
    throw new Error(result.error || 'Reconciliation failed');
  };

  return {
    inventory,
    sales,
    isLoading,
    feedback,
    setFeedback,
    processVoiceSale,
    importVoiceInventory,
    getDailyReconciliation,
    refresh,
  };
}

/**
 * React Hook for Personal Budget Sub-domain Use Cases
 */
export function useBudgetDomain() {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [pendingAmbiguity, setPendingAmbiguity] = useState<{
    amount: number;
    description: string;
    question: string;
    candidateCategories: { id: string; label: string }[];
  } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const plan = await container.budgetRepository.getBudgetPlan();
    const history = await container.budgetRepository.getExpenses();
    setCategories([...plan.categories]);
    setExpenses([...history]);
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = () => refresh();
    DomainEventBus.subscribe('ExpenseRecordedEvent', unsubscribe);
  }, [refresh]);

  const deductExpense = async (amount: number, description: string) => {
    const result = await container.deductBudgetExpenseUseCase.execute({
      amount,
      itemDescription: description,
    });

    if (result.isSuccess) {
      const data = result.getValue();
      if (data.status === 'AMBIGUITY_DETECTED') {
        setPendingAmbiguity({
          amount,
          description,
          question: data.clarificationQuestion || '',
          candidateCategories: data.candidateCategories || [],
        });
        setFeedback(data.spokenConfirmation);
        return data;
      } else {
        setPendingAmbiguity(null);
        setFeedback(data.spokenConfirmation);
        await refresh();
        return data;
      }
    } else {
      setFeedback(result.error);
      throw new Error(result.error || 'Budget deduction failed');
    }
  };

  const resolveAmbiguity = async (selectedCategoryId: string) => {
    if (!pendingAmbiguity) return;
    const result = await container.resolveCategoryAmbiguityUseCase.execute({
      selectedCategoryId,
      amount: pendingAmbiguity.amount,
      originalDescription: pendingAmbiguity.description,
    });
    if (result.isSuccess) {
      setPendingAmbiguity(null);
      setFeedback(result.getValue().spokenConfirmation);
      await refresh();
      return result.getValue();
    }
  };

  return {
    categories,
    expenses,
    pendingAmbiguity,
    feedback,
    setFeedback,
    deductExpense,
    resolveAmbiguity,
    refresh,
  };
}

/**
 * React Hook for Transit (Korope Fleet) Sub-domain Use Cases
 */
export function useTransitDomain() {
  const [seats, setSeats] = useState<PassengerSeat[]>([]);
  const [paidCount, setPaidCount] = useState(0);
  const [totalSeats, setTotalSeats] = useState(7);
  const [driverName, setDriverName] = useState('Morufu Transport');
  const [feedback, setFeedback] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const trip = await container.transitRepository.getActiveTrip();
    setSeats([...trip.seats]);
    setPaidCount(trip.paidSeatsCount);
    setTotalSeats(trip.totalSeats);
    setDriverName(trip.driverName);
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = () => refresh();
    DomainEventBus.subscribe('PassengerSeatPaidEvent', unsubscribe);
    DomainEventBus.subscribe('TripFullyCollectedEvent', unsubscribe);
  }, [refresh]);

  const collectFares = async () => {
    const result = await container.collectPassengerFaresUseCase.execute();
    if (result.isSuccess) {
      const data = result.getValue();
      setFeedback(data.spokenDriverAlert);
      await refresh();
      return data;
    } else {
      setFeedback(result.error);
      throw new Error(result.error || 'Failed to collect fares');
    }
  };

  return {
    seats,
    paidCount,
    totalSeats,
    driverName,
    feedback,
    setFeedback,
    collectFares,
    refresh,
  };
}

/**
 * React Hook for Offline Escrow & PayPal Settlement
 */
export function useEscrowDomain() {
  const [tokens, setTokens] = useState<OfflineEscrowToken[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const list = await container.escrowRepository.findAll();
    setTokens([...list]);
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = () => refresh();
    DomainEventBus.subscribe('EscrowTokenCreatedEvent', unsubscribe);
    DomainEventBus.subscribe('EscrowSettledViaPayPalEvent', unsubscribe);
  }, [refresh]);

  const toggleNetwork = async (online: boolean) => {
    setIsOnline(online);
    container.payPalGateway.setNetworkStatus(online);
    if (online) {
      const syncResult = await container.syncEscrowsToPayPalUseCase.execute('DEVICE-ME');
      if (syncResult.isSuccess) {
        setFeedback(syncResult.getValue().message);
        await refresh();
      }
    }
  };

  const createOfflinePayment = async (
    recipientDeviceId: string,
    recipientName: string,
    recipientAccount: string,
    amount: number
  ) => {
    const result = await container.createOfflineEscrowUseCase.execute({
      senderDeviceId: 'TPAY-PHONE-ME-01',
      senderName: 'Malik Olajuwon',
      senderAccount: '9102837461 (Offline)',
      recipientDeviceId,
      recipientName,
      recipientAccount,
      amount,
      currency: 'NGN',
    });

    if (result.isSuccess) {
      await refresh();
      return result.getValue();
    } else {
      throw new Error(result.error || 'Failed to create offline escrow');
    }
  };

  return {
    tokens,
    isOnline,
    feedback,
    setFeedback,
    toggleNetwork,
    createOfflinePayment,
    refresh,
  };
}

/**
 * React Hook for Hybrid Multilingual AI Voice Assistant
 */
export function useAssistantDomain() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  const processCommand = async (
    transcript: string,
    language: SupportedLanguage = 'pidgin',
    executionMode: ExecutionMode = 'offline_slm'
  ) => {
    setIsProcessing(true);
    const result = await container.processSpokenCommandUseCase.execute({
      transcript,
      language,
      executionMode,
    });
    setIsProcessing(false);

    if (result.isSuccess) {
      const data = result.getValue();
      setLastResponse(data.localizedSpokenText);
      return data;
    } else {
      setLastResponse(result.error);
      throw new Error(result.error || 'Assistant failed to process command');
    }
  };

  return {
    isProcessing,
    lastResponse,
    processCommand,
  };
}
