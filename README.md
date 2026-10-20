<img src="assets/icon.svg" width="64" height="64" alt="">

# receipt

Explain a saved Solana transaction in one short German paragraph.

```bash
npm install
npx tsx src/cli.ts explain fixtures/sol-transfer.json
```

The fixture is a made-up transfer of 1.5 SOL. It did not happen on mainnet. The paragraph names the sender, the receiver, the amount, and that the sender signed.

If `meta.err` is set, the paragraph says the transaction failed and does not claim that SOL moved.

```bash
npm test
```

MIT License.
