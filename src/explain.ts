const LAMPORTS_PER_SOL = 1_000_000_000n;

interface Transfer {
  sender: string;
  receiver: string;
  lamports: bigint;
  signed: boolean;
}

// Liest eine mit `getTransaction` (Encoding jsonParsed) gespeicherte Transaktion
// und holt die SOL-Überweisung samt Unterschrift heraus.
function readTransfer(tx: any): Transfer {
  const message = tx?.transaction?.message;
  const instruction = (message?.instructions ?? []).find(
    (i: any) => i?.program === 'system' && i?.parsed?.type === 'transfer',
  );
  const info = instruction?.parsed?.info;

  if (info?.lamports === undefined || info?.lamports === null) {
    throw new Error('Kein SOL-Betrag gefunden: Die Datei enthält keine System-Überweisung.');
  }

  const sender: string | undefined = info.source;
  const receiver: string | undefined = info.destination;
  if (!sender || !receiver) {
    throw new Error('Absender oder Empfänger fehlt in der Überweisung.');
  }

  const senderKey = (message.accountKeys ?? []).find((k: any) => k?.pubkey === sender);
  const firstSignature: unknown = tx?.transaction?.signatures?.[0];
  const signed = senderKey?.signer === true && typeof firstSignature === 'string' && firstSignature.length > 0;

  return { sender, receiver, lamports: BigInt(info.lamports), signed };
}

// Rechnet Lamports exakt in SOL um; ohne Gleitkomma, mit deutschem Komma.
export function formatSol(lamports: bigint): string {
  const whole = lamports / LAMPORTS_PER_SOL;
  const fraction = (lamports % LAMPORTS_PER_SOL).toString().padStart(9, '0').replace(/0+$/, '');
  return fraction ? `${whole},${fraction} SOL` : `${whole} SOL`;
}

export function explain(tx: unknown): string {
  if ((tx as any)?.meta?.err != null) {
    return 'Die Transaktion ist fehlgeschlagen. Es wurde kein SOL überwiesen.';
  }

  const { sender, receiver, lamports, signed } = readTransfer(tx);

  if (!signed) {
    throw new Error('Keine gültige Unterschrift des Absenders gefunden.');
  }

  return (
    `Die Transaktion überweist ${formatSol(lamports)} von ${sender} an ${receiver}. ` +
    `Der Absender hat die Transaktion unterschrieben.`
  );
}
