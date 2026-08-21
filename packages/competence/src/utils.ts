import { getOwner, onCleanup, runWithOwner } from "solid-js";

/**
 * Returns an `onCleanup` variant bound to the owner active at call time.
 *
 * Solid 2 runs ref callbacks under a null owner (`runWithOwner(null)`), so a
 * plain `onCleanup` inside a ref callback warns `[NO_OWNER_CLEANUP]` and the
 * cleanup never runs. Capture the composable's owner instead and register
 * cleanups through it.
 */
export function createOwnerCleanup() {
  const owner = getOwner();
  return (fn: () => void) => {
    if (owner) runWithOwner(owner, () => onCleanup(fn));
    else onCleanup(fn);
  };
}
