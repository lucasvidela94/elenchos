import { useMutation } from '@tanstack/react-query';
import { createChallenge, loginWithSignature } from '../lib/api';

export function useChallenge() {
  return useMutation({
    mutationFn: createChallenge,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: loginWithSignature,
  });
}
