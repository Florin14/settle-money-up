/**
 * Database types matching supabase/migrations/00001_init.sql.
 *
 * After any schema change, regenerate with:
 *   npx supabase gen types typescript --project-id <ref> --schema public > src/types/database.types.ts
 * (wired up as `npm run gen:types`; hand-authored here in the same shape the
 * generator produces so the app compiles before you run it.)
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'utilities'
  | 'housing'
  | 'entertainment'
  | 'health'
  | 'shopping'
  | 'travel'
  | 'education'
  | 'other';

export type SplitType = 'equal' | 'amount' | 'percentage';

export type GroupRole = 'owner' | 'member';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          currency: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          currency?: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          currency?: string;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'groups_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      group_members: {
        Row: {
          group_id: string;
          user_id: string;
          role: GroupRole;
          joined_at: string;
        };
        Insert: {
          group_id: string;
          user_id: string;
          role?: GroupRole;
          joined_at?: string;
        };
        Update: {
          group_id?: string;
          user_id?: string;
          role?: GroupRole;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'group_members_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      expenses: {
        Row: {
          id: string;
          group_id: string | null;
          payer_id: string;
          created_by: string;
          description: string;
          amount: number;
          currency: string;
          category: ExpenseCategory;
          split_type: SplitType;
          expense_date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id?: string | null;
          payer_id: string;
          created_by: string;
          description: string;
          amount: number;
          currency?: string;
          category?: ExpenseCategory;
          split_type?: SplitType;
          expense_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string | null;
          payer_id?: string;
          created_by?: string;
          description?: string;
          amount?: number;
          currency?: string;
          category?: ExpenseCategory;
          split_type?: SplitType;
          expense_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'expenses_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'expenses_payer_id_fkey';
            columns: ['payer_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'expenses_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      expense_splits: {
        Row: {
          expense_id: string;
          user_id: string;
          amount: number;
          share_value: number | null;
        };
        Insert: {
          expense_id: string;
          user_id: string;
          amount: number;
          share_value?: number | null;
        };
        Update: {
          expense_id?: string;
          user_id?: string;
          amount?: number;
          share_value?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'expense_splits_expense_id_fkey';
            columns: ['expense_id'];
            isOneToOne: false;
            referencedRelation: 'expenses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'expense_splits_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      group_balances: {
        Row: {
          group_id: string;
          user_id: string;
          total_paid: number;
          total_owed: number;
          net_balance: number;
          currency: string;
        };
        Relationships: [];
      };
      my_expenses: {
        Row: {
          id: string;
          group_id: string | null;
          group_name: string | null;
          payer_id: string;
          created_by: string;
          description: string;
          category: ExpenseCategory;
          currency: string;
          split_type: SplitType;
          expense_date: string;
          notes: string | null;
          created_at: string;
          total_amount: number;
          my_share: number;
          paid_by_me: boolean;
        };
        Relationships: [];
      };
      personal_monthly_summary: {
        Row: {
          user_id: string;
          month: string;
          category: ExpenseCategory;
          expense_count: number;
          total: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_group_expense: {
        Args: {
          p_group_id: string;
          p_description: string;
          p_amount: number;
          p_category: ExpenseCategory;
          p_split_type: SplitType;
          p_expense_date: string | null;
          p_payer_id: string;
          p_splits: Json;
          p_currency?: string | null;
        };
        Returns: Database['public']['Tables']['expenses']['Row'];
      };
      add_group_member_by_email: {
        Args: { p_group_id: string; p_email: string };
        Returns: Database['public']['Tables']['group_members']['Row'];
      };
      is_group_member: {
        Args: { _group_id: string; _user_id?: string };
        Returns: boolean;
      };
      is_group_owner: {
        Args: { _group_id: string; _user_id?: string };
        Returns: boolean;
      };
      shares_group_with: {
        Args: { _profile_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      expense_category: ExpenseCategory;
      split_type: SplitType;
      group_role: GroupRole;
    };
    CompositeTypes: Record<string, never>;
  };
}

// Convenience aliases used across the app
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Group = Database['public']['Tables']['groups']['Row'];
export type GroupMember = Database['public']['Tables']['group_members']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type ExpenseSplit = Database['public']['Tables']['expense_splits']['Row'];
export type GroupBalance = Database['public']['Views']['group_balances']['Row'];
export type MyExpense = Database['public']['Views']['my_expenses']['Row'];
export type PersonalMonthlySummary =
  Database['public']['Views']['personal_monthly_summary']['Row'];
