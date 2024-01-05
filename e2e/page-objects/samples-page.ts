import { expect } from "@playwright/test";

import { kebabCase } from "lodash";
// #region constants
import {
  ANNOTATION_TEXT,
  APPLY,
  APPLY_BUTTON,
  ARCHAEA_FILTER,
  BACTERIA_FILTER,
  X_CLOSE_ICON,
  CATEGORIES_FILTER,
  COLUMNS_LABEL,
  EUKARYOTA_FILTER,
  FILTER_TAG,
  LEARN_MORE_LINK,
  NUMBER_INPUT,
  READ_SPECIFICITY,
  SEARCH_BAR,
  SEARCH_RESULT,
  SEARCH_RESULT_TITLE,
  FILTERS_DROPDOWN,
  THRESHOLD_FILTER,
  THRESHOLD_OPTION_FILTER,
  TOTAL_READ_POPOUP_CONTENT,
  UNCATEGORIZED_FILTER,
  VIROIDS_FILTER,
  VIRUSES_FILTER,
  VIRUSES_PHAGE_FILTER,
  NAME_TYPE_FILTER,
  NAME_TYPE_FILTER_VALUE,
  TAXONS,
} from "../constants/sample";
// #endregion constants

import { ArticlesPage } from "./articles-page";
import { PageObject } from "./page-object";
import { ProjectPage } from "./project-page";
const TAXON_HOVER_ACTIONS = (taxonName: string) => `//span[text()='${taxonName}']/parent::div//span[@data-testid='hover-actions']//button`;
const COVERAGE_VIZ_HISTOGRAM_LOCATOR = "[class*='coverageVizHistogram']";
const ACTION_BUTTONS_LOCATOR = "[class*='actionIcons'] button";
const BLAST_SELECTION_MODAL_TESTID = "blast-selection-modal";
const BLAST_SELECTION_OPTIONS = "[data-testid='blast-selection-modal'] [class*='optionText'] [class*='title']";
const BLAST_TYPES = ["blastn", "blastx"];
const REPORT_TABLE_ROWS = "[class*='reportTable'] [role='row']";

export class SamplesPage extends PageObject {

    private CategoryDataIds = {
      "Archaea": ARCHAEA_FILTER,
      "Bacteria": BACTERIA_FILTER,
      "Eukaryota": EUKARYOTA_FILTER,
      "Viroids": VIROIDS_FILTER,
      "Viruses": VIRUSES_FILTER,
      "Phage": VIRUSES_PHAGE_FILTER,
      "Uncategorized": UNCATEGORIZED_FILTER,
    };

    // #region Navigate
    public async navigate(sampleId: number) {
      await this.page.goto(`${process.env.BASEURL}/samples/${sampleId}`);
    }
    // #endregion Navigate

    // #region Get
    public async getReportFilterTable() {
      const tableHeaders = await this.page.locator("[class*='Table__headerColumn']").allTextContents();
      const tableRowElements = await this.page.locator(REPORT_TABLE_ROWS).all();
      const tableRowsText = [];
      for (const row of tableRowElements) {
        const td = await row.locator("[aria-colindex]").allTextContents();
        const tdValues = {};
        for (let i = 0; i < td.length; i++) {
          tdValues[tableHeaders[i]] = td[i];
        }
        if (Object.keys(tdValues).length > 0) {
          tableRowsText.push(tdValues);
        }
      }
      return tableRowsText;
    }

    public async getWaitForReportError(sampleId: number) {
      const startTime = Date.now();
      const timeout = 30000;
      let report = null;
      while ((Date.now() - startTime) < timeout) {
        report = await this.getReportV2(sampleId);
        if (report.error !== undefined) {
          break;
        }
        await this.pause(1);
      }
      return report;
    }

    public async getReportV2(sampleId: number) {
      const response = await this.page.context().request.get(
        `${process.env.BASEURL}/samples/${sampleId}/report_v2.json?&id=${sampleId}`,
      );
      return response.json();
    }

    public async getSamples(projectName = null, sampleName = null) {
      const urlParams = new URLSearchParams();
      let project = null;
      if (projectName !== null) {
        const projectPage = new ProjectPage(this.page);
        project = await projectPage.getProjectByName(projectName);
        if (project !== null) {
          urlParams.append("projectId", project.id);
        }
      }
      if (sampleName !== null) {
        urlParams.append("search", sampleName);
      }

      const params = Array.from(urlParams.entries()).length > 0 ? `?${urlParams.toString()}` : "";
      const requestUrl = `${process.env.BASEURL}/samples/index_v2.json${params}`;
      const response = await this.page.context().request.get(requestUrl);
      const responseJson = await response.json();

      let samples = await responseJson.samples;
      if (project !== null) {
        samples = await samples.filter(s => s.project_id === project.id);
      }
      return samples;
    }

    public async getCompletedSamples(projectName = null) {
      const samples = await this.getSamples(projectName);
      const completedSamples = [];
      for (const sample of samples) {
        if (sample.details.mngs_run_info && sample.details.mngs_run_info.result_status_description === "COMPLETE") {
            completedSamples.push(sample);
        }
      }
      return completedSamples;
    }

    public async getRandomCompletedSample(projectName = null) {
      const samples = await this.getCompletedSamples(projectName);
      return samples[Math.floor(Math.random() * samples.length)];
    }

    public async getTaxonNamesFromReport(sampleReport: any) {
      const taxonNames = {
        "Scientific": [],
        "Common": [],
      };
      const taxons = await this.getTaxonsFromReport(sampleReport);
      for (const taxon of taxons) {
        if (taxon.name && taxon.name.trim() !== "") {
          taxonNames.Scientific.push(taxon.name);
        }
        if (taxon.common_name && taxon.common_name.trim() !== "") {
          taxonNames.Common.push(taxon.common_name);
        }
      }
      return taxonNames;
    }

    public async getTaxonsFromReport(sampleReport: any) {
      const taxons = [];
      for (const key in sampleReport.counts) {
        for (const taxonId in sampleReport.counts[key]) {
          const taxon = sampleReport.counts[key][taxonId];
          taxon.id = taxonId;
          if (taxon.name.split(" ").length >= 1) {
            taxon.rank = "species";
          } else {
            taxon.rank = "genius";
          }
          taxons.push(taxon);
        }
      }
      return taxons;
    }

    public async getTaxonsByCategory(sampleReport: any, categories: string[]) {
      const taxons = await this.getTaxonsFromReport(sampleReport);
      const lowerCaseCategories = categories.map(category => `${category}`.toLowerCase());

      return taxons.filter(taxon =>
        taxon.category && lowerCaseCategories.some(category => `${taxon.category}`.toLowerCase() === category),
      );
    }

    public async getTaxonCategories(sampleReport: any) {
      const taxons = await this.getTaxonsFromReport(sampleReport);
      const taxonCategories = [];
      for (const taxon of taxons) {
        if (taxon.category && !taxonCategories.includes(taxon.category)) {
          taxonCategories.push(taxon.category);
        }
      }
      return taxonCategories;
    }

    public async getSpecificTaxons(sampleReport: any) {
      const taxons = await this.getTaxonsFromReport(sampleReport);
      return taxons.filter(taxon => taxon.category);
    }

    public async getTaxonNamesFromReportByCategory(sampleReport: any, categories: string[]) {
      const taxons = await this.getTaxonsByCategory(sampleReport, categories);
      return taxons.map(taxon => taxon.name);
    }

    public async getNameTypeFilterValue() {
      return this.page.locator(NAME_TYPE_FILTER_VALUE).textContent();
    }

    public async getTaxonElementByName(name: string) {
      return this.page.locator(`${TAXONS}:text("${name}")`).first();
    }

    public async getTaxonElements() {
      await this.page.locator(TAXONS).first().waitFor({state: "visible"});
      return this.page.locator(TAXONS).all();
    }

    public async getFilterTagElements() {
      await this.page.waitForSelector(FILTER_TAG, { state: "visible" });
      return this.page.locator(FILTER_TAG).all();
    }

    public async getFilterTagsText() {
      const filterTagElements = await this.getFilterTagElements();;
      const filterTags: string[] = [];

      for (const element of filterTagElements) {
        const tagText = await element.textContent();
        filterTags.push(tagText);
      }
      return filterTags;
    }

    public async getReadSpecificityFilterValue() {
      return this.page.locator(`${READ_SPECIFICITY} + span`).textContent();
    }

    public async getAllColumnText() {
      return this.page.locator(COLUMNS_LABEL).allInnerTexts();
    }

    public async getSearchResults() {
      const searchResults = await this.page.locator(SEARCH_RESULT_TITLE).all();
      const searchResultsArray = [];
      for (const searchResult of searchResults) {
        searchResultsArray.push(await searchResult.textContent());
      }
      return searchResultsArray;
    }
    // #endregion Get

    // #region Click
    public async clickExpandAll() {
      await this.page.getByTestId("expand-taxon-parent-all").click();
    }

    public async clickLearnMoreLink() {
      const [newPage] = await Promise.all([
        this.page.context().waitForEvent("page"),
        await this.page.locator(LEARN_MORE_LINK).click(),
      ]);
      await newPage.waitForLoadState();
      return new ArticlesPage(newPage);
    }

    public async clickCategoriesFilter() {
      await this.page.locator(CATEGORIES_FILTER).click();
    }

    public async clickCategoriesOption(option: string) {
      await this.page.locator(this.CategoryDataIds[option]).click();
    }

    public async clickThresholdFilter() {
      await this.page.locator(THRESHOLD_FILTER).click();
    }

    public async clickApplyThresholdFilter() {
      await this.page.waitForSelector(APPLY_BUTTON, { state: "visible" });
      await this.page.locator(APPLY_BUTTON).locator(APPLY).click();
    }

    public async clickThresholdOptionFilter() {
      await this.page.locator(THRESHOLD_OPTION_FILTER).first().click();
    }

    public async clickThresholdComparisonOperatorFilter() {
      await this.page.locator(THRESHOLD_OPTION_FILTER).last().click();
      await this.pause(0.2);
    }

    public async clickThresholdComparisonOperatorOption(option: string) {
      await this.page.locator(`${FILTERS_DROPDOWN} [role="option"]`).getByText(option).click();
    }

    public async clickThresholdOption(option: string) {
      await this.page.getByTestId(kebabCase(option)).click();
    }

    public async clickReadSpecificityFilter() {
      await this.page.locator(READ_SPECIFICITY).click();
    }

    public async clickReadSpecificityOption(option: string) {
      await this.page.getByTestId(kebabCase(option)).click();
    }

    public async clickNameTypeFilter() {
      await this.page.locator(NAME_TYPE_FILTER).click();
    }

    public async clickNameTypeOption(option: string) {
      await this.page.getByTestId(kebabCase(option)).click();
    }

    public async clickSearchResult(text: string) {
      await this.page.locator(SEARCH_RESULT).getByText(text, {exact: true}).first().click();
    }

    public async clickAnnotationFilter() {
      await this.page.locator(ANNOTATION_TEXT).click();
    }

    public async clickAnnotationFilterOption(option: string) {
      await this.page.getByTestId(`dropdown-${kebabCase(option)}`).click();
    }

    public async clickFilterTagCloseIcon(text: string) {
      await this.page.locator(`${FILTER_TAG}:text('${text}') ${X_CLOSE_ICON}`).click();
    }

    public async clickTableHeaderByIndex(index: number) {
      await this.page.locator(COLUMNS_LABEL).nth(index).click();
    }

    public async clickTableRowByIndex(index: number) {
      await this.page.locator(REPORT_TABLE_ROWS).nth(index).click();
    }

    public async ClickSortByName() {
      await this.clickTableHeaderByIndex(0);
    }

    public async clickClearFilters() {
      await this.page.locator(`text="Clear Filters"`).click();
    }

    public async clickSearchBar() {
      await this.page.locator(SEARCH_BAR).click();
    }

    public async clickTaxonCoverageVisualisation(taxonName: string) {
      const taxonElement = await this.getTaxonElementByName(taxonName);
     await taxonElement.hover();

     const hoverElement = this.page.locator(TAXON_HOVER_ACTIONS(taxonName)).first();

     await hoverElement.hover();
     await hoverElement.click();
    }

    public async clickBlastButton() {
      const blastIcon = this.page.locator(ACTION_BUTTONS_LOCATOR).first();
      await blastIcon.click();
    }

    public async clickContigFastaButton() {
      const downloadContigFastaButton = this.page.locator(ACTION_BUTTONS_LOCATOR).nth(1);
      await downloadContigFastaButton.click();
    }
    // #endregion Click

    // #region Fill
    public async fillSearchBar(value: string) {
      await this.page.locator(SEARCH_BAR).fill(value);
      await this.pause(1);
    }

    public async fillThresholdValue(value: number) {
      await this.page.waitForSelector(NUMBER_INPUT, { state: "visible" });
      await this.page.locator(NUMBER_INPUT).fill(value.toString());
    }
    // #endregion Fill

    // #region Macro
    public async isTaxonVisible(name: string) {
      const reportTableRowIndexAttribute = "aria-rowindex";
      const taxonLocatorString = `${TAXONS}:text("${name}")`;
      const taxonElement = this.page.locator(taxonLocatorString).first();

      if (!(await taxonElement.isVisible())) {
        await this.clickTableRowByIndex(0);
        await this.scrollUpToElement(
          `[${reportTableRowIndexAttribute}="1"]`, REPORT_TABLE_ROWS, reportTableRowIndexAttribute);

        await this.scrollDownToElement(
          taxonLocatorString, REPORT_TABLE_ROWS, reportTableRowIndexAttribute);
      }

      return taxonElement.isVisible();
    }

    public async toggleSortByName() {
      await this.ClickSortByName();
      await this.ClickSortByName();
    }

    public async hoverOverColumnByIndex(index: number) {
      await this.page.locator(COLUMNS_LABEL).nth(index).hover();
    }

    public async removeFilterTags(tags: string[]) {
      for (const tag of tags) {
        await this.clickFilterTagCloseIcon(tag);
      }
    }

    public async selectThresholdOptions(thresholdOption: string, comparisonOperator: string, thresholdValue: number) {
      await this.clickThresholdFilter();

      // #region Threshold Option
      await this.clickThresholdOptionFilter();
      await this.clickThresholdOption(thresholdOption);
      // #endregion Threshold Option

      // #region Threshold Comparison Operator
      await this.clickThresholdComparisonOperatorFilter();
      await this.clickThresholdComparisonOperatorOption(comparisonOperator);
      // #endregion Threshold Comparison Operator

      // #region Threshold Value
      await this.fillThresholdValue(thresholdValue);
      // #endregion Threshold Value

      await this.clickApplyThresholdFilter();
    }

    public async selectReadSpecificityOption(option: string) {
      await this.clickReadSpecificityFilter();
      await this.clickReadSpecificityOption(option);
    }

    public async selectNameTypeOption(option: string) {
      await this.clickNameTypeFilter();
      await this.clickNameTypeOption(option);
    }

    public async selectAnnotationFilter(option: string) {
      await this.clickAnnotationFilter();
      await this.clickAnnotationFilterOption(option);
    }

    public async selectCategoryFilter(option: string) {
      await this.clickCategoriesFilter();

      // Get the checkbox element
      // So we don't select if it's already selected
      const checkBox = this.page.locator(this.CategoryDataIds[option]) // option label
        .locator("..") // parent node
        .locator("[data-testid='checked']"); // Checkbox
      const checkBoxClass = await checkBox.getAttribute("class");

      if (!checkBoxClass.includes("checked")) {
        await this.clickCategoriesOption(option);
      }
      await this.pressEscape();
    }

    public async filterByName(name: string, searchResultText: string) {
      await this.fillSearchBar(name);
      await this.clickSearchBar();
      await this.clickSearchResult(searchResultText);
    }
    // #endregion Macro

    // #region Validation
    public async validateContigFastaDownload(sample: any, taxon: any) {
      const downloadPromise = this.page.waitForEvent("download");
      await this.clickContigFastaButton();
      const download = await downloadPromise;

      const expectedFileName = `${sample.name}_tax_${taxon.id}_contigs.fasta`;
      expect(expectedFileName).toMatch(download.suggestedFilename());
    }

    public async validateBlastSelectionModalVisible() {
      await expect(this.page.getByTestId(BLAST_SELECTION_MODAL_TESTID)).toBeVisible();
      const blastSelectionOptions = await this.page.locator(BLAST_SELECTION_OPTIONS).allTextContents();
      expect(BLAST_TYPES).toEqual(blastSelectionOptions);
    }

    public async validateCoverageVisualisationVisible(taxonName: string) {
      const taxonCoverageLabel = `${taxonName} Coverage`;

      // A popup showing the coverage visualisation for that specific organism should be showed
      await expect(this.page.locator(`text=${taxonCoverageLabel}`)).toBeVisible();
      await expect(this.page.locator(COVERAGE_VIZ_HISTOGRAM_LOCATOR)).toBeVisible();
    }

    public async validateTotalReadPopupTest(expectedText: string) {
      await expect(this.page.locator(TOTAL_READ_POPOUP_CONTENT)).toHaveText(expectedText);
    }

    public async validateColumnsVisible() {
      await expect(this.page.locator(COLUMNS_LABEL).nth(1)).toBeVisible();
    }

    public async validateFilterTagCount(expectedCount: number) {
      await expect(this.page.locator(FILTER_TAG)).toHaveCount(expectedCount);
    }

    public async validateStatsInfoNotEmpty() {
      await expect(this.page.getByTestId("stats-info")).not.toBeEmpty();
    }

    public async validateCategoryFilterAvailable(categoryName: string) {
      await expect(this.page.locator(this.CategoryDataIds[categoryName])).toBeVisible();
    }

    public async validateFilterTagVisiblity(expectedTagName: string, toBeVisible=true) {
      const tagLocator = this.page.locator(FILTER_TAG).locator(`text="${expectedTagName}"`);
      if (toBeVisible) {
        await expect(tagLocator).toBeVisible();
      } else {
        await expect(tagLocator).not.toBeVisible();
      }
    }

    public async validateReportFilteredThreshold(thresholdOption: string, comparisonOperator: string, thresholdValue: number) {
      const reportFilterTable = await this.getReportFilterTable();
      for (const row of reportFilterTable) {
        // TODO: Expand to include sampleReport api for values like "NT Z Score"
        if (row[thresholdOption] !== undefined) {
          const actualValue = row[thresholdOption] === "-" ? 0 : row[thresholdOption];
          if (comparisonOperator === "<=") {
            expect(actualValue).toBeLessThanOrEqual(thresholdValue);
          } else if (comparisonOperator === ">=") {
            expect(actualValue).toBeGreaterThanOrEqual(thresholdValue);
          } else {
            throw new Error(`Unexpected comparisonOperator: ${comparisonOperator}`);
          }
        }
      }
    }

    public async validateThresholdOptionFilterHasExpectedOptions(expectedThresholdOptions: any) {
      await this.clickThresholdFilter(); // Open the filter dropdown
      await this.clickThresholdOptionFilter();
      for (const expectedOption of expectedThresholdOptions) {
        expect(this.page.getByTestId("dropdown-menu").getByText(expectedOption.text).first()).toBeVisible();
      }
      await this.clickThresholdFilter(); // Close the filter dropdown
    }

    public async validateReportFilteredByNameType(nameTypeOption: string, expectedTaxonNames: []) {
      // Assert the filter section updated
      expect(
        (await this.getNameTypeFilterValue()).match(nameTypeOption),
      );
      // Assert the taxon common_names are on the page
      for (const taxonName of expectedTaxonNames) {
        expect(await this.getTaxonElementByName(taxonName)).toBeTruthy();
      }
    }

    public async validateFilterTags(expectedfilterTags: string[]) {
      const foundTags = await this.getFilterTagsText();
      expect(expectedfilterTags, `Expected: ${expectedfilterTags}, Got: ${foundTags}`).toEqual(foundTags);
    }

    public async validateTaxonsFilteredByName(expectedTaxonName: string) {
      const taxonElements = await this.getTaxonElements();
      const taxonNames = [];
      for (const taxonElement of taxonElements) {
        taxonNames.push(await taxonElement.textContent());
      }
      expect(taxonNames.join(",")).toContain(expectedTaxonName);
    }

    public async validateAnnotationFiltersHasExpectedOptions(expectedAnnotationOptions: string[]) {
      await this.clickAnnotationFilter(); // Open the filter dropdown
      for (const expectedOption of expectedAnnotationOptions) {
        expect(this.page.getByTestId(`dropdown-${kebabCase(expectedOption)}`)).toBeVisible();
      }
      await this.clickAnnotationFilter(); // Close the filter dropdown
    }

    public async validateReadSpecificityFiltersHasExpectedOptions(expectedReadSpecificityOptions: string[]) {
      await this.clickReadSpecificityFilter(); // Open the filter dropdown
      for (const expectedOption of expectedReadSpecificityOptions) {
        expect(this.page.getByTestId(`dropdown-${kebabCase(expectedOption)}`)).toBeTruthy();
      }
      await this.clickReadSpecificityFilter(); // Close the filter dropdown
    }

    public async validateReportFilteredByReadSpecificity(readSpecificityOption: string, expectedTaxonNames: []) {
      // Assert the filter section updated
      expect(
        (await this.getReadSpecificityFilterValue()).match(readSpecificityOption),
      );
      // Assert the taxon common_names are on the page
      await this.validateTaxonsArePresent(expectedTaxonNames);
    }

    public async validateTaxonsArePresent(expectedTaxonNames: []) {
      for (const taxonName of expectedTaxonNames) {
        expect(await this.getTaxonElementByName(taxonName)).toBeTruthy();
      }
    }

    public async validateTaxonIsVisible(name: string) {
      expect(await this.isTaxonVisible(name)).toBeTruthy();
    }

    public async validateTaxonsAreVisible(taxonNames: string[]) {
      for (const taxonName of taxonNames) {
        const taxonWithoutSpecies = taxonName.includes("(") ? taxonName.slice(0, taxonName.lastIndexOf("(")).trim() : taxonName;
        await this.validateTaxonIsVisible(taxonWithoutSpecies);
      }
    }

    public async validateReportFilteredByAnnotation(expectedAnnotationFilters: string[]) {
      for (const annotationFilter of expectedAnnotationFilters) {
        await this.selectAnnotationFilter(annotationFilter);
        await this.validateFilterTags([annotationFilter]);

        // TODO: Expand this validation to check each taxon in the report table matches the annotation criteria
        // Question: Is this functionality missing in stage?

        await this.clickTableHeaderByIndex(0); // Closes the annotation filter options
        await this.clickFilterTagCloseIcon(annotationFilter);
      }
    }
    // #endregion Validation
}