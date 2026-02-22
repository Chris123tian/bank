
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
    // 1. INPUT GUARD: Prevent execution if ref is missing
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      return;
    }

    let pathString = '';
    let isGroupQuery = false;
    let collectionGroupId = '';
    
    try {
      // Safely determine path and group status
      const q = memoizedTargetRefOrQuery as any;
      if ('path' in memoizedTargetRefOrQuery) {
        pathString = (memoizedTargetRefOrQuery as CollectionReference).path;
      } else {
        // Handle internal SDK query structure for path reporting
        pathString = q._query?.path?.canonicalString() || '';
        if (q._query?.collectionGroup || !pathString.includes('/')) {
          isGroupQuery = true;
          collectionGroupId = q._query?.collectionGroup || pathString;
        }
      }
    } catch (e) {
      pathString = 'Unknown';
    }

    // 2. NUCLEAR GUARD: Prevent root listing or malformed paths during initialization.
    if (!isGroupQuery && (!pathString || pathString === '/' || pathString === '//' || pathString.includes('undefined'))) {
      setData(null);
      setIsLoading(false);
      return;
    }

    // 3. AUTH STABILITY GUARD:
    // Ensure the Auth SDK has settled before sending queries. 
    // This prevents transient "Missing Permissions" errors during page hydration.
    const auth = getAuth();
    if (!auth.currentUser) {
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
        const finalPath = isGroupQuery 
          ? `[Collection Group: ${collectionGroupId || pathString || 'Global'}]` 
          : (pathString || '[Unknown Path]');
        
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
