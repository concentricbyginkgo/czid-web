import { cx } from "@emotion/css";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { SortableHeader } from "~/components/ui/Table/components/SortableHeader";
import { generateWidthStyles } from "~/components/ui/Table/tableUtils";
import rowStyles from "../components/StyledTableRow/styled_table_row.scss";
import { AmrResult } from "../types";
import cs from "./column_definitions.scss";
import { Align, getDefaultCell } from "./components/DefaultCell";
import { READS_COLUMN_TOOLTIP_STRINGS } from "./constants";

export const readsColumn: ColumnDef<AmrResult, any> = {
  id: "reads",
  accessorKey: "reads",
  size: 85,
  header: function readsHeader({ header, column }) {
    return (
      <SortableHeader
        className={cx(cs.rightAlignedHeader, rowStyles.readsColumnGroup)}
        header={header}
        style={generateWidthStyles(column)}
        tooltipStrings={READS_COLUMN_TOOLTIP_STRINGS}
      >
        Reads
      </SortableHeader>
    );
  },
  cell: getDefaultCell(Align.RIGHT, rowStyles.readsColumnGroup),
};