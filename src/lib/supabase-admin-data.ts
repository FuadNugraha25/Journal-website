import { supabaseAdmin } from './supabase-admin';

export async function updateInitialCapital(newCapital: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from('settings')
    .upsert(
      [
        {
          key: 'initial_capital',
          value: newCapital.toString(),
        },
      ],
      { onConflict: 'key' }
    );

  if (error) {
    console.error('Admin: Error updating initial capital:', error);
    throw new Error('Failed to update initial capital');
  }
}
