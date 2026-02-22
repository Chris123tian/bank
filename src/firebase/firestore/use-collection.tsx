
'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook to listen to a Firestore collection or query.
 * Includes "Nuclear Guard" logic to prevent unauthorized requests during hydration.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean})  | null | undefined,
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 1. INPUT GUARD: Prevent execution if ref is missing or null
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      return;
    }

    let pathString = '';
    let isGroupQuery = false;
    
    try {
      const q = memoizedTargetRefOrQuery as any;
      if ('path' in memoizedTargetRefOrQuery) {
        pathString = (memoizedTargetRefOrQuery as CollectionReference).path;
      } else {
        // Fallback for query path detection
        pathString = q._query?.path?.canonicalString() || 'Query';
        if (q._query?.collectionGroup) isGroupQuery = true;
      }
    } catch (e) {
      pathString = 'Unknown';
    }

    // 2. NUCLEAR GUARD: Prevent root listing or malformed paths
    if (!isGroupQuery && (!pathString || pathString === '/' || pathString === '//' || pathString.includes('undefined'))) {
      setData(null);
      setIsLoading(false);
      return;
    }

    // 3. AUTH STABILITY CHECK:
    // Ensure Firebase Auth is settled before sending requests to Firestore.
    // This prevents transient permission errors during page load.
    const auth = getAuth();
    if (!auth.currentUser) {
      // Quietly wait for auth
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: WithId<T>[] = [];
        for (const doc of snapshot.docs) {
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (firestoreError: FirestoreError) => {
        // Construct detailed path for error reporting
        const finalPath = isGroupQuery ? `[Collection Group: ${pathString}]` : pathString;
        
        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path: finalPath,
        });

        // Do not throw or emit error if it's a known transient state
        if (auth.currentUser) {
          setError(contextualError);
          errorEmitter.emit('permission-error', contextualError);
        }
        
        setData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]);

  if(memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error('Target ref must be memoized with useMemoFirebase');
  }
  return { data, isLoading, error };
}
