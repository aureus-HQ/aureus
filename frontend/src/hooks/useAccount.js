import { useEffect, useState } from "react";
import { isConnected, getAddress, isAllowed } from "@stellar/freighter-api";

let address;

let addressLookup = (async () => {
  try {
    if (await isConnected() && await isAllowed()) {
      const addressResponse = await getAddress();
      return typeof addressResponse === 'string' ? addressResponse : addressResponse.address;
    }
  } catch (error) {
    console.warn('Failed to get address from Freighter:', error);
  }
  return undefined;
})();

// returning the same object identity every time avoids unnecessary re-renders
const addressObject = {
  address: '',
  displayName: '',
};

const addressToDisplayObject = (address) => {
  addressObject.address = address;
  addressObject.displayName = `${address.slice(0, 4)}...${address.slice(-4)}`;
  return addressObject;
};

/**
 * Returns an object containing `address` and `displayName` properties, with
 * the address fetched from Freighter's `getAddress` method in a
 * render-friendly way.
 *
 * Before the address is fetched, returns null.
 *
 * Caches the result so that the Freighter lookup only happens once, no matter
 * how many times this hook is called.
 *
 * NOTE: This does not update the return value if the user changes their
 * Freighter settings; they will need to refresh the page.
 */
export function useAccount() {
  const [, setLoading] = useState(address === undefined);

  useEffect(() => {
    if (address !== undefined) return;

    addressLookup
      .then(addr => { 
        if (addr) {
          address = addr;
        }
      })
      .finally(() => { 
        setLoading(false); 
      });
  }, []);

  if (address) return addressToDisplayObject(address);

  return null;
}

// Export function to reset the address (useful for disconnecting)
export function resetAccount() {
  address = undefined;
  addressLookup = (async () => {
    try {
      if (await isConnected() && await isAllowed()) {
        const addressResponse = await getAddress();
        return typeof addressResponse === 'string' ? addressResponse : addressResponse.address;
      }
    } catch (error) {
      console.warn('Failed to get address from Freighter:', error);
    }
    return undefined;
  })();
}
