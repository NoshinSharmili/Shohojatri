"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { CHILDREN_KEY, childKey } from "@/lib/children/queries";

import { CONSENT_VERSION, type SavedAnswer, type Screening } from "./rules";

type NewScreening = components["schemas"]["CreateScreeningRequest"];
type AnswerBody = components["schemas"]["AnswerRequest"];

export const screeningKey = (screeningId: number) => ["screenings", screeningId] as const;
const childScreeningsKey = (childId: number) => [...childKey(childId), "screenings"] as const;

/** One screening with its items and answers: everything the flow needs to resume. */
export function useScreening(screeningId: number) {
  return useQuery({
    queryKey: screeningKey(screeningId),
    queryFn: () =>
      unwrap(
        api.GET("/api/v1/screenings/{screening_id}", {
          params: { path: { screening_id: screeningId } },
        }),
      ),
  });
}

export function useChildScreenings(childId: number | null) {
  return useQuery({
    queryKey: childScreeningsKey(childId ?? 0),
    queryFn: () =>
      unwrap(
        api.GET("/api/v1/children/{child_id}/screenings", {
          params: { path: { child_id: childId ?? 0 } },
        }),
      ),
    enabled: childId !== null,
  });
}

/** After any change: the screening itself, and the progress shown on the home cards. */
function useStoreScreening() {
  const queryClient = useQueryClient();
  return (screening: Screening) => {
    queryClient.setQueryData(screeningKey(screening.id), screening);
    void queryClient.invalidateQueries({ queryKey: childScreeningsKey(screening.child_id) });
  };
}

export function useCreateScreening() {
  const store = useStoreScreening();
  return useMutation({
    mutationFn: (body: NewScreening) => unwrap(api.POST("/api/v1/screenings", { body })),
    onSuccess: store,
  });
}

export function useDeleteScreening() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (screeningId: number) =>
      unwrap(
        api.DELETE("/api/v1/screenings/{screening_id}", {
          params: { path: { screening_id: screeningId } },
        }),
      ),
    onSuccess: (_, screeningId) => {
      queryClient.removeQueries({ queryKey: screeningKey(screeningId) });
      void queryClient.invalidateQueries({ queryKey: CHILDREN_KEY });
    },
  });
}

export function useAcceptConsent(screeningId: number) {
  const store = useStoreScreening();
  return useMutation({
    mutationFn: () =>
      unwrap(
        api.POST("/api/v1/screenings/{screening_id}/consent", {
          params: { path: { screening_id: screeningId } },
          body: { version: CONSENT_VERSION },
        }),
      ),
    onSuccess: store,
  });
}

/** Writes an answer into the cached screening, so progress and back/forward stay in step. */
function useMergeAnswer(screeningId: number) {
  const queryClient = useQueryClient();
  return (answer: SavedAnswer) => {
    queryClient.setQueryData<Screening>(screeningKey(screeningId), (screening) => {
      if (!screening) return screening;
      const answers = [...screening.answers.filter((a) => a.item_id !== answer.item_id), answer];
      return {
        ...screening,
        answers,
        answered: answers.filter((a) => a.final).length,
      };
    });
  };
}

export function useSaveAnswer(screeningId: number) {
  const merge = useMergeAnswer(screeningId);
  return useMutation({
    mutationFn: ({ itemId, ...body }: AnswerBody & { itemId: string }) =>
      unwrap(
        api.PUT("/api/v1/screenings/{screening_id}/answers/{item_id}", {
          params: { path: { screening_id: screeningId, item_id: itemId } },
          body,
        }),
      ),
    onSuccess: merge,
  });
}

/** Saves the parent's own words (waiting for confirmation) and gets the AI's suggestion. */
export function useMapOther(screeningId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, otherText }: { itemId: string; otherText: string }) =>
      unwrap(
        api.POST("/api/v1/screenings/{screening_id}/answers/{item_id}/map-other", {
          params: { path: { screening_id: screeningId, item_id: itemId } },
          body: { other_text: otherText },
        }),
      ),
    // The server stored a pending answer; refetch rather than rebuild it here.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: screeningKey(screeningId) }),
  });
}

export function useCompleteQuestionnaire(screeningId: number) {
  const store = useStoreScreening();
  return useMutation({
    mutationFn: (note: string) =>
      unwrap(
        api.POST("/api/v1/screenings/{screening_id}/questionnaire", {
          params: { path: { screening_id: screeningId } },
          body: { note: note.trim() || null },
        }),
      ),
    onSuccess: store,
  });
}

type TaskUpload = components["schemas"]["TaskUpload"];
type TaskSlug = components["schemas"]["TaskOut"]["task"];
type FixtureTask = TaskSlug | "joint_attention_live";
export type DemoProfile = "typical" | "elevated" | "noisy";
type Audience = "parent" | "clinician";

/** One activity's features (never media); the API scores it straight away. */
export function useUploadTask(screeningId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ task, upload }: { task: TaskSlug; upload: TaskUpload }) =>
      unwrap(
        api.POST("/api/v1/screenings/{screening_id}/tasks/{task}", {
          params: { path: { screening_id: screeningId, task } },
          body: upload,
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: screeningKey(screeningId) }),
  });
}

/** The parent skipped an activity: excluded from the score, never counted as a concern. */
export function useSkipTask(screeningId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: TaskSlug) =>
      unwrap(
        api.POST("/api/v1/screenings/{screening_id}/tasks/{task}/skip", {
          params: { path: { screening_id: screeningId, task } },
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: screeningKey(screeningId) }),
  });
}

/** A recorded sample session for demo mode (SCREENING_SPEC §9), ready to upload as it is. */
export async function fetchDemoTask(
  task: FixtureTask,
  profile: DemoProfile,
): Promise<{ task: TaskSlug; upload: TaskUpload }> {
  const demo = await unwrap(
    api.GET("/api/v1/demo/screening-tasks/{fixture_task}", {
      params: { path: { fixture_task: task }, query: { profile } },
    }),
  );
  // Same model both ways; the generated response type just widens keypoint tuples to arrays.
  return { task: demo.task, upload: demo.upload as TaskUpload };
}

/** Scores everything and stores the result; the screening becomes read-only. */
export function useFinalizeScreening(screeningId: number) {
  const store = useStoreScreening();
  return useMutation({
    mutationFn: () =>
      unwrap(
        api.POST("/api/v1/screenings/{screening_id}/finalize", {
          params: { path: { screening_id: screeningId } },
        }),
      ),
    onSuccess: store,
  });
}

export function useScreeningReport(screeningId: number, audience: Audience) {
  return useQuery({
    queryKey: [...screeningKey(screeningId), "report", audience],
    queryFn: () =>
      unwrap(
        api.GET("/api/v1/screenings/{screening_id}/report", {
          params: { path: { screening_id: screeningId }, query: { audience } },
        }),
      ),
    // A finalized report never changes.
    staleTime: Infinity,
  });
}

const sharesKey = (screeningId: number) => [...screeningKey(screeningId), "shares"] as const;
const latestLinkKey = (screeningId: number) => [...screeningKey(screeningId), "link"] as const;
export type ShareLink = components["schemas"]["ShareCreated"];

export function useShares(screeningId: number) {
  return useQuery({
    queryKey: sharesKey(screeningId),
    queryFn: () =>
      unwrap(
        api.GET("/api/v1/screenings/{screening_id}/shares", {
          params: { path: { screening_id: screeningId } },
        }),
      ),
  });
}

export function useCreateShare(screeningId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expiresInDays: 1 | 7 | 30) =>
      unwrap(
        api.POST("/api/v1/screenings/{screening_id}/shares", {
          params: { path: { screening_id: screeningId } },
          body: { expires_in_days: expiresInDays },
        }),
      ),
    onSuccess: (link) => {
      queryClient.setQueryData(latestLinkKey(screeningId), link);
      void queryClient.invalidateQueries({ queryKey: sharesKey(screeningId) });
    },
  });
}

/** The link made in this session, if any. The API keeps only a hash of each token, so after a
 *  reload the parent makes a new link rather than seeing an old one again. */
export function useLatestShareLink(screeningId: number): ShareLink | null {
  const query = useQuery<ShareLink | null>({
    queryKey: latestLinkKey(screeningId),
    queryFn: () => null,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  return query.data ?? null;
}

export function useRevokeShare(screeningId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shareId: number) =>
      unwrap(api.DELETE("/api/v1/shares/{share_id}", { params: { path: { share_id: shareId } } })),
    onSuccess: (share) => {
      queryClient.setQueryData<ShareLink | null>(latestLinkKey(screeningId), (link) =>
        link?.id === share.id ? null : link,
      );
      void queryClient.invalidateQueries({ queryKey: sharesKey(screeningId) });
    },
  });
}

/** The public view of a share link. Every fetch counts as a view, so fetch once. */
export function useSharedReport(token: string) {
  return useQuery({
    queryKey: ["share", token],
    queryFn: () => unwrap(api.GET("/api/v1/share/{token}", { params: { path: { token } } })),
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
