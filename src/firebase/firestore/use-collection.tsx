
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
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useFirebase } from '@/firebase/provider';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook to listen to a Firestore collection or query.
 * Optimized to use global auth readiness from context for faster initialization.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean})  | null | undefined,
): UseCollectionResult<T> {
  const { isAuthReady, user } = useFirebase();
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

    // 2. AUTH STABILITY GUARD: Wait for global auth readiness from provider
    if (!isAuthReady) {
      setData(null);
      setIsLoading(true);
      return;
    }

    if (!user) {
      setData(null);
      setIsLoading(false);
      return;
    }

    let pathString = '';
    let isGroupQuery = false;
    
    try {
      const q = memoizedTargetRefOrQuery as any;
      
      if (typeof q.path === 'string') {
        pathString = q.path;
      } else if (q._query?.path) {
        pathString = q._query.path.canonicalString();
      }

      if (q.type === 'query' && q._query?.collectionGroup) {
        isGroupQuery = true;
        pathString = q._query.collectionGroup;
      } else if (!q.path && q._query?.path) {
        const segments = q._query.path.segments;
        if (segments && segments.length > 0) {
          pathString = segments[segments.length - 1];
        }
      }
    } catch (e) {
      pathString = 'Query';
    }

    // 3. NUCLEAR GUARD: Prevent unauthorized root listing or malformed paths
    if (!isGroupQuery && (!pathString || pathString === '/' || pathString === '//' || pathString.includes('undefined'))) {
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
        const finalPath = isGroupQuery ? `[Collection Group: ${pathString}]` : (pathString || '[Unknown Path]');
        
        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path: finalPath,
        });

        if (user) {
          setError(contextualError);
          errorEmitter.emit('permission-error', contextualError);
        }
        
        setData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery, isAuthReady, user]);

  if(memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error('Target ref must be memoized with useMemoFirebase');
  }
  
  return { data, isLoading, error };
}
