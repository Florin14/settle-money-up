import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { calculateSplits, type SplitInput } from '@/features/splitting/splitCalculator';
import type {
  Expense,
  ExpenseCategory,
  ExpenseSplit,
  PersonalMonthlySummary,
  Profile,
  SplitType,
} from '@/types/database.types';
import { groupKeys } from './useGroups';

export const expenseKeys = {
  personal: (month?: string) => ['expenses', 'personal', month ?? 'all'] as const,
  personalSummary: ['expenses', 'personal', 'summary'] as const,
  byGroup: (groupId: string) => ['expenses', 'group', groupId] as const,
};

// ---------------------------------------------------------------------------
// Personal expenses
// ---------------------------------------------------------------------------

/** @param month first day of the month, 'YYYY-MM-01'; omit for full history */
export function usePersonalExpenses(month?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: expenseKeys.personal(month),
    enabled: !!user,
    queryFn: async (): Promise<Expense[]> => {
      let query = supabase
        .from('expenses')
        .select('*')
        .is('group_id', null)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (month) {
        const start = new Date(`${month}T00:00:00Z`);
        const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
        query = query
          .gte('expense_date', start.toISOString().slice(0, 10))
          .lt('expense_date', end.toISOString().slice(0, 10));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

/** Monthly totals per category from the personal_monthly_summary view. */
export function usePersonalMonthlySummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: expenseKeys.personalSummary,
    enabled: !!user,
    queryFn: async (): Promise<PersonalMonthlySummary[]> => {
      const { data, error } = await supabase
        .from('personal_monthly_summary')
        .select('*')
        .order('month', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export interface CreatePersonalExpenseInput {
  description: string;
  amount: number;
  category: ExpenseCategory;
  currency?: string;
  expenseDate?: string;
  notes?: string;
}

export function useCreatePersonalExpense() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreatePersonalExpenseInput): Promise<Expense> => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          group_id: null,
          payer_id: user.id,
          created_by: user.id,
          description: input.description,
          amount: input.amount,
          category: input.category,
          currency: input.currency ?? 'EUR',
          expense_date: input.expenseDate,
          notes: input.notes ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', 'personal'] });
    },
  });
}

/** Works for both personal and group expenses; RLS decides who may delete. */
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expense: { id: string; group_id: string | null }) => {
      const { error } = await supabase.from('expenses').delete().eq('id', expense.id);
      if (error) throw error;
    },
    onSuccess: (_data, expense) => {
      if (expense.group_id) {
        queryClient.invalidateQueries({ queryKey: expenseKeys.byGroup(expense.group_id) });
        queryClient.invalidateQueries({ queryKey: ['balances', expense.group_id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['expenses', 'personal'] });
      }
    },
  });
}

// ---------------------------------------------------------------------------
// Group expenses
// ---------------------------------------------------------------------------

export type GroupExpenseWithDetails = Expense & {
  payer: Profile;
  splits: ExpenseSplit[];
};

export function useGroupExpenses(groupId: string) {
  return useQuery({
    queryKey: expenseKeys.byGroup(groupId),
    enabled: !!groupId,
    queryFn: async (): Promise<GroupExpenseWithDetails[]> => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, payer:profiles!expenses_payer_id_fkey(*), splits:expense_splits(*)')
        .eq('group_id', groupId)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as GroupExpenseWithDetails[];
    },
  });
}

export interface CreateGroupExpenseInput {
  groupId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  splitType: SplitType;
  payerId: string;
  /** Who participated and (for amount/percentage splits) their share. */
  participants: SplitInput[];
  expenseDate?: string;
}

/**
 * Resolves splits client-side (validated: they sum exactly to the total),
 * then calls the create_group_expense RPC so expense + splits are inserted
 * in one transaction, validated again by the deferred DB trigger.
 */
export function useCreateGroupExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGroupExpenseInput): Promise<Expense> => {
      const splits = calculateSplits(input.splitType, input.amount, input.participants);

      const { data, error } = await supabase.rpc('create_group_expense', {
        p_group_id: input.groupId,
        p_description: input.description,
        p_amount: input.amount,
        p_category: input.category,
        p_split_type: input.splitType,
        p_expense_date: input.expenseDate ?? null,
        p_payer_id: input.payerId,
        p_splits: splits.map((s) => ({
          user_id: s.userId,
          amount: s.amount,
          share_value: s.shareValue,
        })),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.byGroup(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(variables.groupId) });
      // prefix match: refreshes both the group settlement and the "my events" list
      queryClient.invalidateQueries({ queryKey: ['balances'] });
    },
  });
}
