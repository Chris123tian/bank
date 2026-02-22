
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

export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
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
        // Identify collectionGroup queries via internal path structure
        const internal = memoizedTargetRefOrQuery as unknown as InternalQuery;
        pathString = internal._query?.path?.canonicalString() || '[Collection Group]';
        // Group queries usually have a canonical path that is just the collection ID (no slashes)
        isGroupQuery = !pathString.includes('/') || pathString === '[Collection Group]';
      }
    } catch (e) {
      pathString = '[Unknown Path]';
    }

    // Defensive check: Block if path resolves to root or contains 'undefined' strings
    // which indicate malformed session state during hydration/routing.
    if (!isGroupQuery && (!pathString || pathString === '/' || pathString === '//' || pathString.includes('undefined'))) {
      setData(null);
      setIsLoading(false);
      return;
    }

    // Safety for group queries: if path contains 'undefined', the query is invalid.
    if (pathString.includes('undefined')) {
      setData(null);
      setIsLoading(false);
      return;
    }

    // Additional Layer: If this is an authenticated-only collection group query,
    // we wait for the Auth SDK to have a stable user before sending the request.
    const auth = getAuth();
    if (isGroupQuery && !auth.currentUser) {
      // If we are in an admin context or expected dashboard context, 
      // wait until auth.currentUser is populated to prevent 403 blocks.
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
        // Ensure pathString is descriptive for the contextual error report
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
