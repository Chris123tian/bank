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
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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
  const [authReady, setAuthReady] = useState<boolean>(false);

  // 1. AUTH STABILITY LISTENER: Wait for auth to be fully initialized
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, () => {
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // 2. INPUT GUARD: Prevent execution if ref is missing
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      return;
    }

    // 3. AUTH GUARD: Wait for auth session to settle
    if (!authReady) {
      setData(null);
      setIsLoading(true); // Keep loading state until auth is confirmed
      return;
    }

    const auth = getAuth();
    if (!auth.currentUser) {
      setData(null);
      setIsLoading(false);
      return;
    }

    let pathString = '';
    let isGroupQuery = false;
    
    try {
      const q = memoizedTargetRefOrQuery as any;
      
      // Detection for collection groups
      if (q.type === 'query' && q._query?.collectionGroup) {
        isGroupQuery = true;
        pathString = q._query.collectionGroup;
      } else if (typeof q.path === 'string') {
        pathString = q.path;
      } else if (q._query?.path) {
        pathString = q._query.path.canonicalString();
      }
    } catch (e) {
      pathString = 'Query';
    }

    // 4. NUCLEAR GUARD: Prevent unauthorized root listing
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

        // Only report if still authenticated to avoid transient logout errors
        if (auth.currentUser) {
          setError(contextualError);
          errorEmitter.emit('permission-error', contextualError);
        }
        
        setData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery, authReady]);

  if(memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error('Target ref must be memoized with useMemoFirebase');
  }
  
  return { data, isLoading, error };
}