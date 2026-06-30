import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journalApi, type JournalEntry } from '../api/journal';

export const useJournalEntry = (date: string) =>
  useQuery({
    queryKey: ['journal', date],
    queryFn: () => journalApi.get(date).then((r) => r.data.data.entry),
    staleTime: 60_000,
    retry: false,
  });

export const useSaveJournal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { date: string; content: string; mood: number | null }) =>
      journalApi.save(data).then((r) => r.data.data.entry),
    onSuccess: (entry: JournalEntry) => {
      qc.setQueryData(['journal', entry.date], entry);
    },
  });
};

export const useJournalHistory = (enabled: boolean) =>
  useQuery({
    queryKey: ['journal-history'],
    queryFn: () => journalApi.history().then((r) => r.data.data.entries),
    staleTime: 60_000,
    enabled,
  });
