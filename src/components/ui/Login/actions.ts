'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error, } = await supabase.auth.signInWithPassword(data)


  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(data: { email: string, password: string }) {
  const name = data.email.split('@')[0];
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ ...data, options: { data: { display_name: name } } })

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function isLogin() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session !== null
}