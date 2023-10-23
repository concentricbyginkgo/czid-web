import { Icon, Tooltip } from "@czi-sds/components";
import React from "react";
import { ANALYTICS_EVENT_NAMES, useTrackEvent } from "~/api/analytics";
import ThresholdFilterSDS from "~/components/common/filters/ThresholdFilterSDS";
import { useAllowedFeatures } from "~/components/common/UserContext";
import { Divider } from "~/components/layout";
import Link from "~/components/ui/controls/Link";
import { HEATMAP_KNOWN_PATHOGEN_FILTER } from "~/components/utils/features";
import { SelectedOptions, Subcategories } from "~/interface/shared";
import SamplesHeatmapBackgroundDropdown from "./components/SamplesHeatmapBackgroundDropdown";
import SamplesHeatmapCategoryDropdown from "./components/SamplesHeatmapCategoryDropdown";
import SamplesHeatmapPresetTooltip from "./components/SamplesHeatmapPresetTooltip";
import SamplesHeatmapTaxonSlider from "./components/SamplesHeatmapTaxonSlider";
import SamplesHeatmapTaxonTagCheckbox from "./components/SamplesHeatmapTaxonTagCheckbox";
import SamplesHeatmapViewOptionsDropdown from "./components/SamplesHeatmapViewOptionsDropdown";
import cs from "./samples_heatmap_filters.scss";
import { optionsToSDSFormat } from "./samplesHeatmapFilterUtils";

export interface SDSFormattedOption {
  name: string;
  text?: string;
  value?: number | string;
}

export interface TextValueString {
  text?: string;
  value?: string;
}

export interface TextValueNumber {
  text?: string;
  value?: number;
}

export interface OptionsType {
  metrics?: TextValueString[];
  categories?: string[];
  subcategories?: Subcategories | Record<string, never>;
  backgrounds?: {
    name?: string;
    value?: number;
  }[];
  taxonLevels?: TextValueNumber[];
  specificityOptions?: TextValueNumber[];
  sampleSortTypeOptions?: TextValueString[];
  taxaSortTypeOptions?: TextValueString[];
  sortTaxaOptions?: TextValueNumber[];
  thresholdFilters?: {
    operators?: string[];
    targets?: TextValueString[];
  };
  scales?: string[][];
  taxonsPerSample?: Record<string, number>;
}

export interface SamplesHeatmapFiltersPropsType {
  options?: OptionsType;
  selectedOptions?: SelectedOptions;
  onSelectedOptionsChange: $TSFixMeFunction;
  loading?: boolean;
  data?: Record<string, number[][]>;
  filteredTaxaCount?: number;
  totalTaxaCount?: number;
  prefilterConstants?: { topN: $TSFixMe; minReads: $TSFixMe };
  enableMassNormalizedBackgrounds?: boolean;
}

const SamplesHeatmapFilters = ({
  data,
  enableMassNormalizedBackgrounds,
  loading,
  options,
  selectedOptions,
  onSelectedOptionsChange,
}: SamplesHeatmapFiltersPropsType) => {
  const trackEvent = useTrackEvent();
  const allowedFeatures = useAllowedFeatures();

  const onTaxonLevelChange = (taxonLevel: SDSFormattedOption) => {
    const value = taxonLevel.value;
    if (selectedOptions.species === value) {
      return;
    }

    onSelectedOptionsChange({ species: value });
    trackEvent(
      ANALYTICS_EVENT_NAMES.SAMPLES_HEATMAP_CONTROLS_TAXON_LEVEL_SELECT_CHANGED,
      {
        value,
      },
    );
  };

  const renderTaxonLevelSelect = () => {
    const isPreset = selectedOptions.presets.includes("species");
    const disabled = loading || !data || isPreset;

    const taxonLevelSelect = (
      <SamplesHeatmapViewOptionsDropdown
        disabled={disabled}
        label="Taxon Level"
        onChange={onTaxonLevelChange}
        options={optionsToSDSFormat(options.taxonLevels)}
        selectedOptions={selectedOptions}
        selectedOptionsKey="species"
      />
    );

    if (isPreset) {
      return <SamplesHeatmapPresetTooltip component={taxonLevelSelect} />;
    } else {
      return taxonLevelSelect;
    }
  };

  const onMetricChange = (metric: SDSFormattedOption) => {
    const value = metric.value;
    if (value === selectedOptions.metric) {
      return;
    }

    onSelectedOptionsChange({ metric: value });
  };

  const renderMetricSelect = () => {
    return (
      <SamplesHeatmapViewOptionsDropdown
        disabled={loading || !data}
        label="Metric"
        onChange={onMetricChange}
        options={optionsToSDSFormat(options.metrics)}
        selectedOptions={selectedOptions}
        selectedOptionsKey="metric"
      />
    );
  };

  const onBackgroundChange = (background: number) => {
    if (background === selectedOptions.background) {
      return;
    }

    onSelectedOptionsChange({ background });
    trackEvent(
      ANALYTICS_EVENT_NAMES.SAMPLES_HEATMAP_CONTROLS_BACKGROUND_SELECT_CHANGED,
      {
        background,
      },
    );
  };

  const renderBackgroundSelect = () => {
    const isPreset = selectedOptions.presets.includes("background");
    const disabled = loading || !data || isPreset;

    const backgroundSelect = (
      <SamplesHeatmapBackgroundDropdown
        allBackgrounds={options.backgrounds}
        disabled={disabled}
        enableMassNormalizedBackgrounds={enableMassNormalizedBackgrounds}
        onChange={onBackgroundChange}
        value={selectedOptions.background}
      />
    );

    if (isPreset) {
      return <SamplesHeatmapPresetTooltip component={backgroundSelect} />;
    } else {
      return backgroundSelect;
    }
  };

  const onThresholdFilterApply = (thresholdFilters: $TSFixMe) => {
    onSelectedOptionsChange({ thresholdFilters });
    trackEvent(
      ANALYTICS_EVENT_NAMES.SAMPLES_HEATMAP_CONTROLS_THRESHOLD_FILTER_SELECT_APPLIED,
      {
        filters: thresholdFilters.length,
      },
    );
  };

  const renderThresholdFilterSelect = () => {
    const isPreset = selectedOptions.presets.includes("thresholdFilters");
    const disabled = loading || !data || isPreset;

    const thresholdSelect = (
      <>
        <ThresholdFilterSDS
          isDisabled={disabled}
          // @ts-expect-error Type 'TextValueString' is not assignable to type 'MetricOption'. Property 'text' is optional in type 'TextValueString' but required in type 'MetricOption'.ts(2322)
          metricOptions={options.thresholdFilters.targets}
          selectedThresholds={selectedOptions["thresholdFilters"]}
          onApply={onThresholdFilterApply}
        />
      </>
    );

    if (isPreset) {
      return <SamplesHeatmapPresetTooltip component={thresholdSelect} />;
    } else {
      return thresholdSelect;
    }
  };

  const renderCategoryFilter = () => {
    const isPreset =
      selectedOptions.presets.includes("categories") ||
      selectedOptions.presets.includes("subcategories");

    const disabled = loading || !data || isPreset;

    const categorySelect = (
      <SamplesHeatmapCategoryDropdown
        selectedOptions={selectedOptions}
        disabled={disabled}
        onSelectedOptionsChange={onSelectedOptionsChange}
        options={options}
      />
    );

    if (isPreset) {
      return <SamplesHeatmapPresetTooltip component={categorySelect} />;
    } else {
      return categorySelect;
    }
  };

  const onSpecificityChange = (specificity: SDSFormattedOption) => {
    const value = specificity.value;
    if (value === selectedOptions.readSpecificity) {
      return;
    }

    onSelectedOptionsChange({ readSpecificity: value });
  };

  const renderSpecificityFilter = () => {
    const isPreset = selectedOptions.presets.includes("readSpecificity");
    const disabled = loading || !data || isPreset;

    const readSpecificitySelect = (
      <SamplesHeatmapViewOptionsDropdown
        disabled={disabled}
        label="Read Specificity"
        onChange={onSpecificityChange}
        options={optionsToSDSFormat(options.specificityOptions)}
        selectedOptions={selectedOptions}
        selectedOptionsKey="readSpecificity"
      />
    );

    if (isPreset) {
      return <SamplesHeatmapPresetTooltip component={readSpecificitySelect} />;
    } else {
      return readSpecificitySelect;
    }
  };

  const onSortSamplesChange = (selectedSortType: SDSFormattedOption) => {
    const value = selectedSortType.value;
    if (value === selectedOptions.sampleSortType) {
      return;
    }

    onSelectedOptionsChange({ sampleSortType: value });
    trackEvent(
      ANALYTICS_EVENT_NAMES.SAMPLES_HEATMAP_CONTROLS_SORT_SAMPLES_SELECT_CHANGED,
      {
        sampleSortType: value,
      },
    );
  };

  const renderSortSamplesSelect = () => {
    return (
      <SamplesHeatmapViewOptionsDropdown
        disabled={loading || !data}
        label="Sort Samples"
        onChange={onSortSamplesChange}
        options={optionsToSDSFormat(options.sampleSortTypeOptions)}
        selectedOptions={selectedOptions}
        selectedOptionsKey="sampleSortType"
      />
    );
  };

  const onSortTaxaChange = (selectedSortType: SDSFormattedOption) => {
    const value = selectedSortType.value;
    if (value === selectedOptions.taxaSortType) {
      return;
    }

    onSelectedOptionsChange({ taxaSortType: value });
    trackEvent(
      ANALYTICS_EVENT_NAMES.SAMPLES_HEATMAP_CONTROLS_SORT_TAXA_SELECT_CHANGED,
      {
        taxaSortType: value,
      },
    );
  };

  const renderSortTaxaSelect = () => {
    return (
      <SamplesHeatmapViewOptionsDropdown
        disabled={loading || !data}
        label="Sort Taxa"
        onChange={onSortTaxaChange}
        options={optionsToSDSFormat(options.taxaSortTypeOptions)}
        selectedOptions={selectedOptions}
        selectedOptionsKey="taxaSortType"
      />
    );
  };

  const onDataScaleChange = (scaleIdx: SDSFormattedOption) => {
    const value = scaleIdx.value;
    if (value === selectedOptions.dataScaleIdx) {
      return;
    }

    onSelectedOptionsChange({ dataScaleIdx: value });
  };

  const renderScaleSelect = () => {
    const formatScaleOptions = (option: [string, string], idx: number) => {
      return { name: option[0], value: idx };
    };
    const scaleOptions = options.scales.map(formatScaleOptions);

    return (
      <SamplesHeatmapViewOptionsDropdown
        disabled={loading || !data}
        label="Scale"
        onChange={onDataScaleChange}
        options={scaleOptions}
        selectedOptions={selectedOptions}
        selectedOptionsKey="dataScaleIdx"
        customValueToNameFunction={(value: number, options) =>
          options[value].name
        }
      />
    );
  };

  const onTaxonsPerSampleEnd = (newValue: $TSFixMe) => {
    onSelectedOptionsChange({ taxonsPerSample: newValue });
    trackEvent(
      ANALYTICS_EVENT_NAMES.SAMPLES_HEATMAP_CONTROLS_TAXONS_PER_SAMPLE_SLIDER_CHANGED,
      {
        taxonsPerSample: newValue,
      },
    );
  };

  const renderTaxonsPerSampleSlider = () => {
    return (
      <SamplesHeatmapTaxonSlider
        isDisabled={loading || !data}
        max={options.taxonsPerSample.max}
        min={options.taxonsPerSample.min}
        onChangeCommitted={onTaxonsPerSampleEnd}
        value={selectedOptions.taxonsPerSample}
      />
    );
  };

  return (
    <div className={cs.panelContentsContainer}>
      <div className={cs.topFilterSection}>
        <div className={cs.sectionTitle}>
          Filters
          <Tooltip
            title={"Affects the underlying data that is shown in the heatmap."}
            placement="top-start"
            arrow
          >
            <span>
              <Icon
                sdsIcon="infoCircle"
                sdsSize="xs"
                sdsType="static"
                color="gray"
                shade={500}
                className={cs.infoIcon}
              />
            </span>
          </Tooltip>
        </div>
        <div className={cs.categoryDropdownContainer}>
          {renderCategoryFilter()}
        </div>

        <div className={cs.thresholdDropdownContainer}>
          {renderThresholdFilterSelect()}
        </div>
        {/* Contents stay the same; no new component */}
        <div className={cs.backgroundDropdownContainer}>
          {renderBackgroundSelect()}
        </div>
        <div className={cs.taxonSliderContainer}>
          {renderTaxonsPerSampleSlider()}
        </div>
        <div className={cs.viewOptionsDropdownContainer}>
          {renderSpecificityFilter()}
        </div>
        {allowedFeatures.includes(HEATMAP_KNOWN_PATHOGEN_FILTER) && (
          <div className={cs.taxonTagsContainer}>
            <span className={cs.filterTitle}>Pathogen Tag</span>
            <SamplesHeatmapTaxonTagCheckbox
              label={"Known Pathogens Only"}
              value={"known_pathogens"}
              selectedOptions={selectedOptions}
              onSelectedOptionsChange={onSelectedOptionsChange}
              showInfoIcon={true}
              infoIconTooltipContent={
                <span>
                  Organisms with known human pathogenicity based on{" "}
                  <Link external href="/pathogen_list">
                    CZ ID&#39;s current pathogen list.
                  </Link>{" "}
                  <br />
                  <br />
                  Please cross-reference the literature to verify tagged
                  pathogens.
                </span>
              }
              disabled={loading || !data}
            />
          </div>
        )}
      </div>
      <Divider />
      <div className={cs.lowerFilterSection}>
        <div className={cs.sectionTitle}>
          View Options
          <Tooltip
            title={"Affects how data is presented in the heatmap."}
            placement="top-start"
            arrow
          >
            <span>
              <Icon
                sdsIcon="infoCircle"
                sdsSize="xs"
                sdsType="static"
                color="gray"
                shade={500}
                className={cs.infoIcon}
              />
            </span>
          </Tooltip>
        </div>
        <div className={cs.viewOptionsDropdownContainer}>
          {renderTaxonLevelSelect()}
        </div>
        <div className={cs.viewOptionsDropdownContainer}>
          {renderMetricSelect()}
        </div>
        <div className={cs.viewOptionsDropdownContainer}>
          {renderSortSamplesSelect()}
        </div>
        <div className={cs.viewOptionsDropdownContainer}>
          {renderSortTaxaSelect()}
        </div>
        <div className={cs.viewOptionsDropdownContainer}>
          {renderScaleSelect()}
        </div>
      </div>
    </div>
  );
};

export { SamplesHeatmapFilters };
