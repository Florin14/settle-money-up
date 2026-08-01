import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { calculateSettlement, type SettlementTransaction } from '@/features/splitting/settlement';
import type { GroupBalance } from '@/types/database.types';

export interface GroupSettlement {
  balances: GroupBalance[];
  transactions: SettlementTransaction[];
}

/**
 * Fetches net balances from the group_balances view and derives the
 * settlement plan ("Alex owes Bogdan 20.00") with the greedy matcher.
 */
/** The caller's balance row in every group — the "per event" summary. */
export function useMyEventBalances() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['balances', 'mine'],
    enabled: !!user,
    queryFn: async (): Promise<GroupBalance[]> => {
      const { data, error } = await supabase
        .from('group_balances')
        .select('*')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data;
    },
  });
}

export function useGroupSettlement(groupId: string) {
  return useQuery({
    queryKey: ['balances', groupId],
    enabled: !!groupId,
    queryFn: async (): Promise<GroupSettlement> => {
      const { data, error } = await supabase
        .from('group_balances')
        .select('*')
        .eq('group_id', groupId);
      if (error) throw error;

      return {
        balances: data,
        transactions: calculateSettlement(data),
      };
    },
  });
}
