import type { Dispatch, FC, SetStateAction } from 'react';

import {
  PublicationReportingFraudSubreason,
  PublicationReportingIllegalSubreason,
  PublicationReportingSensitiveSubreason,
  PublicationReportingSpamSubreason
} from '@good/lens';
import { Select } from '@good/ui';

interface ReasonProps {
  setSubReason: Dispatch<SetStateAction<string>>;
  setType: Dispatch<SetStateAction<string>>;
  subReason: string;
  type: string;
}

const Reason: FC<ReasonProps> = ({
  setSubReason,
  setType,
  subReason,
  type
}) => {
  return (
    <div className="space-y-3">
      <div>
        <div className="label">Type</div>
        <Select
          onChange={(value) => setType(value)}
          options={[
            {
              disabled: true,
              label: 'Select type',
              value: 'Select type'
            },
            {
              label: 'Illegal',
              selected: type === 'illegalReason',
              value: 'illegalReason'
            },
            {
              label: 'Fraud',
              selected: type === 'fraudReason',
              value: 'fraudReason'
            },
            {
              label: 'Sensitive',
              selected: type === 'sensitiveReason',
              value: 'sensitiveReason'
            },
            {
              label: 'Spam',
              selected: type === 'spamReason',
              value: 'spamReason'
            }
          ]}
        />
      </div>
      {type ? (
        <div>
          <div className="label">Reason</div>
          <Select
            onChange={(value) => setSubReason(value)}
            options={[
              {
                disabled: true,
                label: 'Select reason',
                value: 'Select reason'
              },
              ...(type === 'illegalReason'
                ? [
                    {
                      label: 'Animal abuse',
                      selected:
                        subReason ===
                        PublicationReportingIllegalSubreason.AnimalAbuse,
                      value: PublicationReportingIllegalSubreason.AnimalAbuse
                    },
                    {
                      label: 'Direct threat',
                      selected:
                        subReason ===
                        PublicationReportingIllegalSubreason.DirectThreat,
                      value: PublicationReportingIllegalSubreason.DirectThreat
                    },
                    {
                      label: 'Human abuse',
                      selected:
                        subReason ===
                        PublicationReportingIllegalSubreason.HumanAbuse,
                      value: PublicationReportingIllegalSubreason.HumanAbuse
                    },
                    {
                      label: 'Threat individual',
                      selected:
                        subReason ===
                        PublicationReportingIllegalSubreason.ThreatIndividual,
                      value:
                        PublicationReportingIllegalSubreason.ThreatIndividual
                    },
                    {
                      label: 'Violence',
                      selected:
                        subReason ===
                        PublicationReportingIllegalSubreason.Violence,
                      value: PublicationReportingIllegalSubreason.Violence
                    },
                    {
                      label: 'Intellectual property',
                      selected:
                        subReason ===
                        PublicationReportingIllegalSubreason.IntEllEctualProperty,
                      value:
                        PublicationReportingIllegalSubreason.IntEllEctualProperty
                    }
                  ]
                : []),
              ...(type === 'fraudReason'
                ? [
                    {
                      label: 'Scam',
                      selected:
                        subReason === PublicationReportingFraudSubreason.Scam,
                      value: PublicationReportingFraudSubreason.Scam
                    },
                    {
                      label: 'Impersonation',
                      selected:
                        subReason ===
                        PublicationReportingFraudSubreason.Impersonation,
                      value: PublicationReportingFraudSubreason.Impersonation
                    }
                  ]
                : []),
              ...(type === 'sensitiveReason'
                ? [
                    {
                      label: 'NSFW',
                      selected:
                        subReason ===
                        PublicationReportingSensitiveSubreason.Nsfw,
                      value: PublicationReportingSensitiveSubreason.Nsfw
                    },
                    {
                      label: 'Offensive',
                      selected:
                        subReason ===
                        PublicationReportingSensitiveSubreason.Offensive,
                      value: PublicationReportingSensitiveSubreason.Offensive
                    }
                  ]
                : []),
              ...(type === 'spamReason'
                ? [
                    {
                      label: 'Fake engagement',
                      selected:
                        subReason ===
                        PublicationReportingSpamSubreason.FakeEngagement,
                      value: PublicationReportingSpamSubreason.FakeEngagement
                    },
                    {
                      label: 'Low signal',
                      selected:
                        subReason ===
                        PublicationReportingSpamSubreason.LowSignal,
                      value: PublicationReportingSpamSubreason.LowSignal
                    },
                    {
                      label: 'Algorithm manipulation',
                      selected:
                        subReason ===
                        PublicationReportingSpamSubreason.ManipulationAlgo,
                      value: PublicationReportingSpamSubreason.ManipulationAlgo
                    },
                    {
                      label: 'Misleading',
                      selected:
                        subReason ===
                        PublicationReportingSpamSubreason.Misleading,
                      value: PublicationReportingSpamSubreason.Misleading
                    },
                    {
                      label: 'Misuse hashtags',
                      selected:
                        subReason ===
                        PublicationReportingSpamSubreason.MisuseHashtags,
                      value: PublicationReportingSpamSubreason.MisuseHashtags
                    },
                    {
                      label: 'Repetitive',
                      selected:
                        subReason ===
                        PublicationReportingSpamSubreason.Repetitive,
                      value: PublicationReportingSpamSubreason.Repetitive
                    },
                    {
                      label: 'Something else',
                      selected:
                        subReason ===
                        PublicationReportingSpamSubreason.SomethingElse,
                      value: PublicationReportingSpamSubreason.SomethingElse
                    },
                    {
                      label: 'Unrelated',
                      selected:
                        subReason ===
                        PublicationReportingSpamSubreason.Unrelated,
                      value: PublicationReportingSpamSubreason.Unrelated
                    }
                  ]
                : [])
            ]}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Reason;
