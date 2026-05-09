import { useState, useEffect } from 'react'
import type { Course } from '../types'
import { MOCK_COURSES, MOCK_ENROLLED_COURSES } from '../data/mock'
import { supabase } from '../lib/supabase'
import { USE_MOCK_DATA } from '../lib/features'

function fallbackCourses() {
  return USE_MOCK_DATA ? MOCK_COURSES : []
}

function fallbackEnrolledCourses() {
  return USE_MOCK_DATA
    ? MOCK_COURSES.filter(c => MOCK_ENROLLED_COURSES.includes(c.id))
    : []
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        if (supabase) {
          const { data, error: dbError } = await supabase
            .from('courses')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false })
          if (dbError) throw dbError
          if (data && data.length > 0) {
            setCourses(data as Course[])
            return
          }
        }
        setCourses(fallbackCourses())
      } catch (err) {
        console.error('[useCourses]', err)
        setError('Não foi possível carregar os cursos.')
        setCourses(fallbackCourses())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { courses, loading, error }
}

export function useEnrolledCourses(userId: string) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        if (supabase) {
          const { data: enrollments, error: enrError } = await supabase
            .from('enrollments')
            .select('course_id')
            .eq('user_id', userId)
          if (enrError) throw enrError
          const ids = enrollments?.map((e: { course_id: string }) => e.course_id) ?? []
          if (ids.length > 0) {
            const { data, error: crsError } = await supabase
              .from('courses')
              .select('*')
              .in('id', ids)
            if (crsError) throw crsError
            if (data) { setCourses(data as Course[]); return }
          }
        }
        setCourses(fallbackEnrolledCourses())
      } catch (err) {
        console.error('[useEnrolledCourses]', err)
        setError('Não foi possível carregar seus cursos.')
        setCourses(fallbackEnrolledCourses())
      } finally {
        setLoading(false)
      }
    }
    if (userId) load()
    else setLoading(false)
  }, [userId])

  return { courses, loading, error }
}

export function useCourse(id: string) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        if (supabase) {
          const { data, error: dbError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .single()
          if (dbError && dbError.code !== 'PGRST116') throw dbError
          if (data) { setCourse(data as Course); return }
        }
        setCourse(USE_MOCK_DATA ? MOCK_COURSES.find(c => c.id === id) ?? null : null)
      } catch (err) {
        console.error('[useCourse]', err)
        setError('Não foi possível carregar o curso.')
        setCourse(USE_MOCK_DATA ? MOCK_COURSES.find(c => c.id === id) ?? null : null)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
    else setLoading(false)
  }, [id])

  return { course, loading, error }
}
