import { Detail, DetailLabel, DetailValue } from "@app/components/v3";
import { TCapySync } from "@app/hooks/api/secretSyncs/types/capy-sync";

type Props = {
  secretSync: TCapySync;
};

export const CapySyncDestinationSection = ({ secretSync }: Props) => {
  const { destinationConfig } = secretSync;

  return (
    <Detail>
      <DetailLabel>Capy Project</DetailLabel>
      <DetailValue>{destinationConfig.projectName || destinationConfig.projectId}</DetailValue>
    </Detail>
  );
};
