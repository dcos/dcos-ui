import React, { useState, useEffect } from "react";
import { InfoBoxBanner } from "@dcos/ui-kit";
import { Trans } from "@lingui/macro";

function useNetworkOffline() {
  const [isOffline, setIsOffline] = useState(!window.navigator.onLine);

  const handleOffline = () => {
    setIsOffline(true);
  };

  const handleOnline = () => {
    setIsOffline(false);
  };

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  });

  return isOffline;
}

const OfflineBanner = () => {
  const isOffline = useNetworkOffline();

  return isOffline ? (
    <InfoBoxBanner
      appearance="warning"
      message={
        <Trans>
          Your computer seems to be offline. We will keep trying to reconnect.
        </Trans>
      }
    />
  ) : null;
};

export default OfflineBanner;
