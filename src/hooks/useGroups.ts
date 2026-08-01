import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Group, GroupMember, Profile } from '@/types/database.types';

export const groupKeys = {
  all: ['groups'] as const,
  detail: (id: string) => ['groups', id] as const,
  members: (id: string) => ['groups', id, 'members'] as const,
};

export function useGroups() {
  const { user } = useAuth();
  return useQuery({
    queryKey: groupKeys.all,
    enabled: !!user,
    queryFn: async (): Promise<Group[]> => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export type MemberWithProfile = GroupMember & { profile: Profile };

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: groupKeys.members(groupId),
    enabled: !!groupId,
    queryFn: async (): Promise<MemberWithProfile[]> => {
      const { data, error } = await supabase
        .from('group_members')
        .select('*, profile:profiles(*)')
        .eq('group_id', groupId)
        .order('joined_at');
      if (error) throw error;
      return data as MemberWithProfile[];
    },
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { name: string; description?: string; currency?: string }) => {
      if (!user) throw new Error('Not authenticated');
      // The on_group_created trigger auto-adds the creator as owner.
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: input.name,
          description: input.description ?? null,
          currency: input.currency ?? 'EUR',
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: groupKeys.all }),
  });
}

export function useAddMemberByEmail(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.rpc('add_group_member_by_email', {
        p_group_id: groupId,
        p_email: email,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) }),
  });
}
