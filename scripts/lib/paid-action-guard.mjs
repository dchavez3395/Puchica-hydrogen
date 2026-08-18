export function requirePaidGenerationConfirmation(argv = process.argv.slice(2)) {
  const applyRequested = argv.includes('--apply');
  const confirmed = argv.includes('--confirm-paid-generation');

  if (!applyRequested || !confirmed) {
    throw new Error(
      'Paid image generation is disabled by default. Re-run with --apply ' +
        '--confirm-paid-generation only after reviewing the prompt, model, and cost.',
    );
  }
}
