'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface DbNote {
  id: string;
  user_id: string;
  content: string;
  updated_at: string;
}

export function useNotes(): [string, (notes: string) => void, boolean] {
  const [notes, setNotesState] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [noteId, setNoteId] = useState<string | null>(null);
  const supabase = createClient();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch notes on mount
  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No note exists yet, that's fine
          setNotesState('');
        } else {
          console.error('Error fetching notes:', error);
        }
      } else if (data) {
        const dbNote = data as DbNote;
        setNotesState(dbNote.content);
        setNoteId(dbNote.id);
      }
      setLoading(false);
    };

    fetchNotes();
  }, [supabase]);

  const setNotes = useCallback(
    (newNotes: string) => {
      // Optimistic update
      setNotesState(newNotes);

      // Debounce database writes
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(async () => {
        if (noteId) {
          // Update existing note
          const { error } = await supabase
            .from('notes')
            .update({ content: newNotes, updated_at: new Date().toISOString() })
            .eq('id', noteId);

          if (error) {
            console.error('Error updating notes:', error);
          }
        } else {
          // Create new note
          const { data, error } = await supabase
            .from('notes')
            .insert({ content: newNotes })
            .select()
            .single();

          if (error) {
            console.error('Error creating notes:', error);
          } else if (data) {
            setNoteId((data as DbNote).id);
          }
        }
      }, 500); // 500ms debounce
    },
    [noteId, supabase]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return [notes, setNotes, loading];
}
