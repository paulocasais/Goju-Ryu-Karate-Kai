import { createClient } from '@/lib/supabase'

const supabase = createClient()

export const newsService = {
    async getAll() {
        const { data, error } = await supabase
            .from('noticias')
            .select('*')
            .order('created_at', { ascending: false })
        if (error) throw error
        return data
    },

    async save(news) {
        const { data, error } = await supabase
            .from('noticias')
            .upsert(news)
            .select()
        if (error) throw error
        return data[0]
    },

    async delete(id) {
        const { error } = await supabase
            .from('noticias')
            .delete()
            .eq('id', id)
        if (error) throw error
    }
}