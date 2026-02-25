import { isAddress, recoverMessageAddress } from 'viem';

export function buildChallengeMessage(purpose: string, nonce: string): string {
  return `ChainAudit:${purpose}:${nonce}`;
}

export async function verifyWalletSignature(
  wallet: string,
  message: string,
  signature: string
): Promise<boolean> {
  if (!isAddress(wallet)) {
    return false;
  }
  try {
    const recovered = await recoverMessageAddress({
      message,
      signature: signature as `0x${string}`,
    });
    return recovered.toLowerCase() === wallet.toLowerCase();
  } catch {
    return false;
  }
}
