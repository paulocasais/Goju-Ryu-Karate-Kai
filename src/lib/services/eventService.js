import { createClient } from '@/lib/supabase'

const supabase = createClient()

export const eventService = {
  async getAll() {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('data_inicio', { ascending: false })
    if (error) throw error
    return data
  },

  async getActive() {
    const now = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .gte('data_fim', now)
      .eq('status', 'aberto')
    if (error) throw error
    return data
  },

  async save(event) {
    const { data, error } = await supabase
      .from('eventos')
      .upsert(event)
      .select()
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase.from('eventos').delete().eq('id', id)
    if (error) throw error
  },

  getDefaultImage() {
    return 'https://images.unsplash.com/photo-1555597673-b21d5c935865'
  }
}