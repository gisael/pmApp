'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface DbNote {
  id: string;
  user_id: string;
  content: string;
  work_date: string;
  updated_at: string;
}

export function useDailyReflection(workDate: string): [string, (notes: string) => void, boolean] {
  const [reflection, setReflectionState] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [noteId, setNoteId] = useState<string | null>(null);
  const supabase = createClient();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch reflection for the specified work date
  useEffect(() => {
    const fetchReflection = async () => {
      setLoading(true);
      setReflectionState('');
      setNoteId(null);

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('work_date', workDate)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No note exists for this date yet, that's fine
          setReflectionState('');
        } else {
          console.error('Error fetching reflection:', error);
        }
      } else if (data) {
        const dbNote = data as DbNote;
        setReflectionState(dbNote.content);
        setNoteId(dbNote.id);
      }
      setLoading(false);
    };

    fetchReflection();
  }, [supabase, workDate]);

  const setReflection = useCallback(
    (newReflection: string) => {
      // Optimistic update
      setReflectionState(newReflection);

      // Debounce database writes
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(async () => {
        if (noteId) {
          // Update existing note
          const { error } = await supabase
            .from('notes')
            .update({ content: newReflection, updated_at: new Date().toISOString() })
            .eq('id', noteId);

          if (error) {
            console.error('Error updating reflection:', error);
          }
        } else {
          // Create new note for this date
          const { data, error } = await supabase
            .from('notes')
            .insert({ content: newReflection, work_date: workDate })
            .select()
            .single();

          if (error) {
            console.error('Error creating reflection:', error);
          } else if (data) {
            setNoteId((data as DbNote).id);
          }
        }
      }, 500); // 500ms debounce
    },
    [noteId, supabase, workDate]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return [reflection, setReflection, loading];
}
