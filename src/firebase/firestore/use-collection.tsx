
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

export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean})  | null | undefined,
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // NUCLEAR GUARD: Prevent root listing or undefined paths during initialization.
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      return;
    }

    let pathString = '';
    let isGroupQuery = false;
    
    try {
      if ('path' in memoizedTargetRefOrQuery) {
        pathString = (memoizedTargetRefOrQuery as CollectionReference).path;
      } else {
        // Extract collection ID for collectionGroup queries from internal SDK structure
        // This is primarily for descriptive error reporting.
        const q = memoizedTargetRefOrQuery as any;
        pathString = q._query?.path?.canonicalString() || 'Global';
        // If path has no segments, it's a collectionGroup query
        isGroupQuery = !pathString.includes('/');
      }
    } catch (e) {
      pathString = 'Unknown';
    }

    // Defensive check: Block if path resolves to root or contains 'undefined' strings
    if (!isGroupQuery && (!pathString || pathString === '/' || pathString === '//' || pathString.includes('undefined'))) {
      setData(null);
      setIsLoading(false);
      return;
    }

    // AUTH STABILITY GUARD:
    // Firebase initialization is asynchronous. We must ensure the Auth SDK has settled 
    // before sending queries, especially collection group queries which are highly sensitive.
    const auth = getAuth();
    if (!auth.currentUser) {
      // If we're not signed in yet, wait for the Auth provider to signal readiness.
      // This prevents transient "Missing Permissions" errors during page hydration.
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
        // Construct detailed audit path for error reporting
        const finalPath = isGroupQuery ? `[Collection Group: ${pathString}]` : pathString;
        
        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path: finalPath,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]);

  if(memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error('Target ref must be memoized with useMemoFirebase');
  }
  return { data, isLoading, error };
}
