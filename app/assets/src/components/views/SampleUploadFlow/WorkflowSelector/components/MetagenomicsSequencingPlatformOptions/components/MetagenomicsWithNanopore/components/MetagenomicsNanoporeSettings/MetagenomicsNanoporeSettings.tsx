import { Icon } from "czifui";
import React from "react";
import ColumnHeaderTooltip from "~/components/ui/containers/ColumnHeaderTooltip";
import { Dropdown } from "~/components/ui/controls/dropdowns";
import { GUPPY_BASECALLER_DOC_LINK } from "~/components/utils/documentationLinks";
import cs from "~/components/views/SampleUploadFlow/WorkflowSelector/workflow_selector.scss";
import { GUPPY_BASECALLER_SETTINGS } from "~/components/views/SampleUploadFlow/constants";

interface MetagenomicsNanoporeSettingsProps {
  selectedGuppyBasecallerSetting: string;
  onChangeGuppyBasecallerSetting(selected: string): void;
}

const MetagenomicsNanoporeSettings = ({
  selectedGuppyBasecallerSetting,
  onChangeGuppyBasecallerSetting,
}: MetagenomicsNanoporeSettingsProps) => (
  <div className={cs.technologyContent}>
    <div className={cs.item}>
      <div className={cs.subheader}>
        Guppy Basecaller Setting:
        <ColumnHeaderTooltip
          trigger={
            <span>
              <Icon
                sdsIcon="infoCircle"
                sdsSize="s"
                sdsType="interactive"
                className={cs.infoIcon}
              />
            </span>
          }
          content="Specifies which basecalling model of 'Guppy' was used to generate the data. This will affect the pipeline parameters."
          position="top center"
          link={GUPPY_BASECALLER_DOC_LINK}
        />
      </div>
      <Dropdown
        className={cs.dropdown}
        options={GUPPY_BASECALLER_SETTINGS}
        placeholder="Select"
        value={selectedGuppyBasecallerSetting}
        onChange={(value: string) => onChangeGuppyBasecallerSetting(value)}
      ></Dropdown>
    </div>
  </div>
);

export { MetagenomicsNanoporeSettings };
